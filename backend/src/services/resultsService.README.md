# Results Service

The Results Service is responsible for calculating test scores, generating analytics, and providing personalized feedback to users based on their test performance.

## Features

### 1. Score Calculation (Requirement 7.1)
- Calculates total score by counting correct answers
- Computes percentage and marks breakdown
- Tracks correct, incorrect, and unanswered questions

### 2. Detailed Analysis (Requirement 7.2)
- Displays correct answers alongside user responses
- Provides explanations for each question
- Shows time spent on each question (Requirement 5.5)

### 3. Concept-wise Performance (Requirement 7.3)
- Analyzes performance by concept
- Calculates accuracy percentage for each concept
- Computes average time per question for each concept

### 4. Weak Concept Identification (Requirement 7.4)
- Identifies concepts with accuracy below 60%
- Generates personalized suggestions for improvement
- Prioritizes weak areas for focused practice

### 5. Textbook Recommendations (Requirement 7.5)
- Recommends specific textbook chapters for weak concepts
- Provides practice topics and study suggestions
- Prioritizes recommendations (high/medium/low)

### 6. Historical Performance (Requirement 7.6)
- Retrieves all past test results for a user
- Enables performance trend analysis
- Highlights improvement areas over time

## API Usage

### Calculate Score
```typescript
const result = await resultsService.calculateScore(sessionId);
```

### Get Result by Session ID
```typescript
const result = await resultsService.getResultBySessionId(sessionId);
```

### Get Detailed Analysis
```typescript
const analysis = await resultsService.getDetailedAnalysis(sessionId);
```

### Get Historical Performance
```typescript
const history = await resultsService.getHistoricalPerformance(userId);
```

## Data Models

### TestResult
```typescript
{
  id: string;
  session_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  percentage: number;
  concept_performance: ConceptPerformance[];
  feedback: Feedback;
  created_at: Date;
}
```

### ConceptPerformance
```typescript
{
  concept_id: string;
  concept_name: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  average_time_per_question: number;
}
```

### Feedback
```typescript
{
  overall_message: string;
  strengths: string[];
  weaknesses: ConceptWeakness[];
  recommendations: Recommendation[];
}
```

### Recommendation
```typescript
{
  concept_name: string;
  textbook_chapters: string[];
  practice_topics: string[];
  priority: 'high' | 'medium' | 'low';
}
```

## Implementation Details

### Score Calculation Algorithm
1. Retrieve test session and verify it's completed
2. Get all questions from the test
3. Get user's answers and question times
4. Compare user answers with correct answers
5. Calculate scores and statistics
6. Analyze concept-wise performance
7. Generate personalized feedback
8. Save results to database

### Weak Concept Threshold
- Concepts with accuracy < 60% are considered weak
- Priority levels:
  - High: accuracy < 30%
  - Medium: accuracy < 50%
  - Low: accuracy < 60%

### Textbook Recommendations
The service includes a mapping of concepts to standard GATE textbooks:
- Data Structures: Cormen, Tanenbaum
- Algorithms: Cormen, Kleinberg
- Operating Systems: Silberschatz, Tanenbaum
- Database Management: Korth, Elmasri
- Computer Networks: Tanenbaum, Kurose
- Theory of Computation: Hopcroft, Sipser
- Compiler Design: Aho (Dragon Book)
- Digital Logic: Morris Mano

## Error Handling

The service handles the following error cases:
- Test session not found
- Test session still in progress
- Test not found
- Missing questions or answers
- Database connection errors

## Testing

Basic unit tests are provided in `resultsService.test.ts` to verify:
- Service initialization
- Method availability
- Basic functionality structure

For comprehensive testing, integration tests should be added to verify:
- Score calculation accuracy
- Concept performance analysis
- Feedback generation logic
- Historical performance retrieval
