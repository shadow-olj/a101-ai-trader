from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import sys
import logging
import json
from dotenv import load_dotenv

# Configure logging - console only, no file output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ],
    force=True
)

# Remove any existing file handlers
root_logger = logging.getLogger()
for handler in root_logger.handlers[:]:
    if isinstance(handler, logging.FileHandler):
        root_logger.removeHandler(handler)
        handler.close()

logger = logging.getLogger(__name__)

# Reduce noise from watchfiles
logging.getLogger('watchfiles').setLevel(logging.WARNING)

# Test output
sys.stdout.write("=" * 60 + "\n")
sys.stdout.write("🔧 Backend module loaded\n")
sys.stdout.write("=" * 60 + "\n")
sys.stdout.flush()

from trading.aster_client import AsterDEXClient, OrderSide, OrderType, PositionSide
from ai.intent_parser import IntentParser, TradingIntent, IntentFormatter
from trading.risk_manager import RiskManager

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Aster AI Trader",
    description="Natural language trading interface for AsterDEX",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("🚀 Aster AI Trader Backend Started!")
    logger.info("📡 Listening on http://0.0.0.0:8000")
    logger.info("=" * 60)

# CORS middleware - MUST be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global exception handler
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are always present"""
    print(f"[ERROR] Global exception: {str(exc)}")
    import traceback
    traceback.print_exc()
    
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Global instances
aster_client: Optional[AsterDEXClient] = None
intent_parser: Optional[IntentParser] = None
risk_manager: Optional[RiskManager] = None


def get_aster_client() -> AsterDEXClient:
    """Get AsterDEX client instance"""
    global aster_client
    if aster_client is None:
        api_key = os.getenv("ASTER_API_KEY", "")
        api_secret = os.getenv("ASTER_API_SECRET", "")
        
        print(f"[DEBUG] ASTER_API_KEY from env: {api_key[:20]}..." if api_key else "[DEBUG] ASTER_API_KEY is empty", flush=True)
        
        if not api_key or not api_secret or api_key.startswith("your_"):
            print("[WARNING] Using demo mode - AsterDEX API credentials not configured", flush=True)
            # Use dummy credentials for demo mode
            api_key = "demo_key"
            api_secret = "demo_secret"
        else:
            print("[INFO] Using real AsterDEX API credentials", flush=True)
        
        aster_client = AsterDEXClient(api_key, api_secret)
    
    return aster_client


def get_intent_parser() -> IntentParser:
    """Get intent parser instance"""
    global intent_parser
    if intent_parser is None:
        openai_key = os.getenv("OPENAI_API_KEY", "")
        
        if not openai_key or openai_key.startswith("your_"):
            print("[WARNING] Using demo mode - OpenAI API key not configured")
            openai_key = "demo_key"
        
        intent_parser = IntentParser(openai_key)
    
    return intent_parser


def get_risk_manager() -> RiskManager:
    """Get risk manager instance"""
    global risk_manager
    if risk_manager is None:
        risk_manager = RiskManager(
            max_single_trade=float(os.getenv("MAX_SINGLE_TRADE", 1000)),
            max_leverage=int(os.getenv("MAX_LEVERAGE", 20)),
            confirm_threshold=float(os.getenv("CONFIRM_THRESHOLD", 500))
        )
    
    return risk_manager


# Request/Response models

class ApiKeysModel(BaseModel):
    aster_api_key: str
    aster_api_secret: str
    openai_api_key: Optional[str] = None


class CommandRequest(BaseModel):
    command: str
    confirm: bool = False
    api_keys: Optional[ApiKeysModel] = None


class CommandResponse(BaseModel):
    success: bool
    message: str
    intent: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None
    needs_confirmation: bool = False


class PositionResponse(BaseModel):
    positions: list
    total_unrealized_pnl: float


class BalanceResponse(BaseModel):
    balances: list
    total_balance: float


# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Aster AI Trader API"}


@app.post("/api/test")
async def test_endpoint(request: dict):
    """Test endpoint to verify POST requests work"""
    print(f"[TEST] Received: {request}")
    return {"status": "ok", "received": request}


@app.get("/api/health")
async def health_check(client: AsterDEXClient = Depends(get_aster_client)):
    """Check API connectivity"""
    try:
        server_time = client.get_server_time()
        return {"status": "ok", "server_time": server_time}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/command", response_model=CommandResponse)
async def process_command(
    request: CommandRequest,
    risk_mgr: RiskManager = Depends(get_risk_manager)
):
    """Process natural language trading command"""
    try:
        logger.info(f"📥 Received command: {request.command}")
        logger.info(f"🔑 API Keys provided: {request.api_keys is not None}")
        
        # Create client and parser with user-provided keys or defaults
        if request.api_keys:
            logger.info(f"✅ Using user-provided API keys")
            logger.info(f"   OpenAI Key: {request.api_keys.openai_api_key[:20] if request.api_keys.openai_api_key else 'None'}...")
            client = AsterDEXClient(request.api_keys.aster_api_key, request.api_keys.aster_api_secret)
            # Use gpt-3.5-turbo instead of gpt-4o-mini (more accessible)
            parser = IntentParser(request.api_keys.openai_api_key or "demo_key", model="gpt-3.5-turbo")
        else:
            logger.info(f"⚙️ Using default API keys from .env")
            client = get_aster_client()
            parser = get_intent_parser()
        
        # Parse intent
        intent = parser.parse(request.command)
        logger.info(f"🎯 Parsed intent: {intent.dict()}")
        
        # Validate intent
        is_valid, error_msg = parser.validate_intent(intent)
        if not is_valid:
            return CommandResponse(
                success=False,
                message=error_msg,
                intent=intent.dict()
            )
        
        # Execute action based on intent
        if intent.action == "query_price":
            return await handle_query_price(intent, client)
        
        elif intent.action == "query_position":
            return await handle_query_position(intent, client)
        
        elif intent.action == "query_balance":
            return await handle_query_balance(client)
        
        elif intent.action == "query_history":
            return await handle_query_history(intent, client)
        
        elif intent.action in ["open_long", "open_short"]:
            return await handle_open_position(intent, client, risk_mgr, request.confirm)
        
        elif intent.action == "close_position":
            return await handle_close_position(intent, client, request.confirm)
        
        elif intent.action == "set_leverage":
            return await handle_set_leverage(intent, client, risk_mgr)
        
        else:
            return CommandResponse(
                success=False,
                message=f"Action '{intent.action}' not yet implemented",
                intent=intent.dict()
            )
    
    except Exception as e:
        print(f"[ERROR] Command processing failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


async def handle_query_price(intent: TradingIntent, client: AsterDEXClient) -> CommandResponse:
    """Handle price query"""
    ticker = client.get_ticker_price(intent.symbol)
    price = float(ticker['price'])
    
    return CommandResponse(
        success=True,
        message=f"Current {intent.symbol} price: ${price:,.2f}",
        intent=intent.dict(),
        data={"price": price, "symbol": intent.symbol}
    )


async def handle_query_position(intent: TradingIntent, client: AsterDEXClient) -> CommandResponse:
    """Handle position query"""
    try:
        positions = client.get_position_info(intent.symbol)
        
        # Filter out empty positions
        active_positions = [p for p in positions if float(p.get('positionAmt', 0)) != 0]
        
        if not active_positions:
            message = f"No open positions for {intent.symbol}" if intent.symbol else "No open positions"
        else:
            message = IntentFormatter.format_position(active_positions[0]) if len(active_positions) == 1 else f"Found {len(active_positions)} open positions"
        
        total_pnl = sum(float(p.get('unRealizedProfit', 0)) for p in active_positions)
        
        return CommandResponse(
            success=True,
            message=message,
            intent=intent.dict(),
            data={
                "positions": active_positions,
                "total_unrealized_pnl": total_pnl
            }
        )
    except Exception as e:
        # Return error when API keys are not configured
        logger.error(f"[Position Query] Failed: {str(e)}")
        return CommandResponse(
            success=False,
            message="❌ **API Keys Required**\n\nPlease configure your AsterDEX API Keys in Settings to view your positions.",
            intent=intent.dict(),
            data=None
        )


async def handle_query_balance(client: AsterDEXClient) -> CommandResponse:
    """Handle balance query"""
    try:
        balances = client.get_account_balance()
        
        message = IntentFormatter.format_balance(balances)
        total = sum(float(b.get('balance', 0)) for b in balances)
        
        return CommandResponse(
            success=True,
            message=message,
            data={
                "balances": balances,
                "total_balance": total
            }
        )
    except Exception as e:
        # Return error when API keys are not configured
        logger.error(f"[Balance Query] Failed: {str(e)}")
        return CommandResponse(
            success=False,
            message="❌ **API Keys Required**\n\nPlease configure your AsterDEX API Keys in Settings to view your account balance.\n\n**How to get API Keys:**\n1. Visit AsterDEX API Management\n2. Create a new API Key with trading permissions\n3. Copy the API Key and Secret\n4. Click the Settings button and enter your keys",
            data=None
        )


async def handle_query_history(intent: TradingIntent, client: AsterDEXClient) -> CommandResponse:
    """Handle trade history query"""
    if not intent.symbol:
        # Query all symbols if not specified
        logger.info("[History] No symbol specified, querying common symbols...")
        all_trades = []
        common_symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']
        
        for symbol in common_symbols:
            try:
                trades = client.get_trade_history(symbol, limit=5)
                if trades:
                    all_trades.extend(trades)
            except:
                continue
        
        if not all_trades:
            return CommandResponse(
                success=True,
                message="No recent trading history found",
                intent=intent.dict(),
                data={"trades": []}
            )
        
        # Sort by time (most recent first)
        all_trades.sort(key=lambda x: x.get('time', 0), reverse=True)
        all_trades = all_trades[:20]  # Limit to 20 most recent
        
        return CommandResponse(
            success=True,
            message=f"Retrieved {len(all_trades)} recent trades across all symbols",
            intent=intent.dict(),
            data={"trades": all_trades}
        )
    
    trades = client.get_trade_history(intent.symbol, limit=20)
    
    return CommandResponse(
        success=True,
        message=f"Retrieved {len(trades)} recent trades for {intent.symbol}",
        intent=intent.dict(),
        data={"trades": trades}
    )


async def handle_open_position(
    intent: TradingIntent,
    client: AsterDEXClient,
    risk_mgr: RiskManager,
    confirmed: bool
) -> CommandResponse:
    """Handle open position command"""
    # Get account balance
    balances = client.get_account_balance()
    usdt_balance = next((float(b['availableBalance']) for b in balances if b['asset'] == 'USDT'), 0)
    
    # Check risk
    is_allowed, error_msg, needs_confirmation = risk_mgr.check_trade_risk(intent, usdt_balance)
    
    if not is_allowed:
        return CommandResponse(
            success=False,
            message=error_msg,
            intent=intent.dict()
        )
    
    # Require confirmation for large trades
    if needs_confirmation and not confirmed:
        return CommandResponse(
            success=False,
            message=f"⚠️ Large trade detected (${intent.amount:,.2f}). Please confirm to proceed.",
            intent=intent.dict(),
            needs_confirmation=True
        )
    
    # Set leverage if specified
    if intent.leverage:
        try:
            client.change_leverage(intent.symbol, intent.leverage)
        except Exception as e:
            return CommandResponse(
                success=False,
                message=f"Failed to set leverage: {str(e)}",
                intent=intent.dict()
            )
    
    # Calculate quantity (simplified - should use proper calculation)
    ticker = client.get_ticker_price(intent.symbol)
    price = float(ticker['price'])
    quantity = intent.amount / price
    
    # Place order
    try:
        side = OrderSide.BUY if intent.action == "open_long" else OrderSide.SELL
        
        result = client.place_order(
            symbol=intent.symbol,
            side=side,
            order_type=OrderType.MARKET,
            quantity=quantity,
            position_side=PositionSide.BOTH
        )
        
        # Record trade
        risk_mgr.record_trade(intent.amount)
        
        action_name = "Long" if intent.action == "open_long" else "Short"
        message = f"✅ {action_name} position opened for {intent.symbol}\n"
        message += f"Amount: ${intent.amount:,.2f}\n"
        message += f"Quantity: {quantity:.6f}\n"
        if intent.leverage:
            message += f"Leverage: {intent.leverage}x\n"
        message += f"Order ID: {result.get('orderId')}"
        
        return CommandResponse(
            success=True,
            message=message,
            intent=intent.dict(),
            data=result
        )
    
    except Exception as e:
        return CommandResponse(
            success=False,
            message=f"Failed to open position: {str(e)}",
            intent=intent.dict()
        )


async def handle_close_position(
    intent: TradingIntent,
    client: AsterDEXClient,
    confirmed: bool
) -> CommandResponse:
    """Handle close position command"""
    try:
        result = client.close_position(intent.symbol)
        
        if result.get('msg') == "No open position to close":
            return CommandResponse(
                success=False,
                message=f"No open position found for {intent.symbol}",
                intent=intent.dict()
            )
        
        message = f"✅ Position closed for {intent.symbol}\n"
        message += f"Order ID: {result.get('orderId')}"
        
        return CommandResponse(
            success=True,
            message=message,
            intent=intent.dict(),
            data=result
        )
    
    except Exception as e:
        return CommandResponse(
            success=False,
            message=f"Failed to close position: {str(e)}",
            intent=intent.dict()
        )


async def handle_set_leverage(
    intent: TradingIntent,
    client: AsterDEXClient,
    risk_mgr: RiskManager
) -> CommandResponse:
    """Handle set leverage command"""
    # Validate leverage
    is_valid, warning = risk_mgr.validate_leverage(intent.leverage)
    
    if not is_valid:
        return CommandResponse(
            success=False,
            message=warning,
            intent=intent.dict()
        )
    
    try:
        result = client.change_leverage(intent.symbol, intent.leverage)
        
        message = f"✅ Leverage set to {intent.leverage}x for {intent.symbol}"
        if warning:
            message += f"\n{warning}"
        
        return CommandResponse(
            success=True,
            message=message,
            intent=intent.dict(),
            data=result
        )
    
    except Exception as e:
        return CommandResponse(
            success=False,
            message=f"Failed to set leverage: {str(e)}",
            intent=intent.dict()
        )


class PositionsRequest(BaseModel):
    api_keys: Optional[ApiKeysModel] = None
    symbol: Optional[str] = None


@app.post("/api/positions", response_model=PositionResponse)
async def get_positions(request: PositionsRequest):
    """Get current positions"""
    # Create client with user-provided keys or defaults
    if request.api_keys:
        client = AsterDEXClient(request.api_keys.aster_api_key, request.api_keys.aster_api_secret)
    else:
        client = get_aster_client()
    try:
        positions = client.get_position_info(request.symbol)
        active_positions = [p for p in positions if float(p.get('positionAmt', 0)) != 0]
        total_pnl = sum(float(p.get('unRealizedProfit', 0)) for p in active_positions)
        
        return PositionResponse(
            positions=active_positions,
            total_unrealized_pnl=total_pnl
        )
    except Exception as e:
        logger.error(f"[Position API] Failed to fetch positions: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="API Keys not configured or invalid. Please configure your AsterDEX API Keys in Settings."
        )


class BalanceRequest(BaseModel):
    api_keys: Optional[ApiKeysModel] = None


@app.post("/api/balance", response_model=BalanceResponse)
async def get_balance(request: BalanceRequest):
    """Get account balance"""
    # Create client with user-provided keys or defaults
    if request.api_keys:
        client = AsterDEXClient(request.api_keys.aster_api_key, request.api_keys.aster_api_secret)
    else:
        client = get_aster_client()
    try:
        import sys
        print("[DEBUG] Fetching account balance from AsterDEX...", flush=True)
        sys.stdout.flush()
        balances = client.get_account_balance()
        print(f"[DEBUG] Received balances: {balances}", flush=True)
        sys.stdout.flush()
        
        # Filter balances with value > 0
        non_zero_balances = [b for b in balances if float(b.get('balance', 0)) > 0]
        total = sum(float(b.get('balance', 0)) for b in balances)
        
        # If no balance, add a friendly placeholder
        if not non_zero_balances:
            non_zero_balances = [
                {"asset": "INFO", "balance": "0.00", "availableBalance": "0.00"}
            ]
        
        return BalanceResponse(
            balances=non_zero_balances,
            total_balance=total
        )
    except Exception as e:
        logger.error(f"[Balance API] Failed to fetch balance: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="API Keys not configured or invalid. Please configure your AsterDEX API Keys in Settings."
        )


@app.get("/api/risk/stats")
async def get_risk_stats(risk_mgr: RiskManager = Depends(get_risk_manager)):
    """Get daily risk statistics"""
    return risk_mgr.get_daily_stats()


class PredictionRequest(BaseModel):
    symbol: str
    model: str = "gpt-3.5-turbo"
    api_keys: Optional[ApiKeysModel] = None


class PredictionResponse(BaseModel):
    success: bool
    prediction: str  # bullish, bearish, neutral
    confidence: float
    price_target: Dict[str, float]
    signals: Dict[str, Any]
    analysis: str
    timeframe: str = "24h"


@app.post("/api/predict", response_model=PredictionResponse)
async def predict_market(request: PredictionRequest):
    """AI-powered market prediction using OpenAI"""
    try:
        # Get OpenAI API key
        openai_key = request.api_keys.openai_api_key if request.api_keys else os.getenv("OPENAI_API_KEY")
        
        if not openai_key or openai_key.startswith("your_"):
            return PredictionResponse(
                success=False,
                prediction="neutral",
                confidence=0.0,
                price_target={"current": 0, "high": 0, "low": 0},
                signals={"technical": [], "sentiment": ""},
                analysis="OpenAI API key not configured",
                timeframe="24h"
            )
        
        # Get current price from AsterDEX
        try:
            if request.api_keys:
                client = AsterDEXClient(request.api_keys.aster_api_key, request.api_keys.aster_api_secret)
            else:
                client = get_aster_client()
            
            ticker = client.get_ticker_price(request.symbol)
            current_price = float(ticker.get('price', 0))
        except:
            # Fallback prices if API fails
            price_map = {
                'BTCUSDT': 67234.50,
                'ETHUSDT': 3456.78,
                'BNBUSDT': 612.34,
                'SOLUSDT': 145.67
            }
            current_price = price_map.get(request.symbol, 1000.0)
        
        # Create OpenAI client
        from openai import OpenAI
        openai_client = OpenAI(api_key=openai_key)
        
        # Prepare prompt for market analysis
        prompt = f"""Analyze the cryptocurrency market for {request.symbol} and provide a trading prediction.

