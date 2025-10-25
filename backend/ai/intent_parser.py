from openai import OpenAI
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field
import json
import logging

logger = logging.getLogger(__name__)


class TradingIntent(BaseModel):
    """Trading intent parsed from user input"""
    action: str = Field(..., description="Action type: open_long, open_short, close_position, query_position, query_price, set_leverage, query_balance, query_history")
    symbol: Optional[str] = Field(None, description="Trading symbol (e.g., BTCUSDT, ETHUSDT)")
    amount: Optional[float] = Field(None, description="Trade amount in USDT")
    leverage: Optional[int] = Field(None, description="Leverage multiplier")
    price: Optional[float] = Field(None, description="Limit order price")
    stop_loss: Optional[float] = Field(None, description="Stop loss price")
    take_profit: Optional[float] = Field(None, description="Take profit price")
    confidence: float = Field(..., description="Confidence score 0-1")
    original_text: str = Field(..., description="Original user input")
    
    class Config:
        json_schema_extra = {
            "example": {
                "action": "open_long",
                "symbol": "BTCUSDT",
                "amount": 100,
                "leverage": 10,
                "confidence": 0.95,
                "original_text": "Open long BTC with 10x leverage, 100 USDT"
            }
        }


class IntentParser:
    """Parse natural language trading commands using OpenAI GPT"""
    
    SYSTEM_PROMPT = """You are a cryptocurrency trading assistant for AsterDEX perpetual futures exchange.
Your job is to parse user trading commands and extract structured information.

Supported actions:
- open_long: Open a long position (buy)
- open_short: Open a short position (sell)
- close_position: Close existing position
- close_all: Close all positions
- query_position: Query current positions
- query_price: Query current price
- query_balance: Query account balance
- query_history: Query trading history
- set_leverage: Set leverage for a symbol
- cancel_order: Cancel an order

Common symbols:
- BTC, BITCOIN -> BTCUSDT
- ETH, ETHEREUM -> ETHUSDT
- SOL, SOLANA -> SOLUSDT
- BNB -> BNBUSDT
- DOGE, DOGECOIN -> DOGEUSDT

Important rules:
1. Always convert symbol names to standard format (e.g., BTC -> BTCUSDT)
2. Extract numerical values for amount, leverage, price
3. Set confidence based on clarity of the command
4. If information is missing or ambiguous, set confidence lower
5. For queries, amount and leverage are not required

Return a JSON object with these fields:
{
  "action": "action_type",
  "symbol": "SYMBOL" or null,
  "amount": number or null,
  "leverage": number or null,
  "price": number or null,
  "stop_loss": number or null,
  "take_profit": number or null,
  "confidence": 0.0-1.0,
  "original_text": "user input"
}

Examples:

Input: "Open long BTC with 10x leverage, 100 USDT"
Output: {"action": "open_long", "symbol": "BTCUSDT", "amount": 100, "leverage": 10, "confidence": 0.95, "original_text": "Open long BTC with 10x leverage, 100 USDT"}

Input: "Short ETH 50 USDT"
Output: {"action": "open_short", "symbol": "ETHUSDT", "amount": 50, "leverage": null, "confidence": 0.85, "original_text": "Short ETH 50 USDT"}

Input: "Close all BTC positions"
Output: {"action": "close_position", "symbol": "BTCUSDT", "amount": null, "leverage": null, "confidence": 0.95, "original_text": "Close all BTC positions"}

Input: "What's the BTC price?"
Output: {"action": "query_price", "symbol": "BTCUSDT", "amount": null, "leverage": null, "confidence": 0.95, "original_text": "What's the BTC price?"}

Input: "Show my positions"
Output: {"action": "query_position", "symbol": null, "amount": null, "leverage": null, "confidence": 0.95, "original_text": "Show my positions"}

Input: "Set BTC leverage to 20x"
Output: {"action": "set_leverage", "symbol": "BTCUSDT", "leverage": 20, "amount": null, "confidence": 0.95, "original_text": "Set BTC leverage to 20x"}
"""
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        """Initialize intent parser with OpenAI API
        
        Args:
            api_key: OpenAI API key
            model: Model to use (gpt-4, gpt-3.5-turbo, etc.)
        """
        logger.info(f"[IntentParser] Initializing with API key: {api_key[:20] if api_key else 'None'}...")
        self.demo_mode = (api_key == "demo_key" or not api_key or api_key.startswith("your_"))
        logger.info(f"[IntentParser] Demo mode: {self.demo_mode}")
        
        if not self.demo_mode:
            try:
                logger.info(f"[IntentParser] Creating OpenAI client...")
                # Remove ALL proxy-related environment variables
                import os
                proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 
                             'ALL_PROXY', 'all_proxy', 'NO_PROXY', 'no_proxy']
                old_proxies = {}
                for var in proxy_vars:
                    if var in os.environ:
                        old_proxies[var] = os.environ.pop(var)
                        logger.info(f"[IntentParser] Temporarily removed {var}")
                
                try:
                    # Try to create client without any proxy settings
                    self.client = OpenAI(
                        api_key=api_key,
                        timeout=30.0,
                        max_retries=2
                    )
                    logger.info(f"[IntentParser] ✅ OpenAI client created successfully!")
                except TypeError as te:
                    # If still getting proxies error, try with httpx client
                    logger.warning(f"[IntentParser] TypeError: {te}, trying alternative method...")
                    import httpx
                    http_client = httpx.Client(timeout=30.0)
                    self.client = OpenAI(
                        api_key=api_key,
                        http_client=http_client
                    )
                    logger.info(f"[IntentParser] ✅ OpenAI client created with custom http client!")
                finally:
                    # Restore proxy settings
                    for var, value in old_proxies.items():
                        os.environ[var] = value
            except Exception as e:
                logger.error(f"[IntentParser] ❌ Failed to initialize OpenAI client: {e}")
                logger.error(f"[IntentParser] Error type: {type(e).__name__}")
                import traceback
                logger.error(f"[IntentParser] Traceback: {traceback.format_exc()}")
                logger.info("[IntentParser] Falling back to demo mode")
                self.demo_mode = True
                self.client = None
        else:
            logger.info(f"[IntentParser] Using demo mode (no OpenAI)")
            self.client = None
        self.model = model
    
    def parse(self, user_input: str) -> TradingIntent:
        """Parse user input into structured trading intent
        
        Args:
            user_input: Natural language trading command
            
        Returns:
            TradingIntent object with parsed information
        """
        # Demo mode - simple pattern matching
        if self.demo_mode:
            logger.info(f"[IntentParser] 🔧 Using DEMO mode for: {user_input}")
            return self._demo_parse(user_input)
        
        logger.info(f"[IntentParser] 🤖 Calling OpenAI GPT-4 for: {user_input}")
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            result['original_text'] = user_input
            
            return TradingIntent(**result)
            
        except Exception as e:
            # Return low confidence intent on error
            return TradingIntent(
                action="unknown",
                confidence=0.0,
                original_text=user_input
            )
    
    def _demo_parse(self, user_input: str) -> TradingIntent:
        """Simple demo parser without AI"""
        text = user_input.lower()
        
        # Query balance
        if any(word in text for word in ["balance"]):
            return TradingIntent(
                action="query_balance",
                confidence=0.9,
                original_text=user_input
            )
        
        # Query positions
        if any(word in text for word in ["position", "show my"]):
            return TradingIntent(
                action="query_position",
                confidence=0.9,
                original_text=user_input
            )
        
        # Query price
        if any(word in text for word in ["price"]):
            symbol = None
            if "btc" in text or "bitcoin" in text:
                symbol = "BTCUSDT"
            elif "eth" in text or "ethereum" in text:
                symbol = "ETHUSDT"
            
            return TradingIntent(
                action="query_price",
                symbol=symbol,
                confidence=0.8,
                original_text=user_input
            )
        
        # Default
        return TradingIntent(
            action="unknown",
            confidence=0.3,
            original_text=user_input
        )
    
    def validate_intent(self, intent: TradingIntent) -> tuple[bool, Optional[str]]:
        """Validate parsed intent
        
        Args:
            intent: Parsed trading intent
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check confidence threshold
        if intent.confidence < 0.5:
            return False, "Command not clear enough. Please rephrase."
        
        # Validate action-specific requirements
        if intent.action in ["open_long", "open_short"]:
            if not intent.symbol:
                return False, "Symbol is required for trading"
            if not intent.amount:
                return False, "Amount is required for trading"
        
        elif intent.action == "close_position":
            if not intent.symbol:
                return False, "Symbol is required to close position"
        
        elif intent.action == "set_leverage":
            if not intent.symbol:
                return False, "Symbol is required to set leverage"
            if not intent.leverage:
                return False, "Leverage value is required"
            if intent.leverage < 1 or intent.leverage > 125:
                return False, "Leverage must be between 1 and 125"
        
        elif intent.action == "query_price":
            if not intent.symbol:
                return False, "Symbol is required to query price"
        
        return True, None


class IntentFormatter:
    """Format intent and results for user display"""
    
    @staticmethod
    def format_intent(intent: TradingIntent) -> str:
        """Format intent as human-readable text"""
        parts = []
        
        action_names = {
            "open_long": "Open Long Position",
            "open_short": "Open Short Position",
            "close_position": "Close Position",
            "close_all": "Close All Positions",
            "query_position": "Query Positions",
            "query_price": "Query Price",
            "query_balance": "Query Balance",
            "query_history": "Query History",
            "set_leverage": "Set Leverage"
        }
        
        parts.append(f"**Action:** {action_names.get(intent.action, intent.action)}")
        
        if intent.symbol:
            parts.append(f"**Symbol:** {intent.symbol}")
        if intent.amount:
            parts.append(f"**Amount:** {intent.amount} USDT")
        if intent.leverage:
            parts.append(f"**Leverage:** {intent.leverage}x")
        if intent.price:
            parts.append(f"**Price:** {intent.price}")
        if intent.stop_loss:
            parts.append(f"**Stop Loss:** {intent.stop_loss}")
        if intent.take_profit:
            parts.append(f"**Take Profit:** {intent.take_profit}")
        
        parts.append(f"**Confidence:** {intent.confidence:.0%}")
        
        return "\n".join(parts)
    
    @staticmethod
    def format_position(position: Dict[str, Any]) -> str:
        """Format position data for display"""
        symbol = position.get('symbol', 'N/A')
        amount = float(position.get('positionAmt', 0))
        entry_price = float(position.get('entryPrice', 0))
        mark_price = float(position.get('markPrice', 0))
        unrealized_pnl = float(position.get('unRealizedProfit', 0))
        leverage = position.get('leverage', 'N/A')
        
        side = "LONG" if amount > 0 else "SHORT" if amount < 0 else "NONE"
        
        return f"""
**{symbol}**
- Side: {side}
- Amount: {abs(amount)}
- Entry Price: ${entry_price:,.2f}
- Mark Price: ${mark_price:,.2f}
- Unrealized PNL: ${unrealized_pnl:,.2f}
- Leverage: {leverage}x
"""
    
    @staticmethod
    def format_balance(balances: list) -> str:
        """Format balance data for display"""
        lines = ["**Account Balance:**\n"]
        
        has_balance = False
        for balance in balances:
            asset = balance.get('asset', 'N/A')
            free = float(balance.get('availableBalance', 0))
            total = float(balance.get('balance', 0))
            
            if total > 0:
                lines.append(f"- {asset}: {total:,.2f} (Available: {free:,.2f})")
                has_balance = True
        
        if not has_balance:
            lines.append("\n💡 Your account balance is empty.")
            lines.append("Please deposit funds to start trading.")
        
        return "\n".join(lines)
