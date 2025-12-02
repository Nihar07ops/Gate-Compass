import json

# Load questions
with open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8') as f:
    data = json.load(f)

# Get non-numerical hard questions
hard = [q for q in data if q['difficulty'] == 'hard' and q.get('questionType') != 'Numerical']

print(f"Non-numerical hard questions: {len(hard)}\n")

for i, q in enumerate(hard[:15], 1):
    print(f"{i}. {q['text'][:120]}")
    print(f"   Options: {q['options'][0]}, {q['options'][1]}")
    print(f"   Marks: {q.get('marks', 1)}, ID: {q['id']}")
    print()