Current Price: ${current_price}

Please provide:
1. Market trend prediction (bullish/bearish/neutral)
2. Confidence level (0-100%)
3. Price targets for next 24h (high and low)
4. Key technical signals (3-5 points)
5. Market sentiment summary

Respond in JSON format:
{{
  "prediction": "bullish|bearish|neutral",
  "confidence": 85,
  "price_high": 68000,
  "price_low": 66000,
  "technical_signals": ["Signal 1", "Signal 2", "Signal 3"],
  "sentiment": "Brief market sentiment summary",
  "analysis": "Detailed analysis explanation"
}}"""
        
        logger.info(f"[Prediction] Requesting analysis for {request.symbol} using {request.model}")
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model=request.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional cryptocurrency market analyst. Provide accurate, data-driven predictions based on technical analysis principles."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        result = json.loads(response.choices[0].message.content)
        
        logger.info(f"[Prediction] Analysis complete: {result.get('prediction')} with {result.get('confidence')}% confidence")
        
        return PredictionResponse(
            success=True,
            prediction=result.get('prediction', 'neutral'),
            confidence=result.get('confidence', 50) / 100,
            price_target={
                "current": current_price,
                "high": result.get('price_high', current_price * 1.05),
                "low": result.get('price_low', current_price * 0.95)
            },
            signals={
                "technical": result.get('technical_signals', []),
                "sentiment": result.get('sentiment', 'Market analysis in progress')
            },
            analysis=result.get('analysis', 'Analysis completed'),
            timeframe="24h"
        )
        
    except Exception as e:
        logger.error(f"[Prediction] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return PredictionResponse(
            success=False,
            prediction="neutral",
            confidence=0.0,
            price_target={"current": 0, "high": 0, "low": 0},
            signals={"technical": [], "sentiment": ""},
            analysis=f"Prediction failed: {str(e)}",
            timeframe="24h"
        )


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    uvicorn.run("app:app", host=host, port=port, reload=debug)
