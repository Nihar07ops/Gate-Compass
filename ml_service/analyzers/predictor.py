import pandas as pd
import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class TrendPredictor:
    """Predict future trends using time series analysis"""
    
    def __init__(self):
        pass
    
    def predict_2026_trends(self, questions: List[Dict], top_n: int = 20) -> List[Dict]:
        """Predict top 20 topics for 2026"""
        df = pd.DataFrame(questions)
        
        # Get recent trends (last 5 years)
        recent_years = [2021, 2022, 2023, 2024, 2025]
        recent_df = df[df['year'].isin(recent_years)]
        
        predictions = []
        
        for subject in df['subject'].unique():
            subject_df = recent_df[recent_df['subject'] == subject]
            
            for topic in subject_df['topic'].unique():
                topic_df = subject_df[subject_df['topic'] == topic]
                
                # Calculate yearly marks
                yearly_marks = topic_df.groupby('year')['marks'].sum()
                
                if len(yearly_marks) >= 3:
                    # Simple linear extrapolation
                    years = yearly_marks.index.values
                    marks = yearly_marks.values
                    
                    # Fit linear trend
                    if len(years) > 1:
                        slope, intercept = np.polyfit(years, marks, 1)
                        predicted_2026 = slope * 2026 + intercept
                        predicted_2026 = max(0, predicted_2026)  # No negative marks
                        
                        # Calculate confidence based on consistency
                        variance = np.var(marks)
                        confidence = self._calculate_confidence(variance, len(marks))
                        
                        # Determine importance
                        avg_marks = marks.mean()
                        importance = self._determine_importance(predicted_2026, avg_marks)
                        
                        predictions.append({
                            'subject': subject,
                            'topic': topic,
                            'predicted_marks_2026': round(predicted_2026, 2),
                            'avg_marks_5yr': round(avg_marks, 2),
                            'trend': self._get_trend_direction(slope),
                            'confidence': confidence,
                            'importance': importance,
                            'historical_marks': marks.tolist(),
                            'historical_years': years.tolist()
                        })
        
        # Sort by predicted marks and return top N
        predictions.sort(key=lambda x: x['predicted_marks_2026'], reverse=True)
        return predictions[:top_n]
    
    def _calculate_confidence(self, variance: float, n_points: int) -> str:
        """Calculate prediction confidence"""
        # Lower variance and more data points = higher confidence
        if variance < 2 and n_points >= 4:
            return 'High'
        elif variance < 5 and n_points >= 3:
            return 'Medium'
        else:
            return 'Low'
    
    def _determine_importance(self, predicted: float, historical_avg: float) -> str:
        """Determine topic importance"""
        score = (predicted + historical_avg) / 2
        
        if score >= 8:
            return 'High'
        elif score >= 5:
            return 'Medium'
        else:
            return 'Low'
    
    def _get_trend_direction(self, slope: float) -> str:
        """Get trend direction from slope"""
        if slope > 0.5:
            return 'Rising'
        elif slope < -0.5:
            return 'Falling'
        else:
            return 'Stable'
    
    def predict_subject_weightage(self, questions: List[Dict]) -> Dict[str, float]:
        """Predict subject weightage for 2026"""
        df = pd.DataFrame(questions)
        
        # Calculate recent trends
        recent_years = [2022, 2023, 2024, 2025]
        recent_df = df[df['year'].isin(recent_years)]
        
        predictions = {}
        
        for subject in df['subject'].unique():
            subject_df = recent_df[recent_df['subject'] == subject]
            yearly_marks = subject_df.groupby('year')['marks'].sum()
            
            if len(yearly_marks) >= 2:
                years = yearly_marks.index.values
                marks = yearly_marks.values
                
                # Linear extrapolation
                slope, intercept = np.polyfit(years, marks, 1)
                predicted = slope * 2026 + intercept
                predictions[subject] = max(0, round(predicted, 2))
            else:
                predictions[subject] = 0
        
        # Normalize to percentages
        total = sum(predictions.values())
        if total > 0:
            predictions = {k: round(v/total * 100, 2) for k, v in predictions.items()}
        
        return predictions
    
    def get_rising_falling_topics(self, questions: List[Dict]) -> Dict:
        """Get lists of rising and falling topics"""
        df = pd.DataFrame(questions)
        
        rising = []
        falling = []
        
        for subject in df['subject'].unique():
            subject_df = df[df['subject'] == subject]
            
            for topic in subject_df['topic'].unique():
                topic_df = subject_df[subject_df['topic'] == topic]
                yearly_marks = topic_df.groupby('year')['marks'].sum().sort_index()
                
                if len(yearly_marks) >= 3:
                    years = yearly_marks.index.values
                    marks = yearly_marks.values
                    
                    slope, _ = np.polyfit(years, marks, 1)
                    
                    if slope > 1.0:  # Significantly rising
                        rising.append({
                            'subject': subject,
                            'topic': topic,
                            'slope': round(slope, 2),
                            'recent_marks': marks[-1],
                            'change': round((marks[-1] - marks[0]) / marks[0] * 100, 1) if marks[0] > 0 else 0
                        })
                    elif slope < -1.0:  # Significantly falling
                        falling.append({
                            'subject': subject,
                            'topic': topic,
                            'slope': round(slope, 2),
                            'recent_marks': marks[-1],
                            'change': round((marks[-1] - marks[0]) / marks[0] * 100, 1) if marks[0] > 0 else 0
                        })
        
        # Sort by absolute slope
        rising.sort(key=lambda x: x['slope'], reverse=True)
        falling.sort(key=lambda x: x['slope'])
        
        return {
            'rising': rising[:10],
            'falling': falling[:10]
        }
