import json
import random

# Load questions
with open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8') as f:
    data = json.load(f)

# Get advanced questions
advanced = [q for q in data if q['difficulty'] in ['hard', 'advanced']]
numerical = [q for q in advanced if q.get('questionType') == 'Numerical']

print("=" * 80)
print("ADVANCED DIFFICULTY - SAMPLE QUESTIONS")
print("=" * 80)

print(f"\nTotal Advanced Questions: {len(advanced)}")
print(f"Numerical Questions: {len(numerical)} ({len(numerical)/len(advanced)*100:.1f}%)")
print(f"Conceptual Questions: {len(advanced) - len(numerical)}")

print("\n" + "=" * 80)
print("SAMPLE NUMERICAL QUESTIONS (5 random)")
print("=" * 80)

samples = random.sample(numerical, min(5, len(numerical)))
for i, q in enumerate(samples, 1):
    print(f"\n{i}. [{q['topic']}] ({q['marks']} marks)")
    print(f"   {q['text'][:150]}...")
    print(f"   Options: {q['options']}")
    print(f"   Answer: {q['correctAnswer']}")

print("\n" + "=" * 80)
print("SAMPLE CONCEPTUAL QUESTIONS (3 random)")
print("=" * 80)

conceptual = [q for q in advanced if q.get('questionType') != 'Numerical']
samples = random.sample(conceptual, min(3, len(conceptual)))
for i, q in enumerate(samples, 1):
    print(f"\n{i}. [{q['topic']}] ({q['marks']} marks)")
    print(f"   {q['text']}")
    print(f"   Options: {q['options']}")
    print(f"   Answer: {q['correctAnswer']}")

print("\n" + "=" * 80)
