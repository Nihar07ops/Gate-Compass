# Implementation Plan

- [x] 1. Set up project structure and development environment




  - Initialize monorepo with frontend (React + TypeScript) and backend (Node.js + Express + TypeScript)
  - Configure TypeScript, ESLint, and Prettier for both projects
  - Set up Docker Compose with PostgreSQL and Redis containers
  - Create environment configuration files for development and production
  - Initialize Git repository with appropriate .gitignore files
  - _Requirements: All_

- [x] 2. Implement database schema and models





  - Create PostgreSQL database schema with tables for users, questions, concepts, tests, test_sessions, session_answers, question_times, and test_results
  - Write database migration scripts using a migration tool (e.g., node-pg-migrate)
  - Implement TypeScript interfaces and types for all data models
  - Create database connection utility with connection pooling
  - _Requirements: 1.3, 2.1, 3.1, 4.1, 5.1, 7.1, 8.1_

- [x] 2.1 Write property test for database models






  - **Property 34: Referential integrity preservation**
  - **Validates: Requirements 8.3**

- [x] 3. Implement Google OAuth authentication




  - Set up Passport.js with Google OAuth 2.0 strategy
  - Create authentication routes (/api/auth/google, /api/auth/callback, /api/auth/logout)
  - Implement JWT token generation and validation utilities
  - Create authentication middleware for protected routes
  - Implement token refresh mechanism
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.1 Write property test for OAuth redirect






  - **Property 1: OAuth redirect correctness**
  - **Validates: Requirements 1.2**

- [x] 3.2 Write property test for user profile handling








  - **Property 2: User profile creation or retrieval**
  - **Validates: Requirements 1.3**

- [x] 3.3 Write property test for authentication errors






  - **Property 3: Authentication error handling**
  - **Validates: Requirements 1.4**

- [x] 3.4 Write property test for session persistence








  - **Property 4: Session persistence**
  - **Validates: Requirements 1.5**

- [x] 4. Build frontend authentication module





  - Create LoginPage component with Google login button
  - Implement AuthContext for managing authentication state
  - Create ProtectedRoute component for route protection
  - Implement token storage and retrieval in httpOnly cookies
  - Add automatic token refresh logic
  - Handle authentication errors with user-friendly messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4.1 Write unit tests for authentication components






  - Test LoginPage renders Google login button
  - Test AuthContext state management
  - Test ProtectedRoute redirects unauthenticated users
  - _Requirements: 1.1, 1.5_

- [x] 5. Implement question and concept management (admin)




  - Create API endpoints for adding, updating, and retrieving questions
  - Implement question validation logic (required fields: concept, difficulty, source)
  - Create API endpoint for bulk question import
  - Implement concept CRUD operations
  - Create admin middleware for role-based access control
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5.1 Write property test for question validation






  - **Property 32: Question validation**
  - **Validates: Requirements 8.1**

- [x] 5.2 Write property test for import parsing






  - **Property 33: Import parsing correctness**
  - **Validates: Requirements 8.2**

- [x] 5.3 Write property test for bulk operations






  - **Property 35: Bulk operation feedback**
  - **Validates: Requirements 8.5**

- [x] 6. Build admin frontend interface




  - Create QuestionManager component for adding/editing questions
  - Create DataImporter component for bulk question import
  - Create ConceptMapper component for managing concept mappings
  - Implement form validation and error display
  - Add progress indicators for bulk operations
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 7. Implement trend analysis service





  - Create TrendAnalysisService with methods for analyzing question trends
  - Implement frequency calculation logic for concepts
  - Implement concept ranking algorithm based on importance
  - Create caching layer using Redis for trend data
  - Implement scheduled job (cron) for daily trend recalculation
  - Create API endpoint for retrieving trend data
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7.1 Write property test for question categorization













  - **Property 5: Question categorization completeness**
  - **Validates: Requirements 2.1**

- [x] 7.2 Write property test for frequency calculation






  - **Property 6: Frequency calculation correctness**
  - **Validates: Requirements 2.2**

- [x] 7.3 Write property test for ranking monotonicity









  - **Property 7: Ranking monotonicity**
  - **Validates: Requirements 2.3**

