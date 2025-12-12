import pandas as pd
import numpy as np
from collections import defaultdict
import json
import os

class EnhancedGATEAnalyzer:
    def __init__(self):
        self.load_question_data()
        self.subjects = [
            "Algorithms", "Data Structures", "Operating Systems", "DBMS",
            "Computer Networks", "Theory of Computation", "Compiler Design",
            "Digital Logic", "Computer Organization", "Discrete Mathematics",
            "Programming", "General Aptitude", "Engineering Mathematics"
        ]
        
    def load_question_data(self):
        """Load question data from the database"""
        try:
            data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'comprehensive_gate_questions.json')
            with open(data_path, 'r', encoding='utf-8') as f:
                self.questions = json.load(f)
        except FileNotFoundError:
            # Fallback to original database
            try:
                data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'gate_professional_bank.json')
                with open(data_path, 'r', encoding='utf-8') as f:
                    self.questions = json.load(f)
            except FileNotFoundError:
                self.questions = []
        except UnicodeDecodeError:
            self.questions = []
    
    def get_year_wise_analysis(self, start_year=2015, end_year=2024):
        """Get comprehensive year-wise analysis for all subjects and topics"""
        analysis = {
            'yearRange': {'start': start_year, 'end': end_year},
            'subjects': {},
            'overallTrends': self._get_overall_trends(start_year, end_year),
            'yearlyStats': self._get_yearly_statistics(start_year, end_year)
        }
        
        for subject in self.subjects:
            analysis['subjects'][subject] = self._analyze_subject_by_year(subject, start_year, end_year)
            
        return analysis
    
    def _analyze_subject_by_year(self, subject, start_year, end_year):
        """Analyze a specific subject year-wise with topic breakdown"""
        subject_questions = [q for q in self.questions if q.get('subject') == subject]
        
        year_data = {}
        topic_trends = defaultdict(lambda: defaultdict(int))
        difficulty_trends = defaultdict(list)
        marks_distribution = defaultdict(lambda: defaultdict(int))
        
        for year in range(start_year, end_year + 1):
            year_questions = [q for q in subject_questions if q.get('year') == year]
            
            # Topic analysis for this year
            topics = {}
            total_marks = 0
            difficulties = []
            
            for question in year_questions:
                topic = question.get('topic', 'Unknown')
                difficulty = question.get('difficulty', 'medium')
                marks = question.get('marks', 1)
                
                # Count questions per topic
                if topic not in topics:
                    topics[topic] = {'count': 0, 'marks': 0, 'difficulties': []}
                
                topics[topic]['count'] += 1
                topics[topic]['marks'] += marks
                topics[topic]['difficulties'].append(difficulty)
                
                # Track trends
                topic_trends[topic][year] += 1
                difficulty_trends[year].append(self._difficulty_to_number(difficulty))
                marks_distribution[year][marks] += 1
                total_marks += marks
            
            year_data[year] = {
                'totalQuestions': len(year_questions),
                'totalMarks': total_marks,
                'topics': topics,
                'averageDifficulty': np.mean(difficulty_trends[year]) if difficulty_trends[year] else 2.5,
                'marksDistribution': dict(marks_distribution[year])
            }
        
        return {
            'yearlyData': year_data,
            'topicTrends': self._format_topic_trends(topic_trends, start_year, end_year),
            'subjectSummary': self._get_subject_summary(subject_questions, start_year, end_year)
        }
    
    def _get_overall_trends(self, start_year, end_year):
        """Get overall trends across all subjects"""
        yearly_totals = defaultdict(int)
        yearly_subjects = defaultdict(set)
        yearly_difficulty = defaultdict(list)
        
        for question in self.questions:
            year = question.get('year')
            if start_year <= year <= end_year:
                yearly_totals[year] += 1
                yearly_subjects[year].add(question.get('subject'))
                yearly_difficulty[year].append(self._difficulty_to_number(question.get('difficulty', 'medium')))
        
        trends = []
        for year in range(start_year, end_year + 1):
            trends.append({
                'year': year,
                'totalQuestions': yearly_totals[year],
                'subjectsCount': len(yearly_subjects[year]),
                'averageDifficulty': np.mean(yearly_difficulty[year]) if yearly_difficulty[year] else 2.5
            })
        
        return trends
    
    def _get_yearly_statistics(self, start_year, end_year):
        """Get detailed yearly statistics"""
        stats = {}
        
        for year in range(start_year, end_year + 1):
            year_questions = [q for q in self.questions if q.get('year') == year]
            
            if not year_questions:
                stats[year] = self._empty_year_stats()
                continue
            
            # Subject distribution
            subject_dist = defaultdict(int)
            topic_dist = defaultdict(int)
            difficulty_dist = defaultdict(int)
            marks_dist = defaultdict(int)
            
            for q in year_questions:
                subject_dist[q.get('subject', 'Unknown')] += 1
                topic_dist[q.get('topic', 'Unknown')] += 1
                difficulty_dist[q.get('difficulty', 'medium')] += 1
                marks_dist[q.get('marks', 1)] += 1
            
            stats[year] = {
                'totalQuestions': len(year_questions),
                'subjectDistribution': dict(subject_dist),
                'topicDistribution': dict(topic_dist),
                'difficultyDistribution': dict(difficulty_dist),
                'marksDistribution': dict(marks_dist),
                'mostFrequentSubject': max(subject_dist.items(), key=lambda x: x[1])[0] if subject_dist else 'None',
                'mostFrequentTopic': max(topic_dist.items(), key=lambda x: x[1])[0] if topic_dist else 'None'
            }
        
        return stats
    
    def _format_topic_trends(self, topic_trends, start_year, end_year):
        """Format topic trends for visualization"""
        formatted_trends = {}
        
        for topic, year_counts in topic_trends.items():
            trend_data = []
            for year in range(start_year, end_year + 1):
                trend_data.append({
                    'year': year,
                    'count': year_counts.get(year, 0)
                })
            
            formatted_trends[topic] = {
                'data': trend_data,
                'totalQuestions': sum(year_counts.values()),
                'peakYear': max(year_counts.items(), key=lambda x: x[1])[0] if year_counts else start_year,
                'trend': self._calculate_trend(trend_data)
            }
        
        return formatted_trends
    
    def _get_subject_summary(self, subject_questions, start_year, end_year):
        """Get summary statistics for a subject"""
        if not subject_questions:
            return self._empty_subject_summary()
        
        total_questions = len(subject_questions)
        topics = set(q.get('topic') for q in subject_questions)
        difficulties = [q.get('difficulty', 'medium') for q in subject_questions]
        years_active = set(q.get('year') for q in subject_questions if start_year <= q.get('year', 0) <= end_year)
        
        difficulty_counts = defaultdict(int)
        for d in difficulties:
            difficulty_counts[d] += 1
        
        return {
            'totalQuestions': total_questions,
            'uniqueTopics': len(topics),
            'topicsList': list(topics),
            'yearsActive': sorted(list(years_active)),
            'difficultyBreakdown': dict(difficulty_counts),
            'averageDifficulty': np.mean([self._difficulty_to_number(d) for d in difficulties]),
            'questionDensity': total_questions / len(years_active) if years_active else 0
        }
    
    def get_topic_wise_predictions(self, subject=None, year=None):
        """Get ML-based predictions for topic importance"""
        if subject:
            questions = [q for q in self.questions if q.get('subject') == subject]
        else:
            questions = self.questions
        
        if year:
            questions = [q for q in questions if q.get('year') == year]
        
        # Calculate topic importance based on frequency, recency, and marks
        topic_scores = defaultdict(lambda: {'frequency': 0, 'marks': 0, 'recency': 0, 'difficulty': []})
        
        current_year = 2024
        for q in questions:
            topic = q.get('topic', 'Unknown')
            year_weight = max(0, (q.get('year', 2020) - 2015) / 10)  # Recency weight
            marks = q.get('marks', 1)
            difficulty = self._difficulty_to_number(q.get('difficulty', 'medium'))
            
            topic_scores[topic]['frequency'] += 1
            topic_scores[topic]['marks'] += marks
            topic_scores[topic]['recency'] += year_weight
            topic_scores[topic]['difficulty'].append(difficulty)
        
        # Calculate final importance scores
        predictions = []
        for topic, scores in topic_scores.items():
            avg_difficulty = np.mean(scores['difficulty']) if scores['difficulty'] else 2.5
            importance_score = (
                scores['frequency'] * 0.4 +
                scores['marks'] * 0.3 +
                scores['recency'] * 0.2 +
                avg_difficulty * 0.1
            )
            
            predictions.append({
                'topic': topic,
                'importanceScore': round(importance_score, 2),
                'frequency': scores['frequency'],
                'totalMarks': scores['marks'],
                'averageDifficulty': round(avg_difficulty, 2),
                'confidence': min(95, max(60, scores['frequency'] * 10))  # Confidence based on data points
            })
        
        return sorted(predictions, key=lambda x: x['importanceScore'], reverse=True)
    
    def _difficulty_to_number(self, difficulty):
        """Convert difficulty string to number"""
        mapping = {'easy': 1, 'medium': 2.5, 'hard': 4}
        return mapping.get(difficulty.lower(), 2.5)
    
    def _calculate_trend(self, trend_data):
        """Calculate if trend is increasing, decreasing, or stable"""
        if len(trend_data) < 2:
            return 'stable'
        
        counts = [d['count'] for d in trend_data]
        recent_avg = np.mean(counts[-3:]) if len(counts) >= 3 else counts[-1]
        early_avg = np.mean(counts[:3]) if len(counts) >= 3 else counts[0]
        
        if recent_avg > early_avg * 1.2:
            return 'increasing'
        elif recent_avg < early_avg * 0.8:
            return 'decreasing'
        else:
            return 'stable'
    
    def _empty_year_stats(self):
        """Return empty statistics for years with no data"""
        return {
            'totalQuestions': 0,
            'subjectDistribution': {},
            'topicDistribution': {},
            'difficultyDistribution': {},
            'marksDistribution': {},
            'mostFrequentSubject': 'None',
            'mostFrequentTopic': 'None'
        }
    
    def _empty_subject_summary(self):
        """Return empty summary for subjects with no data"""
        return {
            'totalQuestions': 0,
            'uniqueTopics': 0,
            'topicsList': [],
            'yearsActive': [],
            'difficultyBreakdown': {},
            'averageDifficulty': 0,
            'questionDensity': 0
        }