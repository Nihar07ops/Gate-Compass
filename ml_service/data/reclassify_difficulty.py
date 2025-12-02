import json

# Load questions
with open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8') as f:
    data = json.load(f)

print(f"Original distribution:")
from collections import Counter
diff_count = Counter(q['difficulty'] for q in data)
for diff, count in sorted(diff_count.items()):
    print(f"  {diff}: {count}")

# Reclassify questions
# Keep numerical questions as hard
# Reclassify simple concept questions from hard to medium
reclassified = 0

for q in data:
    # If it's marked as hard but not numerical and has short text, it's probably a simple concept
    if q['difficulty'] == 'hard' and q.get('questionType') != 'Numerical':
        # Check if it's a simple concept question (short text, simple options)
        if len(q['text']) < 150 and all(len(opt) < 50 for opt in q['options']):
            q['difficulty'] = 'medium'
            reclassified += 1

print(f"\n✅ Reclassified {reclassified} simple questions from hard to medium")

print(f"\nNew distribution:")
diff_count = Counter(q['difficulty'] for q in data)
for diff, count in sorted(diff_count.items()):
    print(f"  {diff}: {count}")

# Count numerical questions
numerical = [q for q in data if q.get('questionType') == 'Numerical']
print(f"\n🔢 Numerical questions (all hard): {len(numerical)}")

# Save updated questions
with open('ml_service/data/comprehensive_300_questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved updated questions")
