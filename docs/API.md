# API Documentation

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- Body: `{ name, email, password }`
- Returns: `{ token, user }`

### Login User
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: `{ token, user }`

### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns: User object

## Trends Endpoints

### Get Historical Trends
- **GET** `/api/trends`
- Headers: `Authorization: Bearer <token>`
- Returns: Topic frequency, difficulty trends, yearly data

## Prediction Endpoints

### Get Topic Predictions
- **GET** `/api/predict`
- Headers: `Authorization: Bearer <token>`
- Returns: Predicted important topics with scores

## Test Endpoints

### Generate Mock Test
- **POST** `/api/generate-test`
- Headers: `Authorization: Bearer <token>`
- Body: `{ difficulty, topicCount }`
- Returns: Test object with questions

### Submit Test
- **POST** `/api/submit-test`
- Headers: `Authorization: Bearer <token>`
- Body: `{ testId, answers }`
- Returns: Score and results

## Analytics Endpoints

### Get User Analytics
- **GET** `/api/analytics`
- Headers: `Authorization: Bearer <token>`
- Returns: Performance metrics, topic-wise scores

## Dashboard Endpoints

### Get Dashboard Data
- **GET** `/api/dashboard`
- Headers: `Authorization: Bearer <token>`
- Returns: User stats, streak, strong/weak topics
