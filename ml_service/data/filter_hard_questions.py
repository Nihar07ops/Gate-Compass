import json

# Load questions
with open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")

# Analyze hard questions
hard = [q for q in data if q['difficulty'] in ['hard', 'advanced']]
print(f"\nCurrent hard questions: {len(hard)}")

# Filter out simple questions from hard
# Criteria for removal:
# 1. Single word or short phrase answers (< 15 chars)
# 2. Simple yes/no questions
# 3. Basic definition questions
# 4. Questions with very short text (< 80 chars)

removed = []
kept_hard = []

for q in hard:
    # Check if answer is too simple
    answer = q['correctAnswer']
    is_simple_answer = len(answer) < 15 and not any(char.isdigit() for char in answer)
    
    # Check if question is too short
    is_short_question = len(q['text']) < 80
    
    # Check if it's a simple concept question (not numerical)
    is_numerical = q.get('questionType') == 'Numerical'
    
    # Keep if: numerical OR (complex answer AND long question)
    if is_numerical or (not is_simple_answer and not is_short_question):
        kept_hard.append(q)
    else:
        # Reclassify to medium
        q['difficulty'] = 'medium'
        removed.append(q)
        print(f"Removing from hard: {q['text'][:80]}... (Answer: {answer})")

print(f"\n✅ Kept {len(kept_hard)} truly hard questions")
print(f"❌ Moved {len(removed)} simple questions to medium")

# Update all questions
for q in data:
    if q in removed:
        q['difficulty'] = 'medium'

# Count by difficulty
from collections import Counter
diff_count = Counter(q['difficulty'] for q in data)
print(f"\nNew difficulty distribution:")
for diff, count in sorted(diff_count.items()):
    print(f"  {diff}: {count}")

# Count numerical in hard
hard_questions = [q for q in data if q['difficulty'] in ['hard', 'advanced']]
numerical_hard = [q for q in hard_questions if q.get('questionType') == 'Numerical']
print(f"\n🔢 Numerical questions in hard: {len(numerical_hard)}/{len(hard_questions)} ({len(numerical_hard)/len(hard_questions)*100:.1f}%)")

# Save
with open('ml_service/data/comprehensive_300_questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved updated questions")
