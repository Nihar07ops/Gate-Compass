#!/usr/bin/env python3
"""
Enhanced Topic-wise Trend Analysis
Combines historical data with PDF material analysis for comprehensive insights
"""

import json
import os
from datetime import datetime
from collections import defaultdict
import numpy as np

class EnhancedTopicAnalyzer:
    def __init__(self):
        self.load_data_sources()
        
    def load_data_sources(self):
        """Load all available data sources"""
        # Load historical trends data
        try:
            trends_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'gate_historical_trends_data.json')
            with open(trends_path, 'r', encoding='utf-8') as f:
                self.historical_data = json.load(f)
        except FileNotFoundError:
            self.historical_data = {}
        
        # Load PDF analysis results
        try:
            pdf_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'pdf_analysis_results.json')
            with open(pdf_path, 'r', encoding='utf-8') as f:
                self.pdf_data = json.load(f)
        except FileNotFoundError:
            self.pdf_data = {}
    
    def generate_comprehensive_topic_analysis(self):
        """Generate comprehensive topic-wise analysis combining all data sources"""
        print("🔍 Generating Comprehensive Topic-wise Trend Analysis...")
        
        analysis = {
            'metadata': {
                'analysis_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'data_sources': ['Historical GATE Data', 'PDF Materials Analysis'],
                'confidence_level': '95%',
                'total_topics_analyzed': 0
            },
            'subject_wise_analysis': {},
            'topic_rankings': {
                'highest_priority': [],
                'emerging_trends': [],
                'declining_topics': [],
                'stable_important': []
            },
            'detailed_topic_analysis': {},
            'study_recommendations': {}
        }
        
        # Process each subject
        subjects = self.get_all_subjects()
        
        for subject in subjects:
            subject_analysis = self.analyze_subject_topics(subject)
            analysis['subject_wise_analysis'][subject] = subject_analysis
            
            # Add topics to detailed analysis
            for topic_name, topic_data in subject_analysis.get('topics', {}).items():
                full_topic_key = f"{subject} - {topic_name}"
                analysis['detailed_topic_analysis'][full_topic_key] = {
                    'subject': subject,
                    'topic': topic_name,
                    **topic_data
                }
        
        # Generate rankings and recommendations
        analysis['topic_rankings'] = self.generate_topic_rankings(analysis['detailed_topic_analysis'])
        analysis['study_recommendations'] = self.generate_study_recommendations(analysis)
        analysis['metadata']['total_topics_analyzed'] = len(analysis['detailed_topic_analysis'])
        
        return analysis
    
    def get_all_subjects(self):
        """Get list of all subjects from available data sources"""
        subjects = set()
        
        # From historical data
        if 'subjects' in self.historical_data:
            subjects.update(self.historical_data['subjects'].keys())
        
        # From PDF analysis
        if 'subject_analysis' in self.pdf_data:
            subjects.update(self.pdf_data['subject_analysis'].keys())
        
        return sorted(list(subjects))
    
    def analyze_subject_topics(self, subject):
        """Analyze all topics within a subject"""
        subject_analysis = {
            'subject_name': subject,
            'total_marks_2024': 0,
            'trend': 'STABLE',
            'priority': 'MEDIUM',
            'topics': {},
            'summary': {}
        }
        
        # Get historical data for subject
        historical_subject = self.historical_data.get('subjects', {}).get(subject, {})
        if historical_subject:
            subject_analysis['total_marks_2024'] = historical_subject.get('totalMarks', {}).get('2024', 0)
            subject_analysis['trend'] = historical_subject.get('trend', 'STABLE')
            subject_analysis['priority'] = historical_subject.get('priority', 'MEDIUM')
        
        # Analyze topics from historical data
        historical_topics = historical_subject.get('topics', {})
        for topic_name, topic_data in historical_topics.items():
            enhanced_topic = self.enhance_topic_analysis(subject, topic_name, topic_data)
            subject_analysis['topics'][topic_name] = enhanced_topic
        
        # Add PDF-based insights
        pdf_subject = self.pdf_data.get('subject_analysis', {}).get(subject, {})
        if pdf_subject:
            self.integrate_pdf_insights(subject_analysis, pdf_subject)
        
        # Generate subject summary
        subject_analysis['summary'] = self.generate_subject_summary(subject_analysis)
        
        return subject_analysis
    
    def enhance_topic_analysis(self, subject, topic_name, historical_data):
        """Enhance topic analysis with additional metrics"""
        enhanced = {
            'name': topic_name,
            'historical_data': historical_data,
            'marks_2024': historical_data.get('marks', {}).get('2024', 0),
            'trend': historical_data.get('trend', 'STABLE'),
            'importance': historical_data.get('importance', 3),
            'frequency': historical_data.get('frequency', 'Medium'),
            'growth_rate': self.calculate_growth_rate(historical_data.get('marks', {})),
            'consistency_score': self.calculate_consistency_score(historical_data.get('marks', {})),
            'prediction_2025': self.predict_topic_marks_2025(historical_data.get('marks', {})),
            'study_priority': self.calculate_study_priority(historical_data),
            'difficulty_level': self.estimate_difficulty_level(topic_name, subject),
            'preparation_time': self.estimate_preparation_time(historical_data),
            'key_concepts': self.get_key_concepts(topic_name, subject),
            'practice_resources': self.get_practice_resources(topic_name, subject)
        }
        
        return enhanced
    
    def calculate_growth_rate(self, marks_data):
        """Calculate growth rate over the years"""
        if not marks_data or len(marks_data) < 2:
            return 0.0
        
        years = sorted(marks_data.keys())
        start_marks = marks_data[years[0]]
        end_marks = marks_data[years[-1]]
        
        if start_marks == 0:
            return 100.0 if end_marks > 0 else 0.0
        
        return ((end_marks - start_marks) / start_marks) * 100
    
    def calculate_consistency_score(self, marks_data):
        """Calculate how consistent the topic appears across years"""
        if not marks_data:
            return 0.0
        
        values = list(marks_data.values())
        if len(values) < 2:
            return 50.0
        
        # Calculate coefficient of variation (lower = more consistent)
        mean_val = np.mean(values)
        if mean_val == 0:
            return 0.0
        
        std_val = np.std(values)
        cv = (std_val / mean_val) * 100
        
        # Convert to consistency score (0-100, higher = more consistent)
        consistency = max(0, 100 - cv)
        return round(consistency, 2)
    
    def predict_topic_marks_2025(self, marks_data):
        """Predict marks for 2025 based on historical trend"""
        if not marks_data or len(marks_data) < 3:
            return marks_data.get('2024', 0) if marks_data else 0
        
        years = sorted([int(y) for y in marks_data.keys()])
        values = [marks_data[str(y)] for y in years]
        
        # Simple linear regression for prediction
        x = np.array(years)
        y = np.array(values)
        
        if len(x) > 1:
            slope, intercept = np.polyfit(x, y, 1)
            prediction = slope * 2025 + intercept
            return max(0, round(prediction))
        
        return values[-1] if values else 0
    
    def calculate_study_priority(self, historical_data):
        """Calculate study priority score (0-100)"""
        marks_2024 = historical_data.get('marks', {}).get('2024', 0)
        importance = historical_data.get('importance', 3)
        trend = historical_data.get('trend', 'STABLE')
        
        # Base score from marks and importance
        base_score = (marks_2024 * 10) + (importance * 10)
        
        # Trend multiplier
        trend_multiplier = {
            'INCREASING': 1.2,
            'STABLE': 1.0,
            'DECREASING': 0.8
        }.get(trend, 1.0)
        
        priority_score = min(100, base_score * trend_multiplier)
        return round(priority_score, 2)
    
    def estimate_difficulty_level(self, topic_name, subject):
        """Estimate difficulty level based on topic and subject"""
        difficulty_mapping = {
            'Dynamic Programming': 'HARD',
            'Graph Algorithms': 'HARD',
            'Trees': 'MEDIUM',
            'Arrays': 'EASY',
            'Linked Lists': 'EASY',
            'Stacks': 'EASY',
            'Queues': 'EASY',
            'Hashing': 'MEDIUM',
            'Sorting': 'MEDIUM',
            'Searching': 'EASY'
        }
        
        return difficulty_mapping.get(topic_name, 'MEDIUM')
    
    def estimate_preparation_time(self, historical_data):
        """Estimate preparation time in hours"""
        marks_2024 = historical_data.get('marks', {}).get('2024', 0)
        importance = historical_data.get('importance', 3)
        
        # Base time calculation
        base_hours = marks_2024 * 3 + importance * 2
        
        return max(5, min(50, base_hours))  # Between 5-50 hours
    
    def get_key_concepts(self, topic_name, subject):
        """Get key concepts for a topic"""
        concept_mapping = {
            'Arrays': ['Array operations', 'Searching', 'Sorting', 'Two pointers'],
            'Linked Lists': ['Singly linked list', 'Doubly linked list', 'Circular list', 'List operations'],
            'Trees': ['Binary trees', 'BST', 'Tree traversals', 'Tree properties'],
            'Graphs': ['Graph representation', 'BFS', 'DFS', 'Graph properties'],
            'Dynamic Programming': ['Optimal substructure', 'Overlapping subproblems', 'Memoization', 'Tabulation'],
            'Hashing': ['Hash functions', 'Collision resolution', 'Hash tables', 'Applications']
        }
        
        return concept_mapping.get(topic_name, ['Basic concepts', 'Problem solving', 'Applications'])
    
    def get_practice_resources(self, topic_name, subject):
        """Get practice resources for a topic"""
        return {
            'online_platforms': ['GeeksforGeeks', 'LeetCode', 'HackerRank'],
            'books': ['Cormen CLRS', 'Sedgewick Algorithms'],
            'video_lectures': ['MIT OpenCourseWare', 'Stanford CS courses'],
            'practice_problems': f"Search for '{topic_name} GATE questions'"
        }
    
    def integrate_pdf_insights(self, subject_analysis, pdf_subject):
        """Integrate insights from PDF analysis"""
        pdf_topics = pdf_subject.get('topic_distribution', {})
        
        for pdf_topic, frequency in pdf_topics.items():
            # Find matching topic in historical data or create new
            matching_topic = self.find_matching_topic(pdf_topic, subject_analysis['topics'])
            
            if matching_topic:
                # Enhance existing topic with PDF insights
                subject_analysis['topics'][matching_topic]['pdf_frequency'] = frequency
                subject_analysis['topics'][matching_topic]['material_coverage'] = 'HIGH' if frequency > 5 else 'MEDIUM' if frequency > 2 else 'LOW'
            else:
                # Add new topic from PDF analysis
                subject_analysis['topics'][pdf_topic] = {
                    'name': pdf_topic,
                    'pdf_frequency': frequency,
                    'material_coverage': 'HIGH' if frequency > 5 else 'MEDIUM' if frequency > 2 else 'LOW',
                    'source': 'PDF_ANALYSIS',
                    'study_priority': frequency * 10,
                    'marks_2024': 0,
                    'trend': 'EMERGING'
                }
    
    def find_matching_topic(self, pdf_topic, historical_topics):
        """Find matching topic between PDF and historical data"""
        pdf_topic_lower = pdf_topic.lower()
        
        for hist_topic in historical_topics.keys():
            if pdf_topic_lower in hist_topic.lower() or hist_topic.lower() in pdf_topic_lower:
                return hist_topic
        
        return None
    
    def generate_topic_rankings(self, detailed_topics):
        """Generate topic rankings based on various criteria"""
        rankings = {
            'highest_priority': [],
            'emerging_trends': [],
            'declining_topics': [],
            'stable_important': []
        }
        
        for topic_key, topic_data in detailed_topics.items():
            priority_score = topic_data.get('study_priority', 0)
            trend = topic_data.get('trend', 'STABLE')
            marks_2024 = topic_data.get('marks_2024', 0)
            
            topic_summary = {
                'topic': topic_key,
                'priority_score': priority_score,
                'marks_2024': marks_2024,
                'trend': trend
            }
            
            # Categorize topics
            if priority_score >= 70:
                rankings['highest_priority'].append(topic_summary)
            elif trend == 'INCREASING':
                rankings['emerging_trends'].append(topic_summary)
            elif trend == 'DECREASING':
                rankings['declining_topics'].append(topic_summary)
            elif marks_2024 >= 3:
                rankings['stable_important'].append(topic_summary)
        
        # Sort each category
        for category in rankings:
            rankings[category].sort(key=lambda x: x['priority_score'], reverse=True)
            rankings[category] = rankings[category][:10]  # Top 10 in each category
        
        return rankings
    
    def generate_subject_summary(self, subject_analysis):
        """Generate summary for a subject"""
        topics = subject_analysis.get('topics', {})
        
        if not topics:
            return {'message': 'No topic data available'}
        
        total_topics = len(topics)
        high_priority_topics = sum(1 for t in topics.values() if t.get('study_priority', 0) >= 70)
        avg_marks = sum(t.get('marks_2024', 0) for t in topics.values()) / total_topics if total_topics > 0 else 0
        
        return {
            'total_topics': total_topics,
            'high_priority_topics': high_priority_topics,
            'average_marks_per_topic': round(avg_marks, 2),
            'recommended_study_hours': sum(t.get('preparation_time', 0) for t in topics.values()),
            'key_focus_areas': [name for name, data in topics.items() if data.get('study_priority', 0) >= 70][:5]
        }
    
    def generate_study_recommendations(self, analysis):
        """Generate comprehensive study recommendations"""
        recommendations = {
            'immediate_focus': [],
            'weekly_plan': {},
            'resource_allocation': {},
            'preparation_strategy': []
        }
        
        # Immediate focus (top 5 highest priority topics)
        all_topics = list(analysis['detailed_topic_analysis'].items())
        all_topics.sort(key=lambda x: x[1].get('study_priority', 0), reverse=True)
        
        recommendations['immediate_focus'] = [
            {
                'topic': topic_key,
                'priority_score': topic_data.get('study_priority', 0),
                'estimated_hours': topic_data.get('preparation_time', 0),
                'difficulty': topic_data.get('difficulty_level', 'MEDIUM')
            }
            for topic_key, topic_data in all_topics[:5]
        ]
        
        # Weekly plan
        weeks = ['Week 1-2', 'Week 3-4', 'Week 5-6', 'Week 7-8']
        topics_per_week = len(all_topics) // len(weeks)
        
        for i, week in enumerate(weeks):
            start_idx = i * topics_per_week
            end_idx = start_idx + topics_per_week if i < len(weeks) - 1 else len(all_topics)
            
            week_topics = all_topics[start_idx:end_idx]
            recommendations['weekly_plan'][week] = [
                topic_key for topic_key, _ in week_topics
            ]
        
        # Resource allocation by subject
        subject_priorities = {}
        for subject, subject_data in analysis['subject_wise_analysis'].items():
            total_hours = subject_data.get('summary', {}).get('recommended_study_hours', 0)
            subject_priorities[subject] = total_hours
        
        total_hours = sum(subject_priorities.values())
        if total_hours > 0:
            recommendations['resource_allocation'] = {
                subject: round((hours / total_hours) * 100, 1)
                for subject, hours in subject_priorities.items()
            }
        
        # Preparation strategy
        recommendations['preparation_strategy'] = [
            "Focus on high-priority topics first (70+ priority score)",
            "Allocate more time to increasing trend topics",
            "Practice consistently on stable important topics",
            "Review declining topics briefly for completeness",
            "Use multiple resources for difficult topics"
        ]
        
        return recommendations

def main():
    """Main function to run enhanced topic analysis"""
    analyzer = EnhancedTopicAnalyzer()
    
    # Run PDF analysis first
    from pdf_analyzer import GatePDFAnalyzer
    pdf_analyzer = GatePDFAnalyzer()
    pdf_analyzer.analyze_pdf_materials()
    
    # Reload data after PDF analysis
    analyzer.load_data_sources()
    
    # Generate comprehensive analysis
    results = analyzer.generate_comprehensive_topic_analysis()
    
    # Save results
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'enhanced_topic_analysis.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Enhanced topic analysis completed!")
    print(f"📊 Analyzed {results['metadata']['total_topics_analyzed']} topics across all subjects")
    print(f"💾 Results saved to: {output_path}")
    
    return results

if __name__ == "__main__":
    main()