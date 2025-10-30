"""
Prediction History and Feedback Module
Tracks AI prediction accuracy and provides learning feedback
"""
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path


class PredictionHistory:
    """Manages prediction history and calculates accuracy metrics"""
    
    def __init__(self, history_dir: str = "prediction_history"):
        self.history_dir = Path(history_dir)
        self.history_dir.mkdir(exist_ok=True)
    
    def save_prediction(self, symbol: str, prediction: Dict[str, Any], actual_outcome: Optional[Dict[str, Any]] = None):
        """
        Save a prediction to history
        
        Args:
            symbol: Trading symbol (e.g., BTCUSDT)
            prediction: Prediction data from AI
            actual_outcome: Actual market outcome (if available)
        """
        timestamp = datetime.now().isoformat()
        
        record = {
            "timestamp": timestamp,
            "symbol": symbol,
            "prediction": prediction.get("prediction", "neutral"),
            "confidence": prediction.get("confidence", 0.0),
            "price_at_prediction": prediction.get("price_target", {}).get("current", 0),
            "predicted_high": prediction.get("price_target", {}).get("high", 0),
            "predicted_low": prediction.get("price_target", {}).get("low", 0),
            "signals": prediction.get("signals", {}),
            "actual_outcome": actual_outcome
        }
        
        # Save to daily file
        date_str = datetime.now().strftime("%Y-%m-%d")
        file_path = self.history_dir / f"{symbol}_{date_str}.jsonl"
        
        with open(file_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps(record) + '\n')
    
    def update_outcome(self, symbol: str, timestamp: str, actual_price: float, actual_direction: str):
        """
        Update a prediction with actual outcome
        
        Args:
            symbol: Trading symbol
            timestamp: Prediction timestamp
            actual_price: Actual price after 24h
            actual_direction: Actual direction (bullish/bearish/neutral)
        """
        # This would update the prediction record with actual results
        # For now, we'll implement a simple version
        pass
    
    def get_recent_predictions(self, symbol: str, days: int = 7) -> List[Dict[str, Any]]:
        """
        Get recent predictions for a symbol
        
        Args:
            symbol: Trading symbol
            days: Number of days to look back
        
        Returns:
            List of prediction records
        """
        predictions = []
        
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            file_path = self.history_dir / f"{symbol}_{date_str}.jsonl"
            
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            predictions.append(json.loads(line))
                        except:
                            continue
        
        return predictions
    
    def calculate_accuracy(self, symbol: str, days: int = 7) -> Dict[str, Any]:
        """
        Calculate prediction accuracy metrics
        
        Args:
            symbol: Trading symbol
            days: Number of days to analyze
        
        Returns:
            Dictionary with accuracy metrics
        """
        predictions = self.get_recent_predictions(symbol, days)
        
        if not predictions:
            return {
                "total_predictions": 0,
                "accuracy": 0.0,
                "bullish_accuracy": 0.0,
                "bearish_accuracy": 0.0,
                "avg_confidence": 0.0,
                "best_prediction": None,
                "worst_prediction": None
            }
        
        total = len(predictions)
        correct = 0
        bullish_correct = 0
        bullish_total = 0
        bearish_correct = 0
        bearish_total = 0
        confidences = []
        
        for pred in predictions:
            if pred.get("actual_outcome"):
                predicted = pred["prediction"]
                actual = pred["actual_outcome"].get("direction", "neutral")
                
                if predicted == actual:
                    correct += 1
                
                if predicted == "bullish":
                    bullish_total += 1
                    if actual == "bullish":
                        bullish_correct += 1
                elif predicted == "bearish":
                    bearish_total += 1
                    if actual == "bearish":
                        bearish_correct += 1
                
                confidences.append(pred.get("confidence", 0))
        
        accuracy = (correct / total * 100) if total > 0 else 0
        bullish_acc = (bullish_correct / bullish_total * 100) if bullish_total > 0 else 0
        bearish_acc = (bearish_correct / bearish_total * 100) if bearish_total > 0 else 0
        avg_conf = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            "total_predictions": total,
            "accuracy": round(accuracy, 2),
            "bullish_accuracy": round(bullish_acc, 2),
            "bearish_accuracy": round(bearish_acc, 2),
            "avg_confidence": round(avg_conf, 2),
            "recent_predictions": predictions[-5:]  # Last 5 predictions
        }
    
    def get_feedback_prompt(self, symbol: str, days: int = 7) -> str:
        """
        Generate feedback prompt for AI learning
        
        Args:
            symbol: Trading symbol
            days: Number of days to analyze
        
        Returns:
            Feedback text for AI prompt
        """
        metrics = self.calculate_accuracy(symbol, days)
        predictions = self.get_recent_predictions(symbol, days)
        
        if not predictions:
            return "No historical prediction data available."
        
        feedback = f"""
📊 Historical Performance Analysis for {symbol}:

Overall Statistics:
- Total Predictions: {metrics['total_predictions']}
- Overall Accuracy: {metrics['accuracy']}%
- Bullish Prediction Accuracy: {metrics['bullish_accuracy']}%
- Bearish Prediction Accuracy: {metrics['bearish_accuracy']}%
- Average Confidence: {metrics['avg_confidence']}%

Recent Predictions (Last 5):
"""
        
        for pred in predictions[-5:]:
            timestamp = pred.get('timestamp', 'Unknown')
            prediction = pred.get('prediction', 'neutral')
            confidence = pred.get('confidence', 0)
            outcome = pred.get('actual_outcome')
            
            feedback += f"\n- {timestamp[:19]}: Predicted {prediction} (confidence: {confidence:.0%})"
            if outcome:
                actual = outcome.get('direction', 'unknown')
                correct = "✓" if prediction == actual else "✗"
                feedback += f" → Actual: {actual} {correct}"
        
        feedback += "\n\nKey Insights:"
        if metrics['accuracy'] > 60:
            feedback += "\n- Strong prediction accuracy. Continue current analysis approach."
        elif metrics['accuracy'] < 40:
            feedback += "\n- Low accuracy. Consider adjusting analysis methodology."
        
        if metrics['bullish_accuracy'] > metrics['bearish_accuracy'] + 20:
            feedback += "\n- Better at predicting bullish trends. Be more cautious with bearish predictions."
        elif metrics['bearish_accuracy'] > metrics['bullish_accuracy'] + 20:
            feedback += "\n- Better at predicting bearish trends. Be more cautious with bullish predictions."
        
        return feedback