- [x] 7.4 Write property test for trend display





  - **Property 8: Trend display completeness**
  - **Validates: Requirements 2.4**

- [x] 7.5 Write property test for trend freshness






  - **Property 9: Trend freshness**
  - **Validates: Requirements 2.5, 8.4**

- [x] 8. Build trend visualization frontend





  - Create TrendVisualization component with Chart.js integration
  - Display concept rankings with bar charts and trend lines
  - Show yearly distribution of concepts
  - Implement filtering and sorting options
  - Add loading states and error handling
  - _Requirements: 2.4_

- [x] 9. Implement test generation service




  - Create TestGenerationService with mock test generation logic
  - Implement question selection algorithm based on trend analysis
  - Implement difficulty distribution balancing logic
  - Ensure all selected questions have valid textbook sources
  - Generate unique test session IDs
  - Create API endpoint for test generation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9.1 Write property test for test generation





  - **Property 10: Test generation from question bank**
  - **Validates: Requirements 3.1**

- [x] 9.2 Write property test for concept prioritization






  - **Property 11: High-importance concept prioritization**
  - **Validates: Requirements 3.2**

- [x] 9.3 Write property test for textbook source validity





  - **Property 12: Textbook source validity**
  - **Validates: Requirements 3.3**

- [x] 9.4 Write property test for difficulty distribution






  - **Property 13: Difficulty distribution conformance**
  - **Validates: Requirements 3.4**

- [x] 9.5 Write property test for session ID uniqueness





  - **Property 14: Test session ID uniqueness**
  - **Validates: Requirements 3.5**

- [x] 10. Implement test session management service





  - Create TestSessionService for managing active test sessions
  - Implement methods for starting tests, saving answers, and tracking time
  - Implement auto-save functionality (every 30 seconds)
  - Implement auto-submission logic when timer expires
  - Store session state in Redis for fast access
  - Create API endpoints for test session operations
  - _Requirements: 4.1, 4.3, 4.5, 5.1, 5.2, 5.3, 5.4, 6.2, 6.3, 6.5_

- [x] 10.1 Write property test for timer initialization





  - **Property 15: Timer initialization**
  - **Validates: Requirements 4.1**

- [x] 10.2 Write property test for auto-submission






  - **Property 17: Auto-submission on timeout**
  - **Validates: Requirements 4.3**

- [x] 10.3 Write property test for manual submission





  - **Property 19: Manual submission timer handling**
  - **Validates: Requirements 4.5**

- [x] 10.4 Write property test for cumulative time tracking






  - **Property 20: Cumulative question time tracking**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 10.5 Write property test for time persistence





  - **Property 21: Question time persistence**
  - **Validates: Requirements 5.4**

- [x] 10.6 Write property test for navigation state preservation











  - **Property 23: Navigation state preservation**
  - **Validates: Requirements 6.2, 6.5**

- [x] 10.7 Write property test for review flag persistence





  - **Property 24: Review flag persistence**
  - **Validates: Requirements 6.3**

- [x] 11. Build test-taking interface frontend





  - Create TestInterface component for displaying questions
  - Implement Timer component with countdown display and visual indicators
  - Create QuestionPalette component showing all questions with status indicators
  - Implement QuestionTracker for tracking time spent per question
  - Add navigation controls (next, previous, jump to question)
  - Implement answer selection and saving logic
  - Add "mark for review" functionality
  - Implement auto-save every 30 seconds
  - Handle manual submission with confirmation dialog
  - Implement auto-submission when timer reaches zero
  - Store session state in localStorage for crash recovery
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11.1 Write property test for timer display accuracy







  - **Property 16: Timer display accuracy**
  - **Validates: Requirements 4.2**

- [x] 11.2 Write property test for timer continuity




  - **Property 18: Timer continuity during navigation**
  - **Validates: Requirements 4.4**

- [x] 11.3 Write property test for palette status accuracy





  - **Property 25: Question palette status accuracy**
  - **Validates: Requirements 6.4**

