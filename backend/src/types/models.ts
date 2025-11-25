// Data model interfaces and types for GATE COMPASS

export interface User {
    id: string;
    google_id: string;
    email: string;
    name: string;
    profile_picture: string;
    role: 'user' | 'admin';
    created_at: Date;
    last_login_at: Date;
}

export interface Concept {
    id: string;
    name: string;
    category: string;
    description: string;
    created_at: Date;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    content: string;
    options: QuestionOption[];
    correct_answer: string;
    explanation: string;
    concept_id: string;
    sub_concept?: string;
    difficulty: Difficulty;
    source: string;
    year_appeared?: number;
    created_at: Date;
    updated_at: Date;
}

export interface Test {
    id: string;
    question_ids: string[];
    total_questions: number;
    duration: number; // in seconds
    created_at: Date;
}

export type TestSessionStatus = 'in_progress' | 'completed' | 'auto_submitted';

export interface TestSession {
    id: string;
    user_id: string;
    test_id: string;
    start_time: Date;
    end_time?: Date;
    status: TestSessionStatus;
    total_time_spent: number;
    created_at: Date;
}

export interface SessionAnswer {
    id: string;
    session_id: string;
    question_id: string;
    selected_answer: string;
    marked_for_review: boolean;
    answered_at: Date;
}

export interface QuestionTime {
    id: string;
    session_id: string;
    question_id: string;
    time_spent: number; // in seconds
    created_at: Date;
    updated_at: Date;
}

export interface ConceptPerformance {
    concept_id: string;
    concept_name: string;
    total_questions: number;
    correct_answers: number;
    accuracy: number;
    average_time_per_question: number;
}

export interface ConceptWeakness {
    concept_name: string;
    accuracy: number;
    questions_attempted: number;
}

export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface Recommendation {
    concept_name: string;
    textbook_chapters: string[];
    practice_topics: string[];
    priority: RecommendationPriority;
}

export interface Feedback {
    overall_message: string;
    strengths: string[];
    weaknesses: ConceptWeakness[];
    recommendations: Recommendation[];
}

export interface TestResult {
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

export interface ConceptTrend {
    id: string;
    concept_id: string;
    frequency: number;
    importance: number;
    yearly_distribution: Record<number, number>;
    last_updated: Date;
}

// Database row types (snake_case from database)
export interface UserRow {
    id: string;
    google_id: string;
    email: string;
    name: string;
    profile_picture: string;
    role: 'user' | 'admin';
    created_at: Date;
    last_login_at: Date;
}

export interface ConceptRow {
    id: string;
    name: string;
    category: string;
    description: string;
    created_at: Date;
}

export interface QuestionRow {
    id: string;
    content: string;
    options: string; // JSON string
    correct_answer: string;
    explanation: string;
    concept_id: string;
    sub_concept: string | null;
    difficulty: Difficulty;
    source: string;
    year_appeared: number | null;
    created_at: Date;
    updated_at: Date;
}

export interface TestRow {
    id: string;
    question_ids: string; // JSON string array
    total_questions: number;
    duration: number;
    created_at: Date;
}

export interface TestSessionRow {
    id: string;
    user_id: string;
    test_id: string;
    start_time: Date;
    end_time: Date | null;
    status: TestSessionStatus;
    total_time_spent: number;
    created_at: Date;
}

export interface SessionAnswerRow {
    id: string;
    session_id: string;
    question_id: string;
    selected_answer: string;
    marked_for_review: boolean;
    answered_at: Date;
}

export interface QuestionTimeRow {
    id: string;
    session_id: string;
    question_id: string;
    time_spent: number;
    created_at: Date;
    updated_at: Date;
}

export interface TestResultRow {
    id: string;
    session_id: string;
    user_id: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    percentage: number;
    concept_performance: string; // JSON string
    feedback: string; // JSON string
    created_at: Date;
}

export interface ConceptTrendRow {
    id: string;
    concept_id: string;
    frequency: number;
    importance: number;
    yearly_distribution: string; // JSON string
    last_updated: Date;
}
