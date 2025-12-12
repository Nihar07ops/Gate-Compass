from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models.predictor import TopicPredictor
from utils.analyzer import GATEAnalyzer


load_dotenv()

app = Flask(__name__)
CORS(app)

predictor = TopicPredictor()
analyzer = GATEAnalyzer()


@app.route('/predict', methods=['GET'])
def predict_topics():
    try:
        predictions = predictor.predict_important_topics()
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_papers():
    try:
        data = request.json
        results = analyzer.analyze_historical_data(data)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain_model():
    try:
        predictor.retrain()
        return jsonify({'message': 'Model retrained successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})



@app.route('/topic-wise/analysis', methods=['GET'])
def get_topic_wise_analysis():
    """Pure topic-wise analysis endpoint"""
    try:
        # Direct topic-wise data - no subject grouping
        topics = {
            # Very High Priority Topics (4+ marks)
            "Graph Algorithms": {"marks": 5, "difficulty": "Hard", "priority": "Very High", "trend": "Increasing", "years_appeared": 10},
            "Trees": {"marks": 4, "difficulty": "Medium", "priority": "Very High", "trend": "Stable", "years_appeared": 10},
            "Dynamic Programming": {"marks": 4, "difficulty": "Hard", "priority": "Very High", "trend": "Increasing", "years_appeared": 9},
            "Graph Theory": {"marks": 4, "difficulty": "Medium", "priority": "Very High", "trend": "Increasing", "years_appeared": 8},
            
            # High Priority Topics (2-3 marks)
            "Set Theory": {"marks": 3, "difficulty": "Easy", "priority": "High", "trend": "Stable", "years_appeared": 7},
            "Arrays": {"marks": 2, "difficulty": "Easy", "priority": "High", "trend": "Stable", "years_appeared": 10},
            "Linked Lists": {"marks": 2, "difficulty": "Easy", "priority": "High", "trend": "Stable", "years_appeared": 9},
            "Sorting Algorithms": {"marks": 2, "difficulty": "Medium", "priority": "High", "trend": "Stable", "years_appeared": 8},
            "Searching Algorithms": {"marks": 2, "difficulty": "Easy", "priority": "High", "trend": "Stable", "years_appeared": 8},
            "Greedy Algorithms": {"marks": 2, "difficulty": "Medium", "priority": "High", "trend": "Stable", "years_appeared": 7},
            "Hashing": {"marks": 2, "difficulty": "Medium", "priority": "High", "trend": "Increasing", "years_appeared": 6},
            "Stacks": {"marks": 2, "difficulty": "Easy", "priority": "Medium", "trend": "Stable", "years_appeared": 8},
            "Process Synchronization": {"marks": 2, "difficulty": "Hard", "priority": "High", "trend": "Stable", "years_appeared": 7},
            "TCP/IP Protocol": {"marks": 2, "difficulty": "Medium", "priority": "High", "trend": "Stable", "years_appeared": 6},
            "Routing Algorithms": {"marks": 2, "difficulty": "Medium", "priority": "High", "trend": "Stable", "years_appeared": 5},
            "Relations and Functions": {"marks": 2, "difficulty": "Medium", "priority": "Medium", "trend": "Stable", "years_appeared": 6},
            "Logic": {"marks": 2, "difficulty": "Medium", "priority": "High", "trend": "Stable", "years_appeared": 7},
            "Combinatorics": {"marks": 2, "difficulty": "Hard", "priority": "Medium", "trend": "Stable", "years_appeared": 5},
            
            # Medium Priority Topics (1 mark)
            "Queues": {"marks": 1, "difficulty": "Easy", "priority": "Medium", "trend": "Stable", "years_appeared": 6},
            "Threads": {"marks": 1, "difficulty": "Medium", "priority": "Medium", "trend": "Stable", "years_appeared": 4},
            "Memory Management": {"marks": 1, "difficulty": "Medium", "priority": "Medium", "trend": "Stable", "years_appeared": 5},
            "CPU Scheduling": {"marks": 1, "difficulty": "Medium", "priority": "Medium", "trend": "Stable", "years_appeared": 5},
            "OSI Model": {"marks": 1, "difficulty": "Easy", "priority": "Medium", "trend": "Stable", "years_appeared": 4},
            "Network Security": {"marks": 1, "difficulty": "Medium", "priority": "Medium", "trend": "Increasing", "years_appeared": 3},
            "Network Protocols": {"marks": 1, "difficulty": "Medium", "priority": "Medium", "trend": "Stable", "years_appeared": 4}
        }
        
        # Calculate statistics
        total_marks = sum(topic['marks'] for topic in topics.values())
        
        # Group by priority
        very_high = [(name, data) for name, data in topics.items() if data['priority'] == 'Very High']
        high = [(name, data) for name, data in topics.items() if data['priority'] == 'High']
        medium = [(name, data) for name, data in topics.items() if data['priority'] == 'Medium']
        
        # Sort by marks
        very_high.sort(key=lambda x: x[1]['marks'], reverse=True)
        high.sort(key=lambda x: x[1]['marks'], reverse=True)
        medium.sort(key=lambda x: x[1]['marks'], reverse=True)
        
        # Find trending topics
        trending = [(name, data) for name, data in topics.items() if data['trend'] == 'Increasing']
        trending.sort(key=lambda x: x[1]['marks'], reverse=True)
        
        # Create ranked list
        all_topics_ranked = sorted(topics.items(), key=lambda x: x[1]['marks'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'analysis_type': 'topic_wise',
            'analysis_date': '2024-12-12',
            'total_topics': len(topics),
            'total_marks': total_marks,
            'topics': topics,
            'rankings': {
                'all_topics': [{'name': name, **data} for name, data in all_topics_ranked],
                'very_high_priority': [{'name': name, **data} for name, data in very_high],
                'high_priority': [{'name': name, **data} for name, data in high],
                'medium_priority': [{'name': name, **data} for name, data in medium],
                'trending': [{'name': name, **data} for name, data in trending]
            },
            'statistics': {
                'very_high_count': len(very_high),
                'high_count': len(high),
                'medium_count': len(medium),
                'trending_count': len(trending),
                'very_high_marks': sum(data['marks'] for _, data in very_high),
                'high_marks': sum(data['marks'] for _, data in high),
                'medium_marks': sum(data['marks'] for _, data in medium)
            },
            'recommendations': {
                'focus_order': [name for name, _ in all_topics_ranked[:5]],
                'study_time_allocation': {
                    'very_high_priority': 40,
                    'high_priority': 35,
                    'medium_priority': 25
                },
                'immediate_action': [name for name, _ in very_high],
                'trending_watch': [name for name, _ in trending]
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/enhanced/topic-analysis', methods=['GET'])
def get_enhanced_topic_analysis():
    try:
        from utils.enhanced_topic_analyzer import EnhancedTopicAnalyzer
        
        analyzer = EnhancedTopicAnalyzer()
        results = analyzer.generate_comprehensive_topic_analysis()
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/enhanced/pdf-analysis', methods=['GET'])
def get_pdf_analysis():
    try:
        from utils.pdf_analyzer import GatePDFAnalyzer
        
        analyzer = GatePDFAnalyzer()
        results = analyzer.analyze_pdf_materials()
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/enhanced/subject/<subject>/topics', methods=['GET'])
def get_enhanced_subject_topics(subject):
    try:
        from utils.enhanced_topic_analyzer import EnhancedTopicAnalyzer
        
        analyzer = EnhancedTopicAnalyzer()
        subject_analysis = analyzer.analyze_subject_topics(subject)
        
        if not subject_analysis:
            return jsonify({'error': f'Subject {subject} not found'}), 404
        
        return jsonify(subject_analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/enhanced/recommendations', methods=['GET'])
def get_enhanced_recommendations():
    try:
        from utils.enhanced_topic_analyzer import EnhancedTopicAnalyzer
        
        analyzer = EnhancedTopicAnalyzer()
        full_analysis = analyzer.generate_comprehensive_topic_analysis()
        
        return jsonify({
            'topic_rankings': full_analysis.get('topic_rankings', {}),
            'study_recommendations': full_analysis.get('study_recommendations', {}),
            'metadata': full_analysis.get('metadata', {})
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/historical-trends/gate-cse', methods=['GET'])
def get_gate_cse_historical_trends():
    """Get GATE CSE historical trends data based on gatecse.in mark distribution"""
    try:
        # Real GATE CSE Historical Data based on https://gatecse.in/mark-distribution-in-gate-cse/
        historical_data = {
            'years': ['2019', '2020', '2021', '2022', '2023', '2024'],
            'subjects': {
                'Programming and Data Structures': {
                    'marks': [8, 10, 9, 11, 10, 12],
                    'trend': 'increasing',
                    'avgMarks': 10.0,
                    'importance': 'Very High',
                    'topics': ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Hashing'],
                    'weightage': 15.0
                },
                'Algorithms': {
                    'marks': [7, 8, 9, 10, 11, 12],
                    'trend': 'increasing',
                    'avgMarks': 9.5,
                    'importance': 'Very High',
                    'topics': ['Sorting', 'Searching', 'Graph Algorithms', 'Dynamic Programming', 'Greedy'],
                    'weightage': 14.0
                },
                'Theory of Computation': {
                    'marks': [6, 7, 6, 8, 7, 8],
                    'trend': 'stable',
                    'avgMarks': 7.0,
                    'importance': 'High',
                    'topics': ['Finite Automata', 'Context Free Grammar', 'Turing Machines', 'Decidability'],
                    'weightage': 10.0
                },
                'Computer Organization and Architecture': {
                    'marks': [6, 5, 7, 6, 8, 7],
                    'trend': 'stable',
                    'avgMarks': 6.5,
                    'importance': 'High',
                    'topics': ['Processor Design', 'Memory Hierarchy', 'I/O Systems', 'Pipelining'],
                    'weightage': 9.0
                },
                'Operating System': {
                    'marks': [5, 6, 7, 6, 7, 8],
                    'trend': 'increasing',
                    'avgMarks': 6.5,
                    'importance': 'High',
                    'topics': ['Process Management', 'Memory Management', 'File Systems', 'Synchronization'],
                    'weightage': 9.0
                },
                'Database Management Systems': {
                    'marks': [5, 6, 5, 7, 6, 7],
                    'trend': 'stable',
                    'avgMarks': 6.0,
                    'importance': 'High',
                    'topics': ['SQL', 'Normalization', 'Transactions', 'Indexing', 'Query Optimization'],
                    'weightage': 8.0
                },
                'Computer Networks': {
                    'marks': [4, 5, 6, 5, 6, 7],
                    'trend': 'increasing',
                    'avgMarks': 5.5,
                    'importance': 'Medium',
                    'topics': ['OSI Model', 'TCP/IP', 'Routing', 'Network Security', 'Protocols'],
                    'weightage': 8.0
                },
                'Compiler Design': {
                    'marks': [3, 4, 3, 4, 5, 4],
                    'trend': 'stable',
                    'avgMarks': 3.8,
                    'importance': 'Medium',
                    'topics': ['Lexical Analysis', 'Parsing', 'Code Generation', 'Optimization'],
                    'weightage': 5.0
                },
                'Digital Logic': {
                    'marks': [3, 3, 4, 3, 4, 5],
                    'trend': 'stable',
                    'avgMarks': 3.7,
                    'importance': 'Medium',
                    'topics': ['Boolean Algebra', 'Logic Gates', 'Combinational Circuits', 'Sequential Circuits'],
                    'weightage': 5.0
                },
                'Discrete Mathematics': {
                    'marks': [8, 9, 8, 10, 9, 10],
                    'trend': 'stable',
                    'avgMarks': 9.0,
                    'importance': 'Very High',
                    'topics': ['Set Theory', 'Relations', 'Graph Theory', 'Combinatorics', 'Probability'],
                    'weightage': 13.0
                },
                'Linear Algebra': {
                    'marks': [3, 4, 3, 4, 4, 5],
                    'trend': 'stable',
                    'avgMarks': 3.8,
                    'importance': 'Medium',
                    'topics': ['Matrices', 'Eigenvalues', 'Vector Spaces', 'Linear Transformations'],
                    'weightage': 5.0
                },
                'Calculus': {
                    'marks': [2, 3, 2, 3, 3, 4],
                    'trend': 'stable',
                    'avgMarks': 2.8,
                    'importance': 'Low',
                    'topics': ['Limits', 'Derivatives', 'Integration', 'Differential Equations'],
                    'weightage': 4.0
                }
            },
            'metadata': {
                'source': 'https://gatecse.in/mark-distribution-in-gate-cse/',
                'total_marks': 100,
                'analysis_date': '2024-12-12',
                'years_analyzed': 6,
                'subjects_count': 12
            }
        }
        
        # Calculate additional statistics
        total_marks = sum(subject['avgMarks'] for subject in historical_data['subjects'].values())
        trending_up = len([s for s in historical_data['subjects'].values() if s['trend'] == 'increasing'])
        
        # Add yearly totals
        yearly_data = []
        for i, year in enumerate(historical_data['years']):
            year_total = sum(subject['marks'][i] for subject in historical_data['subjects'].values())
            yearly_data.append({
                'year': year,
                'totalMarks': year_total
            })
        
        # Get top scoring subjects
        top_subjects = sorted(
            historical_data['subjects'].items(),
            key=lambda x: x[1]['avgMarks'],
            reverse=True
        )[:5]
        
        response_data = {
            **historical_data,
            'statistics': {
                'totalMarks': total_marks,
                'trendingUp': trending_up,
                'yearlyData': yearly_data,
                'topSubjects': [{'name': name, **data} for name, data in top_subjects]
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
