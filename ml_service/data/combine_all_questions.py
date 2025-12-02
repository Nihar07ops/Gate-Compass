"""
Combine all question banks into one comprehensive file
Includes: hard numerical, textbook-based, authentic GATE questions
"""

import json
import os

def load_json(filename):
    """Load JSON file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return None

def combine_all_questions():
    """Combine all question sources"""
    all_questions = []
    question_id = 1
    
    # Load hard numerical questions
    hard_data = load_json('hard_numerical_questions.json')
    if hard_data and 'questions' in hard_data:
        for q in hard_data['questions']:
            all_questions.append({
                "id": question_id,
                "text": q["question"],
                "options": q["options"],
                "correctAnswer": q["correctAnswer"],
                "topic": q.get("topic", "General"),
                "subject": q.get("topic", "Computer Science"),
                "section": "Core Computer Science",
                "difficulty": "hard",
                "questionType": q.get("type", "mcq"),
                "year": q.get("year", "2023"),
                "marks": q.get("marks", 3),
                "explanation": q.get("explanation", "")
            })
            question_id += 1
    
    # Load textbook questions
    textbook_data = load_json('textbook_questions.json')
    if textbook_data and 'questions' in textbook_data:
        for difficulty_level in ['beginner', 'intermediate', 'advanced']:
            if difficulty_level in textbook_data['questions']:
                for q in textbook_data['questions'][difficulty_level]:
                    all_questions.append({
                        "id": question_id,
                        "text": q["question"],
                        "options": q["options"],
                        "correctAnswer": q["correct"],
                        "topic": q.get("source", "General"),
                        "subject": q.get("source", "Computer Science"),
                        "section": "Core Computer Science",
                        "difficulty": difficulty_level,
                        "questionType": "mcq",
                        "year": "2023",
                        "marks": q.get("marks", 2),
                        "explanation": q.get("explanation", "")
                    })
                    question_id += 1
    
    # Load authentic GATE questions
    authentic_data = load_json('authentic_gate_questions.json')
    if authentic_data and 'questions' in authentic_data:
        for q in authentic_data['questions']:
            all_questions.append({
                "id": question_id,
                "text": q["question"],
                "options": q["options"],
                "correctAnswer": q["correctAnswer"],
                "topic": q.get("topic", "General"),
                "subject": q.get("topic", "Computer Science"),
                "section": "Core Computer Science",
                "difficulty": q.get("difficulty", "medium"),
                "questionType": "mcq",
                "year": q.get("year", "2023"),
                "marks": q.get("marks", 2),
                "explanation": q.get("explanation", "")
            })
            question_id += 1
    
    # Load mock test questions
    mock_data = load_json('mock_tests.json')
    if mock_data and 'tests' in mock_data:
        for level in ['beginner', 'intermediate', 'advanced']:
            if level in mock_data['tests'] and 'questions' in mock_data['tests'][level]:
                for q in mock_data['tests'][level]['questions']:
                    all_questions.append({
                        "id": question_id,
                        "text": q["question"],
                        "options": q["options"],
                        "correctAnswer": q["correctAnswer"],
                        "topic": q.get("topic", "General"),
                        "subject": q.get("topic", "Computer Science"),
                        "section": "Core Computer Science",
                        "difficulty": level,
                        "questionType": "mcq",
                        "year": "2023",
                        "marks": q.get("marks", 2),
                        "explanation": q.get("explanation", "")
                    })
                    question_id += 1
    
    print(f"✅ Combined {len(all_questions)} questions from all sources")
    
    # Count by difficulty
    difficulty_count = {}
    for q in all_questions:
        diff = q['difficulty']
        difficulty_count[diff] = difficulty_count.get(diff, 0) + 1
    
    print(f"📊 By difficulty: {difficulty_count}")
    
    # Save combined questions
    with open('comprehensive_300_questions.json', 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved to: comprehensive_300_questions.json")
    
    return all_questions

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    combine_all_questions()
