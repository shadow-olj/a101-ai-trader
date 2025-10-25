import hmac
import hashlib
import time
import requests
from typing import Dict, List, Optional, Any, Union
from enum import Enum


class OrderSide(Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderType(Enum):
    LIMIT = "LIMIT"
    MARKET = "MARKET"
    STOP = "STOP"
    STOP_MARKET = "STOP_MARKET"
    TAKE_PROFIT = "TAKE_PROFIT"
    TAKE_PROFIT_MARKET = "TAKE_PROFIT_MARKET"


class PositionSide(Enum):
    BOTH = "BOTH"
    LONG = "LONG"
    SHORT = "SHORT"


class AsterDEXClient:
    """AsterDEX API Client for perpetual futures trading"""
    
    def __init__(self, api_key: str, api_secret: str, testnet: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://fapi.asterdex.com" if not testnet else "https://testnet.asterdex.com"
        self.session = requests.Session()
        self.session.headers.update({"X-MBX-APIKEY": self.api_key})
        self.time_offset = 0  # Time offset between local and server
        self._sync_time()
    
    def _sync_time(self):
        """Sync time with server to avoid timestamp errors"""
        try:
            local_time_before = int(time.time() * 1000)
            server_time_data = self._request("GET", "/fapi/v1/time")
            local_time_after = int(time.time() * 1000)
            
            server_time = server_time_data['serverTime']
            # Calculate offset (use average of before/after for more accuracy)
            local_time_avg = (local_time_before + local_time_after) // 2
            # Subtract 1000ms safety margin to ensure we're never ahead
            self.time_offset = server_time - local_time_avg - 1000
            print(f"[DEBUG] Time offset: {self.time_offset}ms (with -1000ms safety margin)")
        except:
            # If sync fails, use -1000ms to be safe
            self.time_offset = -1000
    
    def _sign(self, params: Dict[str, Any]) -> str:
        """Generate signature for authenticated requests"""
        # Remove signature if present (shouldn't sign the signature itself)
        params_to_sign = {k: v for k, v in params.items() if k != 'signature'}
        # Sort parameters and create query string
        query_string = '&'.join([f"{k}={v}" for k, v in sorted(params_to_sign.items())])
        print(f"[DEBUG] Query string to sign: {query_string}")
        # Generate HMAC SHA256 signature
        signature = hmac.new(
            self.api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        print(f"[DEBUG] Generated signature: {signature}")
        return signature
    
    def _request(self, method: str, endpoint: str, signed: bool = False, **kwargs) -> Dict:
        """Make HTTP request to AsterDEX API"""
        url = f"{self.base_url}{endpoint}"
        
        if signed:
            if 'params' not in kwargs:
                kwargs['params'] = {}
            # Add timestamp (with server time offset)
            kwargs['params']['timestamp'] = int(time.time() * 1000) + self.time_offset
            # Don't add recvWindow - try without it first
            # kwargs['params']['recvWindow'] = 5000
            # Generate signature (must be last)
            signature = self._sign(kwargs['params'])
            kwargs['params']['signature'] = signature
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            # Try to get error details from response
            error_detail = str(e)
            try:
                if hasattr(e, 'response') and e.response is not None:
                    error_detail = f"{str(e)} - Response: {e.response.text}"
            except:
                pass
            raise Exception(f"API request failed: {error_detail}")
    
    # Market Data Endpoints
    
    def get_server_time(self) -> Dict:
        """Test connectivity and get server time"""
        return self._request("GET", "/fapi/v1/time")
    
    def get_exchange_info(self) -> Dict:
        """Get exchange trading rules and symbol information"""
        return self._request("GET", "/fapi/v1/exchangeInfo")
    
    def get_orderbook(self, symbol: str, limit: int = 100) -> Dict:
        """Get order book depth"""
        params = {"symbol": symbol, "limit": limit}
        return self._request("GET", "/fapi/v1/depth", params=params)
    
    def get_recent_trades(self, symbol: str, limit: int = 500) -> List[Dict]:
        """Get recent trades"""
        params = {"symbol": symbol, "limit": limit}
        return self._request("GET", "/fapi/v1/trades", params=params)
    
    def get_klines(self, symbol: str, interval: str, limit: int = 500) -> List[List]:
        """Get kline/candlestick data
        
        Args:
            symbol: Trading pair (e.g., "BTCUSDT")
            interval: Kline interval (1m, 5m, 15m, 1h, 4h, 1d, etc.)
            limit: Number of klines to return
        """
        params = {"symbol": symbol, "interval": interval, "limit": limit}
        return self._request("GET", "/fapi/v1/klines", params=params)
    
    def get_ticker_price(self, symbol: Optional[str] = None) -> Union[Dict, List[Dict]]:
        """Get latest price for a symbol or all symbols"""
        params = {"symbol": symbol} if symbol else {}
        return self._request("GET", "/fapi/v1/ticker/price", params=params)
    
    def get_24hr_ticker(self, symbol: Optional[str] = None) -> Union[Dict, List[Dict]]:
        """Get 24hr ticker price change statistics"""
        params = {"symbol": symbol} if symbol else {}
        return self._request("GET", "/fapi/v1/ticker/24hr", params=params)
    
    def get_funding_rate(self, symbol: str, limit: int = 100) -> List[Dict]:
        """Get funding rate history"""
        params = {"symbol": symbol, "limit": limit}
        return self._request("GET", "/fapi/v1/fundingRate", params=params)
    
    # Trading Endpoints
    
    def place_order(
        self,
        symbol: str,
        side: OrderSide,
        order_type: OrderType,
        quantity: Optional[float] = None,
        price: Optional[float] = None,
        position_side: PositionSide = PositionSide.BOTH,
        time_in_force: str = "GTC",
        reduce_only: bool = False,
        **kwargs
    ) -> Dict:
        """Place a new order
        
        Args:
            symbol: Trading pair (e.g., "BTCUSDT")
            side: BUY or SELL
            order_type: Order type (LIMIT, MARKET, etc.)
            quantity: Order quantity
            price: Order price (required for LIMIT orders)
            position_side: Position side (BOTH, LONG, SHORT)
            time_in_force: Time in force (GTC, IOC, FOK)
            reduce_only: Reduce only flag
        """
        params = {
            "symbol": symbol,
            "side": side.value,
            "type": order_type.value,
            "positionSide": position_side.value,
            "timeInForce": time_in_force,
            "reduceOnly": str(reduce_only).lower()
        }
        
        if quantity:
            params["quantity"] = quantity
        if price:
            params["price"] = price
        
        params.update(kwargs)
        
        return self._request("POST", "/fapi/v1/order", signed=True, params=params)
    
    def cancel_order(self, symbol: str, order_id: Optional[int] = None, 
                     orig_client_order_id: Optional[str] = None) -> Dict:
        """Cancel an active order"""
        params = {"symbol": symbol}
        if order_id:
            params["orderId"] = order_id
        if orig_client_order_id:
            params["origClientOrderId"] = orig_client_order_id
        
        return self._request("DELETE", "/fapi/v1/order", signed=True, params=params)
    
    def cancel_all_orders(self, symbol: str) -> Dict:
        """Cancel all open orders on a symbol"""
        params = {"symbol": symbol}
        return self._request("DELETE", "/fapi/v1/allOpenOrders", signed=True, params=params)
    
    def get_order(self, symbol: str, order_id: Optional[int] = None,
                  orig_client_order_id: Optional[str] = None) -> Dict:
        """Check an order's status"""
        params = {"symbol": symbol}
        if order_id:
            params["orderId"] = order_id
        if orig_client_order_id:
            params["origClientOrderId"] = orig_client_order_id
        
        return self._request("GET", "/fapi/v1/order", signed=True, params=params)
    
    def get_open_orders(self, symbol: Optional[str] = None) -> List[Dict]:
        """Get all open orders"""
        params = {"symbol": symbol} if symbol else {}
        return self._request("GET", "/fapi/v1/openOrders", signed=True, params=params)
    
    def get_all_orders(self, symbol: str, limit: int = 500) -> List[Dict]:
        """Get all account orders (active, canceled, or filled)"""
        params = {"symbol": symbol, "limit": limit}
        return self._request("GET", "/fapi/v1/allOrders", signed=True, params=params)
    
    # Account Endpoints
    
    def get_account_balance(self) -> List[Dict]:
        """Get current account balance"""
        return self._request("GET", "/fapi/v2/balance", signed=True)
    
    def get_account_info(self) -> Dict:
        """Get current account information"""
        return self._request("GET", "/fapi/v2/account", signed=True)
    
    def get_position_info(self, symbol: Optional[str] = None) -> List[Dict]:
        """Get current position information"""
        params = {"symbol": symbol} if symbol else {}
        return self._request("GET", "/fapi/v2/positionRisk", signed=True, params=params)
    
    def get_trade_history(self, symbol: str, limit: int = 500) -> List[Dict]:
        """Get account trade list"""
        params = {"symbol": symbol, "limit": limit}
        return self._request("GET", "/fapi/v1/userTrades", signed=True, params=params)
    
    def get_income_history(self, symbol: Optional[str] = None, 
                          income_type: Optional[str] = None,
                          limit: int = 100) -> List[Dict]:
        """Get income history"""
        params = {"limit": limit}
        if symbol:
            params["symbol"] = symbol
        if income_type:
            params["incomeType"] = income_type
        
        return self._request("GET", "/fapi/v1/income", signed=True, params=params)
    
    def change_leverage(self, symbol: str, leverage: int) -> Dict:
        """Change initial leverage"""
        params = {"symbol": symbol, "leverage": leverage}
        return self._request("POST", "/fapi/v1/leverage", signed=True, params=params)
    
    def change_margin_type(self, symbol: str, margin_type: str) -> Dict:
        """Change margin type (ISOLATED or CROSSED)"""
        params = {"symbol": symbol, "marginType": margin_type}
        return self._request("POST", "/fapi/v1/marginType", signed=True, params=params)
    
    # Convenience Methods
    
    def market_buy(self, symbol: str, quantity: float, position_side: PositionSide = PositionSide.BOTH) -> Dict:
        """Place a market buy order (open long)"""
        return self.place_order(
            symbol=symbol,
            side=OrderSide.BUY,
            order_type=OrderType.MARKET,
            quantity=quantity,
            position_side=position_side
        )
    
    def market_sell(self, symbol: str, quantity: float, position_side: PositionSide = PositionSide.BOTH) -> Dict:
        """Place a market sell order (open short)"""
        return self.place_order(
            symbol=symbol,
            side=OrderSide.SELL,
            order_type=OrderType.MARKET,
            quantity=quantity,
            position_side=position_side
        )
    
    def close_position(self, symbol: str, position_side: PositionSide = PositionSide.BOTH) -> Dict:
        """Close all positions for a symbol"""
        positions = self.get_position_info(symbol)
        
        for pos in positions:
            if float(pos.get('positionAmt', 0)) != 0:
                quantity = abs(float(pos['positionAmt']))
                side = OrderSide.SELL if float(pos['positionAmt']) > 0 else OrderSide.BUY
                
                return self.place_order(
                    symbol=symbol,
                    side=side,
                    order_type=OrderType.MARKET,
                    quantity=quantity,
                    position_side=position_side,
                    reduce_only=True
                )
        
        return {"msg": "No open position to close"}
