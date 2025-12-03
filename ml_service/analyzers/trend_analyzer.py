import pandas as pd
import numpy as np
from typing import Dict, List
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class TrendAnalyzer:
    """Analyze trends in GATE question patterns"""
    
    def __init__(self):
        pass
    
    def analyze_subject_trends(self, questions: List[Dict]) -> Dict:
        """Analyze trends for all subjects"""
        df = pd.DataFrame(questions)
        
        results = {}
        for subject in df['subject'].unique():
            subject_df = df[df['subject'] == subject]
            results[subject] = self._analyze_single_subject(subject_df)
        
        return results
    
    def _analyze_single_subject(self, df: pd.DataFrame) -> Dict:
        """Analyze trends for a single subject"""
        # Group by year and topic
        yearly_stats = df.groupby(['year', 'topic']).agg({
            'marks': 'sum',
            'text': 'count'
        }).rename(columns={'text': 'count'}).reset_index()
        
        # Calculate topic importance
        topic_stats = df.groupby('topic').agg({
            'marks': ['sum', 'mean'],
            'text': 'count'
        })
        topic_stats.columns = ['total_marks', 'avg_marks', 'question_count']
        topic_stats = topic_stats.reset_index()
        
        # Calculate trends
        topic_trends = {}
        for topic in df['topic'].unique():
            topic_data = yearly_stats[yearly_stats['topic'] == topic].sort_values('year')
            if len(topic_data) >= 3:
                trend = self._calculate_trend(topic_data['marks'].values)
                topic_trends[topic] = trend
            else:
                topic_trends[topic] = 'Stable'
        
        return {
            'yearly_stats': yearly_stats.to_dict('records'),
            'topic_stats': topic_stats.to_dict('records'),
            'topic_trends': topic_trends
        }
    
    def _calculate_trend(self, values: np.ndarray) -> str:
        """Calculate if trend is Rising, Falling, or Stable"""
        if len(values) < 2:
            return 'Stable'
        
        # Simple linear regression slope
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        
        # Threshold for significance
        threshold = 0.5
        
        if slope > threshold:
            return 'Rising'
        elif slope < -threshold:
            return 'Falling'
        else:
            return 'Stable'
    
    def get_topic_importance(self, questions: List[Dict], min_marks: float = 8.0) -> List[Dict]:
        """Get high-importance topics (>8 marks average)"""
        df = pd.DataFrame(questions)
        
        topic_importance = df.groupby(['subject', 'topic']).agg({
            'marks': ['sum', 'mean', 'count'],
            'year': lambda x: list(x.unique())
        }).reset_index()
        
        topic_importance.columns = ['subject', 'topic', 'total_marks', 'avg_marks', 'question_count', 'years']
        
        # Filter high importance
        high_importance = topic_importance[topic_importance['avg_marks'] >= min_marks]
        
        # Calculate 5-year average
        recent_years = [2021, 2022, 2023, 2024, 2025]
        recent_df = df[df['year'].isin(recent_years)]
        
        five_year_avg = recent_df.groupby(['subject', 'topic'])['marks'].mean().reset_index()
        five_year_avg.columns = ['subject', 'topic', 'five_year_avg']
        
        # Merge
        result = high_importance.merge(five_year_avg, on=['subject', 'topic'], how='left')
        result['five_year_avg'] = result['five_year_avg'].fillna(0)
        
        return result.to_dict('records')
    
    def get_yearly_distribution(self, questions: List[Dict]) -> Dict:
        """Get question distribution by year"""
        df = pd.DataFrame(questions)
        
        yearly = df.groupby('year').agg({
            'marks': 'sum',
            'text': 'count'
        }).rename(columns={'text': 'question_count'}).reset_index()
        
        return yearly.to_dict('records')
    
    def get_subject_weightage(self, questions: List[Dict]) -> List[Dict]:
        """Calculate subject-wise weightage percentage"""
        df = pd.DataFrame(questions)
        
        total_marks = df['marks'].sum()
        
        subject_marks = df.groupby('subject')['marks'].sum().reset_index()
        subject_marks['weightage_percent'] = (subject_marks['marks'] / total_marks * 100).round(2)
        subject_marks['question_count'] = df.groupby('subject').size().values
        
        return subject_marks.to_dict('records')
    
    def get_difficulty_distribution(self, questions: List[Dict]) -> Dict:
        """Get difficulty distribution"""
        df = pd.DataFrame(questions)
        
        difficulty_dist = df.groupby(['subject', 'difficulty']).size().reset_index(name='count')
        
        return difficulty_dist.to_dict('records')
    
    def compare_subjects(self, questions: List[Dict], subjects: List[str]) -> Dict:
        """Compare multiple subjects"""
        df = pd.DataFrame(questions)
        df = df[df['subject'].isin(subjects)]
        
        comparison = {}
        for subject in subjects:
            subject_df = df[df['subject'] == subject]
            comparison[subject] = {
                'total_questions': len(subject_df),
                'total_marks': subject_df['marks'].sum(),
                'avg_marks_per_question': subject_df['marks'].mean(),
                'topics_covered': subject_df['topic'].nunique(),
                'years_appeared': sorted(subject_df['year'].unique().tolist())
            }
        
        return comparison
