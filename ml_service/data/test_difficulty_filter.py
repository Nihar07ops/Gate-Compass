import json

# Load questions
with open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8') as f:
    data = json.load(f)

print("Testing difficulty filtering:\n")

# Test each difficulty level
difficulty_map = {
    'beginner': ['easy', 'beginner'],
    'intermediate': ['medium', 'intermediate'],
    'advanced': ['hard', 'advanced']
}

for frontend_diff, db_diffs in difficulty_map.items():
    matching = [q for q in data if q['difficulty'] in db_diffs]
    numerical = [q for q in matching if q.get('questionType') == 'Numerical']
    
    print(f"{frontend_diff.upper()}:")
    print(f"  Total questions: {len(matching)}")
    print(f"  Numerical questions: {len(numerical)}")
    
    if matching:
        # Show sample question
        sample = matching[0]
        print(f"  Sample: {sample['text'][:80]}...")
        print(f"  Marks: {sample.get('marks', 1)}")
    
    if numerical:
        print(f"  Sample numerical: {numerical[0]['text'][:80]}...")
    
    print()
