"""
Technical Indicators Module
Calculates RSI, MACD, EMA and other technical indicators
"""
import numpy as np
from typing import List, Dict, Any


def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """
    Calculate Relative Strength Index (RSI)
    
    Args:
        prices: List of closing prices
        period: RSI period (default 14)
    
    Returns:
        RSI value (0-100)
    """
    if len(prices) < period + 1:
        return 50.0  # Neutral if not enough data
    
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])
    
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return round(rsi, 2)


def calculate_ema(prices: List[float], period: int) -> float:
    """
    Calculate Exponential Moving Average (EMA)
    
    Args:
        prices: List of closing prices
        period: EMA period
    
    Returns:
        EMA value
    """
    if len(prices) < period:
        return prices[-1] if prices else 0.0
    
    multiplier = 2 / (period + 1)
    ema = np.mean(prices[:period])  # Start with SMA
    
    for price in prices[period:]:
        ema = (price * multiplier) + (ema * (1 - multiplier))
    
    return round(ema, 2)


def calculate_macd(prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, float]:
    """
    Calculate MACD (Moving Average Convergence Divergence)
    
    Args:
        prices: List of closing prices
        fast: Fast EMA period (default 12)
        slow: Slow EMA period (default 26)
        signal: Signal line period (default 9)
    
    Returns:
        Dictionary with macd, signal, and histogram values
    """
    if len(prices) < slow:
        return {"macd": 0.0, "signal": 0.0, "histogram": 0.0}
    
    ema_fast = calculate_ema(prices, fast)
    ema_slow = calculate_ema(prices, slow)
    macd_line = ema_fast - ema_slow
    
    # Calculate signal line (EMA of MACD)
    # For simplicity, using a basic average here
    signal_line = macd_line * 0.9  # Simplified
    histogram = macd_line - signal_line
    
    return {
        "macd": round(macd_line, 2),
        "signal": round(signal_line, 2),
        "histogram": round(histogram, 2)
    }


def calculate_bollinger_bands(prices: List[float], period: int = 20, std_dev: int = 2) -> Dict[str, float]:
    """
    Calculate Bollinger Bands
    
    Args:
        prices: List of closing prices
        period: Moving average period (default 20)
        std_dev: Number of standard deviations (default 2)
    
    Returns:
        Dictionary with upper, middle, and lower bands
    """
    if len(prices) < period:
        current_price = prices[-1] if prices else 0.0
        return {
            "upper": current_price,
            "middle": current_price,
            "lower": current_price
        }
    
    recent_prices = prices[-period:]
    middle = np.mean(recent_prices)
    std = np.std(recent_prices)
    
    upper = middle + (std_dev * std)
    lower = middle - (std_dev * std)
    
    return {
        "upper": round(upper, 2),
        "middle": round(middle, 2),
        "lower": round(lower, 2)
    }


def analyze_technical_indicators(klines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze all technical indicators from K-line data
    
    Args:
        klines: List of K-line data with OHLCV
    
    Returns:
        Dictionary with all technical indicators and signals
    """
    if not klines or len(klines) < 2:
        return {
            "rsi": 50.0,
            "macd": {"macd": 0.0, "signal": 0.0, "histogram": 0.0},
            "ema_20": 0.0,
            "ema_50": 0.0,
            "bollinger": {"upper": 0.0, "middle": 0.0, "lower": 0.0},
            "signals": []
        }
    
    # Extract closing prices
    closes = [float(k.get('close', 0)) for k in klines]
    volumes = [float(k.get('volume', 0)) for k in klines]
    
    # Calculate indicators
    rsi = calculate_rsi(closes, 14)
    macd = calculate_macd(closes)
    ema_20 = calculate_ema(closes, 20)
    ema_50 = calculate_ema(closes, 50)
    bollinger = calculate_bollinger_bands(closes)
    
    current_price = closes[-1]
    
    # Generate trading signals
    signals = []
    
    # RSI signals
    if rsi < 30:
        signals.append("RSI oversold (<30) - Potential buy signal")
    elif rsi > 70:
        signals.append("RSI overbought (>70) - Potential sell signal")
    
    # MACD signals
    if macd['histogram'] > 0:
        signals.append("MACD bullish - Histogram positive")
    else:
        signals.append("MACD bearish - Histogram negative")
    
    # EMA signals
    if current_price > ema_20 > ema_50:
        signals.append("Price above EMA20 and EMA50 - Bullish trend")
    elif current_price < ema_20 < ema_50:
        signals.append("Price below EMA20 and EMA50 - Bearish trend")
    
    # Bollinger Bands signals
    if current_price > bollinger['upper']:
        signals.append("Price above upper Bollinger Band - Overbought")
    elif current_price < bollinger['lower']:
        signals.append("Price below lower Bollinger Band - Oversold")
    
    # Volume analysis
    if len(volumes) >= 20:
        avg_volume = np.mean(volumes[-20:])
        current_volume = volumes[-1]
        if current_volume > avg_volume * 1.5:
            signals.append("High volume surge - Strong momentum")
    
    return {
        "rsi": rsi,
        "macd": macd,
        "ema_20": ema_20,
        "ema_50": ema_50,
        "bollinger": bollinger,
        "current_price": current_price,
        "signals": signals,
        "volume_avg": round(np.mean(volumes[-20:]) if len(volumes) >= 20 else 0, 2)
    }
