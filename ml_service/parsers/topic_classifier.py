from typing import Dict, List, Tuple
import re
from config import Config

class TopicClassifier:
    """Classify questions into subjects and topics"""
    
    def __init__(self):
        self.subjects = Config.SUBJECTS
        self.topic_keywords = Config.TOPIC_KEYWORDS
        
    def classify_question(self, question_text: str) -> Tuple[str, str, float]:
        """
        Classify a question into subject and topic
        Returns: (subject, topic, confidence_score)
        """
        text_lower = question_text.lower()
        
        best_subject = None
        best_topic = None
        best_score = 0
        
        # Check each subject's topics
        for subject, topics in self.topic_keywords.items():
            for topic, keywords in topics.items():
                score = 0
                for keyword in keywords:
                    if keyword in text_lower:
                        # Weight longer keywords more
                        score += len(keyword.split())
                
                if score > best_score:
                    best_score = score
                    best_subject = subject
                    best_topic = topic
        
        # If no match found, try to match just subject
        if not best_subject:
            best_subject = self._classify_subject_only(text_lower)
            best_topic = 'General'
            best_score = 0.5
        
        # Calculate confidence (0-1)
        confidence = min(best_score / 5.0, 1.0) if best_score > 0 else 0.3
        
        return best_subject, best_topic, confidence
    
    def _classify_subject_only(self, text: str) -> str:
        """Fallback: classify to subject only"""
        subject_keywords = {
            'Algorithms': ['algorithm', 'complexity', 'sorting', 'searching'],
            'Data Structures': ['array', 'list', 'tree', 'graph', 'stack', 'queue'],
            'Operating Systems': ['process', 'thread', 'memory', 'scheduling'],
            'Databases': ['database', 'sql', 'query', 'table', 'relation'],
            'Computer Networks': ['network', 'protocol', 'tcp', 'ip', 'routing'],
            'Theory of Computation': ['automata', 'grammar', 'turing', 'language'],
            'Compiler Design': ['compiler', 'parser', 'lexical', 'syntax'],
            'Digital Logic': ['gate', 'flip flop', 'boolean', 'circuit'],
            'Computer Organization': ['cpu', 'cache', 'pipeline', 'instruction'],
            'Programming & Data Structures': ['program', 'code', 'function', 'pointer'],
            'Engineering Mathematics': ['matrix', 'probability', 'calculus'],
            'Discrete Mathematics': ['set', 'relation', 'graph theory', 'logic'],
        }
        
        best_subject = 'General'
        best_count = 0
        
        for subject, keywords in subject_keywords.items():
            count = sum(1 for kw in keywords if kw in text)
            if count > best_count:
                best_count = count
                best_subject = subject
        
        return best_subject
    
    def batch_classify(self, questions: List[Dict]) -> List[Dict]:
        """Classify multiple questions"""
        classified = []
        
        for q in questions:
            subject, topic, confidence = self.classify_question(q['text'])
            
            classified.append({
                **q,
                'subject': subject,
                'topic': topic,
                'confidence': confidence
            })
        
        return classified
    
    def get_subject_topics(self, subject: str) -> List[str]:
        """Get all topics for a subject"""
        return list(self.topic_keywords.get(subject, {}).keys())
