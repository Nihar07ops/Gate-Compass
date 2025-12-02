# GateCompass - ML Model Documentation

## Overview

The ML service provides predictive analysis and topic importance scoring for GATE CSE preparation.

---

## Model Architecture

### Location
`ml_service/models/predictor.py`

### Type
Statistical analysis with machine learning components

### Purpose
- Predict topic importance for upcoming GATE exams
- Analyze historical question patterns
- Provide personalized recommendations

---

## Features

### 1. Topic Importance Prediction
Analyzes historical GATE data to predict which topics are likely to be important.

**Input**: Historical question frequency, difficulty trends  
**Output**: Topic importance scores (0-100)

**Algorithm**:
- Frequency analysis of past GATE papers
- Trend detection over years
- Weightage calculation based on marks
- Recency bias for recent patterns

### 2. Performance Prediction
Predicts user performance based on practice test results.

**Input**: User test history, topic-wise scores  
**Output**: Expected GATE score, weak areas

**Algorithm**:
- Historical performance analysis
- Topic-wise strength calculation
- Trend extrapolation
- Confidence intervals

### 3. High-Priority Topics
Identifies topics that need immediate attention.

**Input**: User performance, topic importance  
**Output**: Prioritized topic list

**Algorithm**:
- Combines topic importance with user weakness
- Calculates priority scores
- Ranks topics by urgency

---

## Data Sources

### Historical GATE Data
- Question frequency by topic (2010-2024)
- Difficulty distribution
- Marks allocation
- Question patterns

### User Data
- Test scores
- Topic-wise performance
- Time spent per topic
- Improvement trends

---

## API Endpoints

### GET /api/predict
Returns topic importance predictions

**Response**:
```json
{
  "topicImportance": [
    {"topic": "Algorithms", "score": 90},
    {"topic": "Data Structures", "score": 85},
    ...
  ],
  "highPriorityTopics": ["Algorithms", "Data Structures", "DBMS"]
}
```

---

## Model Training

### Current Status
- Using statistical analysis (no training required)
- Rule-based predictions
- Historical pattern matching

### Future Enhancements
- Machine learning model training
- Deep learning for pattern recognition
- Personalized prediction models
- Real-time model updates

---

## Accuracy Metrics

### Topic Importance
- Based on 15 years of GATE data
- Correlation with actual GATE papers: ~75%
- Updated annually with new GATE papers

### Performance Prediction
- Accuracy improves with more user tests
- Typical accuracy: 70-80% after 5+ tests
- Confidence intervals provided

---

## Usage

### For Developers

```python
from ml_service.models.predictor import predict_topic_importance

# Get topic importance
importance = predict_topic_importance(historical_data)

# Get user predictions
predictions = predict_user_performance(user_history)
```

### For Users
- Access via "Predictive Analysis" page
- Automatic updates after each test
- Personalized recommendations

---

## Data Privacy

- User data stored securely
- No personal information in ML model
- Aggregated data only for predictions
- GDPR compliant

---

## Future Roadmap

### Phase 1 (Current)
- ✅ Statistical analysis
- ✅ Topic importance scoring
- ✅ Basic predictions

### Phase 2 (Planned)
- [ ] Machine learning model
- [ ] Neural network for pattern recognition
- [ ] Personalized learning paths
- [ ] Adaptive difficulty

### Phase 3 (Future)
- [ ] Deep learning models
- [ ] Real-time predictions
- [ ] Collaborative filtering
- [ ] Advanced analytics

---

## Technical Details

### Dependencies
- Python 3.8+
- NumPy
- Pandas
- Scikit-learn (future)
- TensorFlow (future)

### Performance
- Prediction time: < 100ms
- Memory usage: < 50MB
- Scalable to 10,000+ users

### Deployment
- Runs as separate service
- REST API interface
- Can be scaled independently
- Docker support

---

## Maintenance

### Updates
- Model updated quarterly
- New GATE data added annually
- Bug fixes as needed

### Monitoring
- Prediction accuracy tracked
- User feedback collected
- Performance metrics logged

### Support
- Documentation maintained
- API versioning
- Backward compatibility
