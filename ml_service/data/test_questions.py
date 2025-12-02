import json

# Load questions
with open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")

# Check hard questions
hard = [q for q in data if q['difficulty'] == 'hard']
print(f"\nHard questions: {len(hard)}")
if hard:
    print(f"Sample hard question:")
    print(f"  Text: {hard[0]['text'][:150]}")
    print(f"  Difficulty: {hard[0]['difficulty']}")
    print(f"  Marks: {hard[0]['marks']}")

# Check numerical questions
numerical = [q for q in data if q.get('questionType') == 'Numerical']
print(f"\nNumerical questions: {len(numerical)}")
if numerical:
    print(f"Sample numerical question:")
    print(f"  Text: {numerical[0]['text'][:150]}")
    print(f"  Type: {numerical[0]['questionType']}")
    print(f"  Options: {numerical[0]['options']}")

# Check difficulty distribution
from collections import Counter
diff_count = Counter(q['difficulty'] for q in data)
print(f"\nDifficulty distribution:")
for diff, count in sorted(diff_count.items()):
    print(f"  {diff}: {count}")
