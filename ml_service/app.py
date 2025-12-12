from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models.predictor import TopicPredictor
from utils.analyzer import GATEAnalyzer
from utils.enhanced_analyzer import EnhancedGATEAnalyzer

load_dotenv()

app = Flask(__name__)
CORS(app)

predictor = TopicPredictor()
analyzer = GATEAnalyzer()
enhanced_analyzer = EnhancedGATEAnalyzer()

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

@app.route('/trends/yearwise', methods=['GET'])
def get_yearwise_trends():
    try:
        start_year = int(request.args.get('start_year', 2015))
        end_year = int(request.args.get('end_year', 2024))
        analysis = enhanced_analyzer.get_year_wise_analysis(start_year, end_year)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/trends/subject/<subject>', methods=['GET'])
def get_subject_trends(subject):
    try:
        start_year = int(request.args.get('start_year', 2015))
        end_year = int(request.args.get('end_year', 2024))
        analysis = enhanced_analyzer.get_year_wise_analysis(start_year, end_year)
        
        if subject in analysis['subjects']:
            return jsonify({
                'subject': subject,
                'data': analysis['subjects'][subject],
                'yearRange': analysis['yearRange']
            })
        else:
            return jsonify({'error': f'Subject {subject} not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predictions/topics', methods=['GET'])
def get_topic_predictions():
    try:
        subject = request.args.get('subject')
        year = request.args.get('year')
        if year:
            year = int(year)
        
        predictions = enhanced_analyzer.get_topic_wise_predictions(subject, year)
        return jsonify({
            'predictions': predictions,
            'filters': {
                'subject': subject,
                'year': year
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/trends/overview', methods=['GET'])
def get_trends_overview():
    try:
        start_year = int(request.args.get('start_year', 2015))
        end_year = int(request.args.get('end_year', 2024))
        analysis = enhanced_analyzer.get_year_wise_analysis(start_year, end_year)
        
        # Return just the overview data
        return jsonify({
            'overallTrends': analysis['overallTrends'],
            'yearlyStats': analysis['yearlyStats'],
            'yearRange': analysis['yearRange'],
            'subjects': list(analysis['subjects'].keys())
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
