# Test Session Service

## Overview

The `TestSessionService` manages active test sessions for users taking mock tests. It handles:
- Starting test sessions
- Saving answers with review flags
- Tracking time spent per question (cumulative)
- Manual test submission
- Auto-submission when timer expires
- Session state caching in Redis for performance

## Key Features

### Session Management
- **Start Test**: Initializes a test session with a 3-hour timer
- **Session State**: Stores session data in Redis for fast access with database fallback
- **Session Recovery**: Can recover session state from database if Redis is unavailable

### Answer Management
- **Save Answers**: Stores user's selected answers for questions
- **Mark for Review**: Allows users to flag questions for later review
- **State Preservation**: Answers persist across navigation (Requirements 6.2, 6.5)

### Time Tracking
- **Cumulative Tracking**: Tracks total time spent on each question across multiple views (Requirements 5.1, 5.2, 5.3)
- **Per-Question Time**: Records time spent on individual questions
- **Persistence**: Time data is stored in database for results analysis (Requirement 5.4)

### Submission
- **Manual Submission**: Users can submit before timer expires (Requirement 4.5)
- **Auto-Submission**: Automatically submits when 3-hour timer expires (Requirement 4.3)
- **Time Recording**: Records actual time spent on submission

## API Endpoints

### Start Test Session
```
POST /api/tests/:testId/start
```
Creates and starts a new test session for the authenticated user.

### Save Answer
```
PUT /api/tests/sessions/:sessionId/answer
Body: {
  questionId: string,
  selectedAnswer: string,
  markedForReview: boolean
}
```
Saves or updates an answer for a question in the session.

### Track Time
```
PUT /api/tests/sessions/:sessionId/time
Body: {
  questionId: string,
  timeSpent: number (seconds)
}
```
Records time spent on a question (cumulative).

### Submit Test
```
POST /api/tests/sessions/:sessionId/submit
```
Manually submits the test and calculates total time spent.

### Auto-Submit Test
```
POST /api/tests/sessions/:sessionId/auto-submit
```
Auto-submits the test when timer expires (called by frontend timer).

### Get Session State
```
GET /api/tests/sessions/:sessionId/state
```
Retrieves current session state (for recovery/debugging).

## Redis Caching

Session state is cached in Redis with:
- **Key Format**: `test_session:{sessionId}`
- **TTL**: 4 hours (longer than test duration for safety)
- **Fallback**: Automatically falls back to database if Redis is unavailable

## Requirements Coverage

This service implements the following requirements:
- **4.1**: Timer initialization (3 hours)
- **4.3**: Auto-submission on timeout
- **4.5**: Manual submission with time recording
- **5.1, 5.2, 5.3**: Cumulative question time tracking
- **5.4**: Time data persistence
- **6.2, 6.5**: Answer state preservation during navigation
- **6.3**: Review flag persistence

## Testing

Unit tests are provided in `testSessionService.test.ts` covering:
- Session start and initialization
- Answer saving and updating
- Time tracking (new and cumulative)
- Manual and auto-submission
- Error handling for invalid states
