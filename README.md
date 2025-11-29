# GATE CSE Preparation Platform

A comprehensive MERN stack application with ML-powered predictions for GATE Computer Science exam preparation.

## Features

- **Historical Trend Analysis**: Interactive visualizations of past GATE paper patterns
- **Predictive Topic Importance**: ML-based forecasting of important topics
- **Balanced Mock Tests**: Auto-generated tests with calibrated difficulty
- **Performance Analytics**: Detailed feedback with radar charts and heatmaps
- **Continuous Learning**: Automated updates and retraining
- **PWA Support**: Offline mock tests capability
- **Dark Mode**: Eye-friendly interface

## Tech Stack

### Frontend
- React.js with Vite
- Material-UI & Tailwind CSS
- Chart.js & Recharts for visualizations
- Framer Motion for animations
- React Router for navigation

### Backend
- Node.js & Express.js
- MongoDB Atlas
- JWT Authentication
- Node-cron for scheduled tasks
- AWS S3 integration

### ML Service
- Python Flask/FastAPI
- scikit-learn & TensorFlow
- spaCy/NLTK for NLP
- Pandas for data analysis

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB Atlas account
- AWS account (for S3)

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up Python ML service:
```bash
cd ml_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in both `server` and `client` folders
   - Add your MongoDB URI, JWT secret, AWS credentials, etc.

4. Start development servers:
```bash
# Terminal 1: Start ML service
cd ml_service
python app.py

# Terminal 2: Start backend and frontend
npm run dev
```

### Deployment

**Frontend (Vercel):**
```bash
cd client
vercel deploy
```

**Backend (AWS EC2 or Railway):**
```bash
cd server
# Follow platform-specific deployment instructions
```

**ML Service (AWS Lambda or EC2):**
```bash
cd ml_service
# Package and deploy using Serverless framework or Docker
```

## Project Structure

```
gate-cse-prep-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── models/           # MongoDB models
│   ├── middleware/       # Auth & validation
│   └── utils/            # Helper functions
├── ml_service/           # Python ML microservice
│   ├── models/           # ML models
│   ├── data/             # Training data
│   └── utils/            # NLP & analysis tools
└── docs/                 # Documentation
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/trends` - Historical trend data
- `GET /api/predict` - Topic predictions
- `POST /api/generate-test` - Generate mock test
- `GET /api/analytics/:userId` - User performance analytics
- `POST /api/submit-test` - Submit test answers

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

MIT
