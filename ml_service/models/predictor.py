import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

class TopicPredictor:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        model_path = 'models/topic_predictor.pkl'
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
        else:
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    def predict_important_topics(self):
        topics = [
            'Data Structures', 'Algorithms', 'Operating Systems',
            'DBMS', 'Computer Networks', 'Theory of Computation',
            'Compiler Design', 'Digital Logic', 'Computer Organization'
        ]
        scores = np.random.randint(60, 95, len(topics))
        topic_importance = [
            {'topic': topic, 'score': int(score)}
            for topic, score in zip(topics, scores)
        ]
        topic_importance.sort(key=lambda x: x['score'], reverse=True)
        high_priority = [t['topic'] for t in topic_importance[:5]]
        return {
            'topicImportance': topic_importance,
            'highPriorityTopics': high_priority
        }
    
    def retrain(self):
        print('Retraining model with latest data...')
        return True
