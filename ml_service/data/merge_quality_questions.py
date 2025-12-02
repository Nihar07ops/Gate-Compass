import json
from datetime import datetime

def load_json(filepath):
    """Load JSON file with proper encoding"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None

def merge_questions():
    """Merge hard numerical questions with existing comprehensive questions"""
    
    # Load existing comprehensive questions
    comprehensive = load_json('ml_service/data/comprehensive_300_questions.json')
    if not comprehensive:
        comprehensive = []
    
    print(f"✅ Loaded {len(comprehensive)} comprehensive questions")
    
    # Load hard numerical questions
    hard_numerical_data = load_json('ml_service/data/hard_numerical_questions.json')
    if hard_numerical_data and 'questions' in hard_numerical_data:
        hard_questions = hard_numerical_data['questions']
        print(f"✅ Loaded {len(hard_questions)} hard numerical questions")
        
        # Convert hard questions to standard format
        for q in hard_questions:
            # Map correctAnswer index to actual answer text
            if isinstance(q.get('correctAnswer'), int):
                idx = q['correctAnswer']
                if 0 <= idx < len(q['options']):
                    q['correctAnswer'] = q['options'][idx]
            
            # Standardize fields
            standardized = {
                'id': f"HARD_{q['id']:04d}",
                'text': q['question'],
                'options': q['options'],
                'correctAnswer': q['correctAnswer'],
                'explanation': q.get('explanation', ''),
                'topic': q['topic'],
                'subject': q['topic'].split(' - ')[0] if ' - ' in q['topic'] else q['topic'],
                'section': 'Core Computer Science',
                'difficulty': 'hard',
                'year': int(q.get('year', 2024)),
                'marks': q.get('marks', 2),
                'questionType': 'Numerical' if q.get('type') == 'numerical' else 'MCQ',
                'numerical_value': q.get('numerical_value')
            }
            comprehensive.append(standardized)
    
    # Load textbook questions
    textbook_data = load_json('ml_service/data/textbook_questions.json')
    if textbook_data and 'questions' in textbook_data:
        # Handle nested structure
        if isinstance(textbook_data['questions'], dict) and 'all' in textbook_data['questions']:
            textbook_questions = textbook_data['questions']['all']
        else:
            textbook_questions = textbook_data['questions']
        print(f"✅ Loaded {len(textbook_questions)} textbook questions")
        
        for q in textbook_questions:
            # Map correctAnswer index to actual answer text
            if isinstance(q.get('correctAnswer'), int):
                idx = q['correctAnswer']
                if 0 <= idx < len(q['options']):
                    q['correctAnswer'] = q['options'][idx]
            
            # Extract topic from source if not present
            topic = q.get('topic', q.get('source', 'Computer Science'))
            
            standardized = {
                'id': f"TEXT_{q['id']:04d}",
                'text': q['question'],
                'options': q['options'],
                'correctAnswer': q['correctAnswer'],
                'explanation': q.get('explanation', ''),
                'topic': topic,
                'subject': topic.split(' - ')[0] if ' - ' in topic else topic,
                'section': 'Core Computer Science',
                'difficulty': q.get('difficulty', 'medium'),
                'year': int(q.get('year', 2024)),
                'marks': q.get('marks', 1),
                'questionType': 'MCQ',
                'reference': q.get('reference', q.get('source', ''))
            }
            comprehensive.append(standardized)
    
    # Load authentic GATE questions
    authentic_data = load_json('ml_service/data/authentic_gate_questions.json')
    if authentic_data and 'questions' in authentic_data:
        authentic_questions = authentic_data['questions']
        print(f"✅ Loaded {len(authentic_questions)} authentic GATE questions")
        
        for q in authentic_questions:
            # Map correctAnswer index to actual answer text
            if isinstance(q.get('correctAnswer'), int):
                idx = q['correctAnswer']
                if 0 <= idx < len(q['options']):
                    q['correctAnswer'] = q['options'][idx]
            
            standardized = {
                'id': f"AUTH_{q['id']:04d}",
                'text': q['question'],
                'options': q['options'],
                'correctAnswer': q['correctAnswer'],
                'explanation': q.get('explanation', ''),
                'topic': q['topic'],
                'subject': q['topic'].split(' - ')[0] if ' - ' in q['topic'] else q['topic'],
                'section': 'Core Computer Science',
                'difficulty': q.get('difficulty', 'medium'),
                'year': int(q.get('year', 2024)),
                'marks': q.get('marks', 1),
                'questionType': 'MCQ'
            }
            comprehensive.append(standardized)
    
    # Remove duplicates based on question text
    seen_texts = set()
    unique_questions = []
    for q in comprehensive:
        text_key = q['text'].lower().strip()
        if text_key not in seen_texts:
            seen_texts.add(text_key)
            unique_questions.append(q)
    
    print(f"\n📊 Total unique questions: {len(unique_questions)}")
    
    # Count by difficulty
    difficulty_count = {}
    for q in unique_questions:
        diff = q.get('difficulty', 'medium')
        difficulty_count[diff] = difficulty_count.get(diff, 0) + 1
    
    print(f"📈 Difficulty distribution:")
    for diff, count in sorted(difficulty_count.items()):
        print(f"   {diff}: {count}")
    
    # Count numerical questions
    numerical_count = sum(1 for q in unique_questions if q.get('questionType') == 'Numerical')
    print(f"🔢 Numerical questions: {numerical_count}")
    
    # Save merged questions
    output_file = 'ml_service/data/comprehensive_300_questions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_questions, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved {len(unique_questions)} questions to {output_file}")
    
    # Create metadata file
    metadata = {
        'total_questions': len(unique_questions),
        'difficulty_distribution': difficulty_count,
        'numerical_questions': numerical_count,
        'sources': [
            'comprehensive_300_questions.json',
            'hard_numerical_questions.json',
            'textbook_questions.json',
            'authentic_gate_questions.json'
        ],
        'generated_at': datetime.now().isoformat(),
        'topics': list(set(q['topic'] for q in unique_questions))
    }
    
    with open('ml_service/data/question_bank_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved metadata to question_bank_metadata.json")

if __name__ == '__main__':
    merge_questions()