- [x] 11.4 Write unit tests for test interface components





  - Test Timer component countdown logic
  - Test QuestionPalette status display
  - Test navigation between questions
  - Test auto-save functionality
  - _Requirements: 4.2, 4.4, 6.4_

- [x] 12. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement results and analytics service





  - Create ResultsService for calculating scores and generating analytics
  - Implement score calculation logic (count correct answers)
  - Implement concept-wise performance analysis
  - Implement weak concept identification (below 60% accuracy)
  - Implement feedback generation with personalized suggestions
  - Implement textbook recommendation logic for weak concepts
  - Create API endpoints for retrieving results and analytics
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 13.1 Write property test for score calculation





  - **Property 26: Score calculation correctness**
  - **Validates: Requirements 7.1**

- [x] 13.2 Write property test for results completeness






  - **Property 27: Results completeness**
  - **Validates: Requirements 7.2**

- [x] 13.3 Write property test for concept accuracy calculation





  - **Property 28: Concept-wise accuracy calculation**
  - **Validates: Requirements 7.3**

- [x] 13.4 Write property test for weak concept identification





  - **Property 29: Weak concept identification**
  - **Validates: Requirements 7.4**

- [x] 13.5 Write property test for recommendation generation





  - **Property 30: Recommendation generation for weak concepts**
  - **Validates: Requirements 7.5**

- [x] 13.6 Write property test for historical performance




  - **Property 31: Historical performance aggregation**
  - **Validates: Requirements 7.6**

- [x] 13.7 Write property test for time display in results





  - **Property 22: Time display in results**
  - **Validates: Requirements 5.5**

- [x] 14. Build results and analytics frontend



  - Create ResultsPage component displaying score, percentage, and marks breakdown
  - Create ConceptAnalysis component with performance charts
  - Create FeedbackPanel component showing strengths, weaknesses, and recommendations
  - Create SolutionViewer component displaying correct answers with explanations
  - Display time spent on each question
  - Implement historical performance view with trend charts
  - Add export functionality for results (PDF/CSV)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 5.5_

- [x] 14.1 Write unit tests for results components





  - Test ResultsPage displays score correctly
  - Test ConceptAnalysis calculates and displays concept performance
  - Test FeedbackPanel shows recommendations for weak concepts
  - _Requirements: 7.1, 7.3, 7.4_

- [x] 15. Build dashboard and navigation





  - Create DashboardPage component as main landing page
  - Display user statistics (tests taken, average score, improvement trends)
  - Create TestHistory component showing previous test attempts
  - Implement quick actions (start new test, view trends, view history)
  - Create navigation bar with links to all major sections
  - Implement responsive design for mobile and tablet devices
  - _Requirements: 7.6_

- [x] 16. Implement error handling and recovery





  - Add error boundaries in React components
  - Implement network error handling with retry logic
  - Add session recovery logic for browser crashes
  - Implement validation error display for forms
  - Add loading states and skeleton screens
  - Implement toast notifications for success/error messages
  - _Requirements: 1.4, 8.1, 8.5_

- [x] 17. Implement security measures





  - Add input sanitization for all user inputs
  - Implement rate limiting on API endpoints
  - Add CSRF protection for state-changing operations
  - Configure secure, httpOnly, and sameSite cookies
  - Implement session timeout (24 hours)
  - Add SQL injection prevention in database queries
  - _Requirements: 1.3, 1.5, 8.1_

- [x] 18. Optimize performance




  - Implement Redis caching for trend data (24-hour TTL)
  - Add database indexes on frequently queried fields
  - Implement pagination for large result sets
  - Add code splitting and lazy loading in React
  - Implement React.memo and useMemo for expensive computations
  - Add debouncing for auto-save operations
  - _Requirements: 2.4, 2.5, 3.1, 7.6_

- [x] 19. Set up deployment configuration





  - Create production environment configuration
  - Set up Docker containers for production deployment
  - Configure CI/CD pipeline with GitHub Actions
  - Set up database backup and restore procedures
  - Configure monitoring and logging (e.g., CloudWatch, Sentry)
  - Create deployment documentation
  - _Requirements: All_

- [x] 20. Final checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.
