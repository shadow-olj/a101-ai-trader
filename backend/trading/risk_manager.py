from typing import Dict, Tuple, Optional
from datetime import datetime, timedelta
from collections import defaultdict
from ai.intent_parser import TradingIntent


class RiskManager:
    """Risk management system for trading operations"""
    
    def __init__(
        self,
        max_single_trade: float = 1000,
        max_leverage: int = 20,
        confirm_threshold: float = 500,
        max_daily_trades: int = 50,
        max_daily_loss: float = 5000
    ):
        """Initialize risk manager
        
        Args:
            max_single_trade: Maximum amount for a single trade in USDT
            max_leverage: Maximum allowed leverage
            confirm_threshold: Amount threshold requiring confirmation
            max_daily_trades: Maximum number of trades per day
            max_daily_loss: Maximum daily loss in USDT
        """
        self.max_single_trade = max_single_trade
        self.max_leverage = max_leverage
        self.confirm_threshold = confirm_threshold
        self.max_daily_trades = max_daily_trades
        self.max_daily_loss = max_daily_loss
        
        # Track daily statistics
        self.daily_trades = defaultdict(int)
        self.daily_pnl = defaultdict(float)
        self.last_reset = datetime.now().date()
    
    def _reset_daily_stats_if_needed(self):
        """Reset daily statistics if it's a new day"""
        today = datetime.now().date()
        if today > self.last_reset:
            self.daily_trades.clear()
            self.daily_pnl.clear()
            self.last_reset = today
    
    def check_trade_risk(
        self,
        intent: TradingIntent,
        account_balance: Optional[float] = None
    ) -> Tuple[bool, Optional[str], bool]:
        """Check if a trade meets risk requirements
        
        Args:
            intent: Trading intent to check
            account_balance: Current account balance in USDT
            
        Returns:
            Tuple of (is_allowed, error_message, needs_confirmation)
        """
        self._reset_daily_stats_if_needed()
        
        # Only check trading actions
        if intent.action not in ["open_long", "open_short"]:
            return True, None, False
        
        # Check amount
        if not intent.amount:
            return False, "Trade amount is required", False
        
        # Check single trade limit
        if intent.amount > self.max_single_trade:
            return False, f"Trade amount ${intent.amount:,.2f} exceeds maximum ${self.max_single_trade:,.2f}", False
        
        # Check leverage
        if intent.leverage and intent.leverage > self.max_leverage:
            return False, f"Leverage {intent.leverage}x exceeds maximum {self.max_leverage}x", False
        
        # Check account balance if provided
        if account_balance is not None:
            if intent.amount > account_balance:
                return False, f"Insufficient balance. Available: ${account_balance:,.2f}", False
            
            # Warn if using more than 50% of balance
            if intent.amount > account_balance * 0.5:
                return True, None, True  # Needs confirmation
        
        # Check daily trade limit
        today = datetime.now().date()
        if self.daily_trades[today] >= self.max_daily_trades:
            return False, f"Daily trade limit ({self.max_daily_trades}) reached", False
        
        # Check daily loss limit
        if self.daily_pnl[today] < -self.max_daily_loss:
            return False, f"Daily loss limit (${self.max_daily_loss:,.2f}) reached", False
        
        # Check if confirmation is needed
        needs_confirmation = intent.amount >= self.confirm_threshold
        
        return True, None, needs_confirmation
    
    def record_trade(self, amount: float, pnl: float = 0):
        """Record a trade for daily statistics
        
        Args:
            amount: Trade amount in USDT
            pnl: Profit/loss from the trade
        """
        self._reset_daily_stats_if_needed()
        today = datetime.now().date()
        
        self.daily_trades[today] += 1
        self.daily_pnl[today] += pnl
    
    def get_daily_stats(self) -> Dict:
        """Get current daily statistics"""
        self._reset_daily_stats_if_needed()
        today = datetime.now().date()
        
        return {
            "date": today.isoformat(),
            "trades_count": self.daily_trades[today],
            "total_pnl": self.daily_pnl[today],
            "trades_remaining": max(0, self.max_daily_trades - self.daily_trades[today]),
            "loss_limit_remaining": max(0, self.max_daily_loss + self.daily_pnl[today])
        }
    
    def validate_leverage(self, leverage: int) -> Tuple[bool, Optional[str]]:
        """Validate leverage value
        
        Args:
            leverage: Leverage multiplier
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if leverage < 1:
            return False, "Leverage must be at least 1x"
        
        if leverage > self.max_leverage:
            return False, f"Leverage {leverage}x exceeds maximum {self.max_leverage}x"
        
        # Warn for high leverage
        if leverage > 10:
            return True, f"⚠️ High leverage ({leverage}x) increases liquidation risk"
        
        return True, None
    
    def calculate_liquidation_price(
        self,
        entry_price: float,
        leverage: int,
        side: str
    ) -> float:
        """Calculate approximate liquidation price
        
        Args:
            entry_price: Position entry price
            leverage: Leverage multiplier
            side: Position side (LONG or SHORT)
            
        Returns:
            Estimated liquidation price
        """
        # Simplified calculation (actual calculation may vary by exchange)
        maintenance_margin_rate = 0.004  # 0.4% for most pairs
        
        if side.upper() == "LONG":
            # For long: liquidation = entry * (1 - 1/leverage + maintenance_margin_rate)
            liq_price = entry_price * (1 - 1/leverage + maintenance_margin_rate)
        else:
            # For short: liquidation = entry * (1 + 1/leverage - maintenance_margin_rate)
            liq_price = entry_price * (1 + 1/leverage - maintenance_margin_rate)
        
        return liq_price
    
    def assess_position_risk(
        self,
        position_size: float,
        entry_price: float,
        current_price: float,
        leverage: int,
        side: str
    ) -> Dict:
        """Assess risk of an existing position
        
        Args:
            position_size: Position size in USDT
            entry_price: Entry price
            current_price: Current market price
            leverage: Position leverage
            side: Position side (LONG or SHORT)
            
        Returns:
            Risk assessment dictionary
        """
        # Calculate PNL
        if side.upper() == "LONG":
            pnl_pct = ((current_price - entry_price) / entry_price) * 100 * leverage
        else:
            pnl_pct = ((entry_price - current_price) / entry_price) * 100 * leverage
        
        # Calculate liquidation price
        liq_price = self.calculate_liquidation_price(entry_price, leverage, side)
        
        # Calculate distance to liquidation
        if side.upper() == "LONG":
            liq_distance_pct = ((current_price - liq_price) / current_price) * 100
        else:
            liq_distance_pct = ((liq_price - current_price) / current_price) * 100
        
        # Determine risk level
        if liq_distance_pct < 5:
            risk_level = "CRITICAL"
        elif liq_distance_pct < 10:
            risk_level = "HIGH"
        elif liq_distance_pct < 20:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            "pnl_percentage": round(pnl_pct, 2),
            "liquidation_price": round(liq_price, 2),
            "distance_to_liquidation_pct": round(liq_distance_pct, 2),
            "risk_level": risk_level,
            "warnings": self._generate_warnings(pnl_pct, liq_distance_pct, leverage)
        }
    
    def _generate_warnings(
        self,
        pnl_pct: float,
        liq_distance_pct: float,
        leverage: int
    ) -> list:
        """Generate risk warnings"""
        warnings = []
        
        if liq_distance_pct < 5:
            warnings.append("⚠️ CRITICAL: Very close to liquidation!")
        elif liq_distance_pct < 10:
            warnings.append("⚠️ HIGH RISK: Close to liquidation")
        
        if pnl_pct < -50:
            warnings.append("⚠️ Large unrealized loss")
        
        if leverage > 20:
            warnings.append("⚠️ Very high leverage")
        
        return warnings
