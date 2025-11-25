# Requirements Document

## Introduction

GATE COMPASS is a web-based platform designed to help GATE Computer Science and Information Technology (CSIT) aspirants prepare effectively for their examinations. The platform provides intelligent mock test generation based on trend analysis of previous years' questions, comprehensive test-taking capabilities with time tracking, and secure user authentication through Google login.

## Glossary

- **GATE COMPASS**: The web-based platform system for GATE CSIT exam preparation
- **User**: A GATE CSIT aspirant who uses the platform for exam preparation
- **Mock Test**: A practice examination generated from standard textbooks based on concept trends
- **Concept**: A specific topic or subject matter area within GATE CSIT syllabus
- **Trend Analysis**: Statistical analysis of concept frequency and importance based on previous years' GATE questions
- **Question Bank**: Collection of questions sourced from standard textbooks
- **Test Session**: An active instance of a user taking a mock test with timing constraints
- **Authentication Service**: Google OAuth-based login system
- **Timer**: A countdown mechanism that tracks total test duration and per-question time spent

## Requirements

### Requirement 1

**User Story:** As a GATE CSIT aspirant, I want to log in using my Google account, so that I can securely access the platform without creating separate credentials.

#### Acceptance Criteria

1. WHEN a user visits the login page, THEN GATE COMPASS SHALL display a Google login button
2. WHEN a user clicks the Google login button, THEN GATE COMPASS SHALL redirect the user to Google's OAuth authentication page
3. WHEN Google authentication succeeds, THEN GATE COMPASS SHALL create or retrieve the user profile and grant access to the platform
4. WHEN Google authentication fails, THEN GATE COMPASS SHALL display an error message and allow the user to retry authentication
5. WHEN an authenticated user returns to the platform, THEN GATE COMPASS SHALL maintain the user session without requiring re-authentication

### Requirement 2

**User Story:** As a GATE CSIT aspirant, I want the platform to analyze trends of important concepts from previous years' questions, so that I can focus my preparation on high-priority topics.

#### Acceptance Criteria

1. WHEN the system processes previous years' GATE questions, THEN GATE COMPASS SHALL identify and categorize each question by concept
2. WHEN trend analysis is performed, THEN GATE COMPASS SHALL calculate frequency metrics for each concept across multiple years
3. WHEN trend analysis is complete, THEN GATE COMPASS SHALL rank concepts by importance based on their historical occurrence patterns
4. WHEN a user requests trend information, THEN GATE COMPASS SHALL display concept rankings with visual representations of trend data
5. WHEN new previous years' questions are added, THEN GATE COMPASS SHALL update trend analysis to reflect the latest data

### Requirement 3

**User Story:** As a GATE CSIT aspirant, I want the platform to generate mock tests from standard textbooks based on concept trends, so that I can practice with relevant and high-quality questions.

#### Acceptance Criteria

1. WHEN a user requests a mock test, THEN GATE COMPASS SHALL generate questions from the question bank based on current trend analysis
2. WHEN generating a mock test, THEN GATE COMPASS SHALL prioritize questions covering high-importance concepts identified by trend analysis
3. WHEN a mock test is generated, THEN GATE COMPASS SHALL ensure questions are sourced from standard textbooks specified in the system
4. WHEN creating a mock test, THEN GATE COMPASS SHALL include a balanced distribution of difficulty levels and concept coverage
5. WHEN a mock test is created, THEN GATE COMPASS SHALL assign a unique identifier to the test session for tracking purposes

### Requirement 4

**User Story:** As a GATE CSIT aspirant, I want to take mock tests with a 3-hour timer, so that I can simulate real exam conditions and manage my time effectively.

#### Acceptance Criteria

1. WHEN a user starts a mock test, THEN GATE COMPASS SHALL initialize a countdown timer set to 3 hours
2. WHEN the test session is active, THEN GATE COMPASS SHALL display the remaining time prominently on the interface
3. WHEN the 3-hour timer expires, THEN GATE COMPASS SHALL automatically submit the test and prevent further answer modifications
4. WHEN a user navigates between questions during the test, THEN GATE COMPASS SHALL maintain the timer state without interruption
5. WHEN a user manually submits the test before time expires, THEN GATE COMPASS SHALL stop the timer and record the actual time taken

### Requirement 5

**User Story:** As a GATE CSIT aspirant, I want the platform to track time spent on each question, so that I can analyze my time management patterns and improve my efficiency.

#### Acceptance Criteria

1. WHEN a user views a question during a test session, THEN GATE COMPASS SHALL start tracking time spent on that specific question
2. WHEN a user navigates away from a question, THEN GATE COMPASS SHALL record the accumulated time spent on that question
3. WHEN a user returns to a previously viewed question, THEN GATE COMPASS SHALL resume time tracking for that question
4. WHEN a test session is completed, THEN GATE COMPASS SHALL store per-question time data for the entire test
5. WHEN a user reviews test results, THEN GATE COMPASS SHALL display time spent on each question alongside the answers

### Requirement 6

**User Story:** As a GATE CSIT aspirant, I want to navigate between questions during a mock test, so that I can answer questions in my preferred order and review my responses.

#### Acceptance Criteria

1. WHEN a test session is active, THEN GATE COMPASS SHALL provide navigation controls to move between questions
2. WHEN a user selects a specific question number, THEN GATE COMPASS SHALL display that question and preserve any previously entered answer
3. WHEN a user marks a question for review, THEN GATE COMPASS SHALL flag the question and allow the user to return to it later
4. WHEN displaying the question palette, THEN GATE COMPASS SHALL indicate the status of each question (answered, unanswered, marked for review)
5. WHEN a user navigates to a different question, THEN GATE COMPASS SHALL save the current question's answer state automatically

### Requirement 7

**User Story:** As a GATE CSIT aspirant, I want to view my test results with personalized feedback and suggestions, so that I can identify my strengths and weaknesses and know which concepts to strengthen.

#### Acceptance Criteria

1. WHEN a test session is submitted, THEN GATE COMPASS SHALL calculate the total score and display it prominently with percentage and marks breakdown
2. WHEN results are generated, THEN GATE COMPASS SHALL display correct answers alongside user responses for each question with explanations
3. WHEN showing test results, THEN GATE COMPASS SHALL provide concept-wise performance breakdown with accuracy percentages for each concept
4. WHEN displaying analytics, THEN GATE COMPASS SHALL identify weak concepts (below 60% accuracy) and generate personalized suggestions for improvement
5. WHEN providing feedback, THEN GATE COMPASS SHALL recommend specific textbook chapters or topics for concepts where the user needs strengthening
6. WHEN a user views historical performance, THEN GATE COMPASS SHALL display performance trends across multiple test attempts and highlight improvement areas

### Requirement 8

**User Story:** As a system administrator, I want to manage the question bank and previous years' data, so that the platform remains current and accurate.

#### Acceptance Criteria

1. WHEN an administrator adds questions to the question bank, THEN GATE COMPASS SHALL validate question format and required metadata (concept, difficulty, source)
2. WHEN previous years' questions are imported, THEN GATE COMPASS SHALL parse and categorize them for trend analysis
3. WHEN question data is updated, THEN GATE COMPASS SHALL maintain referential integrity with existing test sessions
4. WHEN an administrator modifies concept mappings, THEN GATE COMPASS SHALL update trend analysis accordingly
5. WHEN bulk operations are performed, THEN GATE COMPASS SHALL provide progress feedback and error reporting
