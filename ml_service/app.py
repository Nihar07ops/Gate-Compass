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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
