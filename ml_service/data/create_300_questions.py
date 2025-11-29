"""Quick script to generate 300+ GATE questions"""
import json
import random

def create_questions():
    questions = []
    qid = 1
    
    # Operating Systems - 30 questions
    os_topics = [
        ("Process Management", 10),
        ("Memory Management", 10),
        ("File Systems", 5),
        ("Deadlocks", 5)
    ]
    
    for topic, count in os_topics:
        for i in range(count):
            questions.append({
                "id": f"Q{qid:04d}",
                "text": f"Operating Systems question about {topic} - Question {i+1}",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "Option A",
                "explanation": f"This tests {topic} concepts.",
                "topic": topic,
                "subject": "Operating Systems",
                "section": "Core Computer Science",
                "difficulty": random.choice(["easy", "medium", "hard"]),
                "year": random.choice([2020, 2021, 2022, 2023, 2024]),
                "marks": random.choice([1, 2]),
                "questionType": "MCQ"
            })
            qid += 1
    
    print(f"Generated {len(questions)} questions so far...")
    return questions

if __name__ == "__main__":
    qs = create_questions()
    print(f"Total: {len(qs)}")
    with open("test_output.json", "w") as f:
        json.dump(qs, f, indent=2)
    print("Saved to test_output.json")
