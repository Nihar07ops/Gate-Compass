import pandas as pd
import numpy as np

class GATEAnalyzer:
    def __init__(self):
        self.historical_data = []
    
    def analyze_historical_data(self, data):
        topics = data.get('topics', [])
        years = data.get('years', [])
        analysis = {
            'topicFrequency': self._calculate_frequency(topics),
            'difficultyTrend': self._analyze_difficulty(years),
            'predictions': self._generate_predictions(topics)
        }
        return analysis
    
    def _calculate_frequency(self, topics):
        frequency = {}
        for topic in topics:
            frequency[topic] = frequency.get(topic, 0) + 1
        return [{'topic': k, 'count': v} for k, v in frequency.items()]
    
    def _analyze_difficulty(self, years):
        return [np.random.uniform(2.5, 4.5) for _ in years]
    
    def _generate_predictions(self, topics):
        return {'predictedTopics': topics[:5] if topics else []}
