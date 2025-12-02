"""
Generate comprehensive GATE-level professional question bank
NO definitions, NO simple questions
ONLY application-based, numerical, and multi-concept problems
"""

import json
from datetime import datetime

print("Creating GATE Professional Question Bank...")
print("=" * 80)

# This will be a comprehensive bank - for now, let me create the structure
# and you can expand it with actual GATE previous year questions

# Load existing professional questions
with open('ml_service/data/gate_professional_questions.json', encoding='utf-8') as f:
    prof_data = json.load(f)
    professional_questions = prof_data['questions']

print(f"Loaded {len(professional_questions)} base professional questions")

# Load existing comprehensive questions and FILTER for GATE-level only
with open('ml_service/data/comprehensive_300_questions.json', encoding='utf-8') as f:
    all_questions = json.load(f)

print(f"Loaded {len(all_questions)} total questions")

# STRICT FILTERING CRITERIA for GATE Professional Level
def is_gate_professional(q):
    """
    Determine if question meets GATE professional standards
    """
    text = q['text']
    answer = q['correctAnswer']
    
    # REJECT if:
    # 1. Simple definition questions
    definition_keywords = ['what is', 'which of the following is', 'define', 'meaning of']
    if any(keyword in text.lower()[:50] for keyword in definition_keywords):
        # Unless it's a complex "what is" question
        if len(text) < 100:
            return False
    
    # 2. Single word answers (unless numerical)
    if len(answer) < 15 and not any(char.isdigit() for char in answer) and '(' not in answer:
        return False
    
    # 3. Very short questions (< 100 chars) are usually definitions
    if len(text) < 100 and q.get('questionType') != 'Numerical':
        return False
    
    # 4. Questions with "is" or "are" at the end (yes/no style)
    if text.strip().endswith('?') and ' is ' in text[-30:]:
        return False
    
    # ACCEPT if:
    # 1. Numerical questions (always application-based)
    if q.get('questionType') == 'Numerical':
        return True
    
    # 2. Long, complex questions
    if len(text) > 150:
        return True
    
    # 3. Questions with calculations or algorithms
    calc_keywords = ['calculate', 'compute', 'find the', 'how many', 'what is the time complexity',
                     'what is the space complexity', 'recurrence', 'algorithm', 'complexity']
    if any(keyword in text.lower() for keyword in calc_keywords):
        return True
    
    # 4. Multi-concept questions
    if ',' in text and len(text) > 120:
        return True
    
    return False

# Filter questions
gate_level_questions = [q for q in all_questions if is_gate_professional(q)]

print(f"\n📊 Filtering Results:")
print(f"   Original: {len(all_questions)} questions")
print(f"   GATE Professional Level: {len(gate_level_questions)} questions")
print(f"   Rejected: {len(all_questions) - len(gate_level_questions)} questions")

# Analyze what was kept
from collections import Counter

difficulty_dist = Counter(q['difficulty'] for q in gate_level_questions)
section_dist = Counter(q['section'] for q in gate_level_questions)
type_dist = Counter(q.get('questionType', 'MCQ') for q in gate_level_questions)

print(f"\n📈 GATE Professional Question Distribution:")
print(f"\nBy Difficulty:")
for diff, count in sorted(difficulty_dist.items()):
    print(f"   {diff}: {count}")

print(f"\nBy Section:")
for section, count in sorted(section_dist.items()):
    print(f"   {section}: {count}")

print(f"\nBy Type:")
for qtype, count in sorted(type_dist.items()):
    print(f"   {qtype}: {count}")

# Save GATE professional bank
output_file = 'ml_service/data/gate_professional_bank.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(gate_level_questions, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved {len(gate_level_questions)} GATE professional questions to {output_file}")

# Show sample questions
print(f"\n📝 Sample GATE Professional Questions:")
print("=" * 80)
samples = gate_level_questions[:5]
for i, q in enumerate(samples, 1):
    print(f"\n{i}. [{q['topic']}]")
    print(f"   {q['text'][:120]}...")
    print(f"   Answer: {q['correctAnswer']}")
    print(f"   Type: {q.get('questionType', 'MCQ')}, Marks: {q.get('marks', 1)}")

# Create metadata
metadata = {
    "total_questions": len(gate_level_questions),
    "difficulty_distribution": dict(difficulty_dist),
    "section_distribution": dict(section_dist),
    "type_distribution": dict(type_dist),
    "quality_standard": "GATE Professional Level",
    "no_definitions": True,
    "no_simple_answers": True,
    "application_based": True,
    "generated_at": datetime.now().isoformat()
}

with open('ml_service/data/gate_professional_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print(f"\n✅ Saved metadata to gate_professional_metadata.json")
print("\n" + "=" * 80)
print("GATE Professional Question Bank Created Successfully!")
print("=" * 80)
