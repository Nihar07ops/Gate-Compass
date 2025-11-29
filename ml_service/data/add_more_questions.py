import json
from datetime import datetime

# Additional GATE CSE Questions Database
additional_questions = [
    # Data Structures
    {
        "id": "ds_101",
        "text": "What is the worst-case time complexity of inserting an element in a binary search tree?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        "correctAnswer": "O(n)",
        "explanation": "In the worst case (skewed tree), insertion takes O(n) time.",
        "topic": "Binary Search Trees",
        "subject": "Data Structures",
        "section": "Core Computer Science",
        "difficulty": "medium",
        "year": 2023,
        "marks": 1
    },
    {
        "id": "ds_102",
        "text": "Which data structure is used for implementing recursion?",
        "options": ["Queue", "Stack", "Array", "Linked List"],
        "correctAnswer": "Stack",
        "explanation": "Recursion uses the call stack to store function calls.",
        "topic": "Stack",
        "subject": "Data Structures",
        "section": "Core Computer Science",
        "difficulty": "easy",
        "year": 2023,
        "marks": 1
    },
    {
        "id": "ds_103",
        "text": "What is the space complexity of BFS traversal?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        "correctAnswer": "O(n)",
        "explanation": "BFS uses a queue that can store all nodes at a level, requiring O(n) space.",
        "topic": "Graph Traversal",
        "subject": "Data Structures",
        "section": "Core Computer Science",
        "difficulty": "medium",
        "year": 2022,
        "marks": 1
    },
    # Algorithms
    {
        "id": "algo_101",
        "text": "Which sorting algorithm has the best average-case time complexity?",
        "options": ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
        "correctAnswer": "Merge Sort",
        "explanation": "Merge Sort has O(n log n) average-case complexity.",
        "topic": "Sorting",
        "subject": "Algorithms",
        "section": "Core Computer Science",
        "difficulty": "easy",
        "year": 2023,
        "marks": 1
    },
    {
        "id": "algo_102",
        "text": "What is the time complexity of the Knapsack problem using dynamic programming?",
        "options": ["O(n)", "O(n^2)", "O(nW)", "O(2^n)"],
        "correctAnswer": "O(nW)",
        "explanation": "DP solution for 0/1 Knapsack has O(nW) complexity where n is items and W is capacity.",
        "topic": "Dynamic Programming",
        "subject": "Algorithms",
        "section": "Core Computer Science",
        "difficulty": "hard",
        "year": 2022,
        "marks": 2
    },
    # Operating Systems
    {
        "id": "os_101",
        "text": "Which scheduling algorithm can cause starvation?",
        "options": ["FCFS", "Round Robin", "Shortest Job First", "Priority Scheduling"],
        "correctAnswer": "Priority Scheduling",
        "explanation": "Low priority processes may never execute if high priority processes keep arriving.",
        "topic": "CPU Scheduling",
        "subject": "Operating Systems",
        "section": "Core Computer Science",
        "difficulty": "medium",
        "year": 2023,
        "marks": 1
    },
    {
        "id": "os_102",
        "text": "What is thrashing in operating systems?",
        "options": [
            "High CPU utilization",
            "Excessive paging activity",
            "Process synchronization",
            "Memory allocation"
        ],
        "correctAnswer": "Excessive paging activity",
        "explanation": "Thrashing occurs when a system spends more time paging than executing.",
        "topic": "Memory Management",
        "subject": "Operating Systems",
        "section": "Core Computer Science",
        "difficulty": "medium",
        "year": 2022,
        "marks": 1
    },
]

def add_questions_to_database():
    print("📚 Adding more questions to database...")
    
    # Load existing questions
    try:
        with open('gate_format_complete.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            existing_questions = data.get('questions', [])
    except FileNotFoundError:
        existing_questions = []
        data = {"questions": [], "metadata": {}}
    
    print(f"📊 Current questions: {len(existing_questions)}")
    
    # Add new questions (avoid duplicates)
    existing_ids = {q['id'] for q in existing_questions}
    new_questions = [q for q in additional_questions if q['id'] not in existing_ids]
    
    combined_questions = existing_questions + new_questions
    
    print(f"➕ Adding {len(new_questions)} new questions")
    print(f"📊 Total questions: {len(combined_questions)}")
    
    # Update metadata
    sections = {}
    for q in combined_questions:
        section = q.get('section', 'Core Computer Science')
        sections[section] = sections.get(section, 0) + 1
    
    data['questions'] = combined_questions
    data['metadata'] = {
        "totalQuestions": len(combined_questions),
        "totalMarks": sum(q.get('marks', 1) for q in combined_questions),
        "sections": {
            section: {
                "questions": count,
                "marks": sum(q.get('marks', 1) for q in combined_questions if q.get('section') == section)
            }
            for section, count in sections.items()
        },
        "lastUpdated": datetime.now().isoformat()
    }
    
    # Save
    with open('gate_format_complete.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("✅ Questions added successfully!")
    return data

if __name__ == "__main__":
    add_questions_to_database()
