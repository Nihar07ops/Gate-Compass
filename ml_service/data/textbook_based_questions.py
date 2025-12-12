"""
Textbook-Based GATE Questions Generator
Based on standard CS textbooks:
- Cormen (Algorithms)
- Tanenbaum (OS, Networks)
- Silberschatz (OS)
- Navathe (Database)
- Forouzan (Networks)
"""

import json
import random
from datetime import datetime

# Questions based on standard textbooks
TEXTBOOK_QUESTIONS = {
    "Algorithms - Cormen": [
        # Beginner
        {
            "question": "According to Cormen, what is the running time of Insertion Sort in the best case?",
            "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
            "correct": 0,
            "explanation": "Best case occurs when array is already sorted, requiring only O(n) comparisons.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Cormen Chapter 2"
        },
        {
            "question": "In divide-and-conquer paradigm, which step combines solutions of subproblems?",
            "options": ["Divide", "Conquer", "Combine", "Merge"],
            "correct": 2,
            "explanation": "Combine step merges solutions of subproblems to solve original problem.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Cormen Chapter 2"
        },
        # Intermediate
        {
            "question": "For recurrence T(n) = T(n/3) + T(2n/3) + O(n), what is the solution using recursion tree method?",
            "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
            "correct": 1,
            "explanation": "Height of tree is log₃/₂(n), each level does O(n) work, giving O(n log n).",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Cormen Chapter 4"
        },
        {
            "question": "In dynamic programming, what is the optimal substructure property?",
            "options": ["Overlapping subproblems", "Optimal solution contains optimal solutions to subproblems", "Greedy choice", "Memoization"],
            "correct": 1,
            "explanation": "Optimal substructure means optimal solution is composed of optimal solutions to subproblems.",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Cormen Chapter 15"
        },
        # Advanced
        {
            "question": "In Fibonacci heap, what is the amortized cost of EXTRACT-MIN operation?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(√n)"],
            "correct": 1,
            "explanation": "EXTRACT-MIN requires consolidating trees, giving O(log n) amortized time.",
            "difficulty": "advanced",
            "marks": 3,
            "reference": "Cormen Chapter 19"
        }
    ],
    "Operating Systems - Tanenbaum": [
        # Beginner
        {
            "question": "According to Tanenbaum, what is the main purpose of an operating system?",
            "options": ["Compile programs", "Provide abstraction", "Store data", "Connect to internet"],
            "correct": 1,
            "explanation": "OS provides abstraction of hardware resources to make them easier to use.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Tanenbaum Chapter 1"
        },
        {
            "question": "What is a process in operating systems?",
            "options": ["Program on disk", "Program in execution", "CPU instruction", "Memory location"],
            "correct": 1,
            "explanation": "Process is an instance of a program in execution with its own address space.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Tanenbaum Chapter 2"
        },
        # Intermediate
        {
            "question": "In multilevel feedback queue scheduling, what happens when a process uses its entire time quantum?",
            "options": ["Terminates", "Moves to higher priority", "Moves to lower priority", "Stays in same queue"],
            "correct": 2,
            "explanation": "Process is demoted to lower priority queue to favor I/O-bound processes.",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Tanenbaum Chapter 2"
        },
        {
            "question": "What is the working set model in memory management?",
            "options": ["Total memory", "Set of pages in last Δ references", "Cache size", "Virtual memory"],
            "correct": 1,
            "explanation": "Working set is set of pages referenced in last Δ memory references.",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Tanenbaum Chapter 3"
        },
        # Advanced
        {
            "question": "In distributed systems, what is the Byzantine Generals Problem about?",
            "options": ["Deadlock", "Consensus with faulty processes", "Load balancing", "Memory management"],
            "correct": 1,
            "explanation": "Byzantine Generals Problem deals with reaching consensus when some processes may be faulty or malicious.",
            "difficulty": "advanced",
            "marks": 3,
            "reference": "Tanenbaum Chapter 8"
        }
    ],
    "Database - Navathe": [
        # Beginner
        {
            "question": "What is a primary key in relational databases?",
            "options": ["First column", "Unique identifier", "Foreign key", "Index"],
            "correct": 1,
            "explanation": "Primary key uniquely identifies each tuple in a relation.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Navathe Chapter 5"
        },
        {
            "question": "What does ACID stand for in database transactions?",
            "options": ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Data", "Atomic, Concurrent, Independent, Durable", "All, Consistent, Isolated, Data"],
            "correct": 0,
            "explanation": "ACID properties ensure reliable transaction processing.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Navathe Chapter 20"
        },
        # Intermediate
        {
            "question": "A relation R(A,B,C) with FD: A→B, B→C. What is the highest normal form?",
            "options": ["1NF", "2NF", "3NF", "BCNF"],
            "correct": 1,
            "explanation": "Transitive dependency B→C violates 3NF but satisfies 2NF.",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Navathe Chapter 14"
        },
        {
            "question": "In two-phase locking, when are locks released?",
            "options": ["Immediately", "After growing phase", "Before shrinking phase", "At commit"],
            "correct": 1,
            "explanation": "2PL has growing phase (acquire locks) and shrinking phase (release locks).",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Navathe Chapter 20"
        },
        # Advanced
        {
            "question": "What is the difference between conflict serializability and view serializability?",
            "options": ["Same thing", "View is more restrictive", "Conflict is more restrictive", "Unrelated concepts"],
            "correct": 2,
            "explanation": "Every conflict serializable schedule is view serializable, but not vice versa.",
            "difficulty": "advanced",
            "marks": 3,
            "reference": "Navathe Chapter 20"
        }
    ],
    "Computer Networks - Forouzan": [
        # Beginner
        {
            "question": "In OSI model, which layer is responsible for end-to-end communication?",
            "options": ["Network", "Transport", "Session", "Application"],
            "correct": 1,
            "explanation": "Transport layer provides end-to-end communication services.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Forouzan Chapter 2"
        },
        {
            "question": "What is the size of IPv4 address?",
            "options": ["16 bits", "32 bits", "64 bits", "128 bits"],
            "correct": 1,
            "explanation": "IPv4 uses 32-bit addresses, typically written as four octets.",
            "difficulty": "beginner",
            "marks": 1,
            "reference": "Forouzan Chapter 19"
        },
        # Intermediate
        {
            "question": "In CSMA/CD, what is the minimum frame size for 10 Mbps Ethernet with 2.5 km max distance?",
            "options": ["46 bytes", "64 bytes", "128 bytes", "256 bytes"],
            "correct": 1,
            "explanation": "Minimum frame must be large enough to detect collisions: 64 bytes for 10 Mbps Ethernet.",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Forouzan Chapter 13"
        },
        {
            "question": "What is the efficiency of slotted ALOHA?",
            "options": ["18.4%", "36.8%", "50%", "100%"],
            "correct": 1,
            "explanation": "Slotted ALOHA has maximum efficiency of 1/e ≈ 36.8%.",
            "difficulty": "intermediate",
            "marks": 2,
            "reference": "Forouzan Chapter 12"
        },
        # Advanced
        {
            "question": "In TCP congestion control, if ssthresh=32KB and cwnd=16KB, after timeout what is new ssthresh?",
            "options": ["8 KB", "16 KB", "32 KB", "64 KB"],
            "correct": 0,
            "explanation": "New ssthresh = cwnd/2 = 16KB/2 = 8KB after timeout.",
            "difficulty": "advanced",
            "marks": 3,
            "reference": "Forouzan Chapter 24"
        }
    ]
}

def generate_textbook_questions(difficulty_level=None, count=50):
    """Generate questions from textbooks"""
    all_questions = []
    question_id = 1
    
    for source, questions in TEXTBOOK_QUESTIONS.items():
        for q in questions:
            if difficulty_level and q["difficulty"] != difficulty_level:
                continue
                
            all_questions.append({
                "id": question_id,
                "source": source,
                "question": q["question"],
                "options": q["options"],
                "correctAnswer": q["correct"],
                "explanation": q["explanation"],
                "difficulty": q["difficulty"],
                "marks": q["marks"],
                "reference": q["reference"]
            })
            question_id += 1
    
    random.shuffle(all_questions)
    return all_questions[:count] if count else all_questions

def save_textbook_questions():
    """Save all textbook questions"""
    output = {
        "metadata": {
            "total_questions": sum(len(qs) for qs in TEXTBOOK_QUESTIONS.values()),
            "sources": list(TEXTBOOK_QUESTIONS.keys()),
            "generated_at": datetime.now().isoformat(),
            "textbooks": {
                "Algorithms": "Introduction to Algorithms - Cormen, Leiserson, Rivest, Stein",
                "Operating Systems": "Modern Operating Systems - Andrew S. Tanenbaum",
                "Database": "Fundamentals of Database Systems - Elmasri, Navathe",
                "Networks": "Data Communications and Networking - Behrouz A. Forouzan"
            }
        },
        "questions": {
            "all": generate_textbook_questions(),
            "beginner": generate_textbook_questions("beginner"),
            "intermediate": generate_textbook_questions("intermediate"),
            "advanced": generate_textbook_questions("advanced")
        }
    }
    
    with open("textbook_questions.json", 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Generated {output['metadata']['total_questions']} textbook-based questions")
    print(f"📚 Sources: {', '.join(output['metadata']['sources'])}")
    print(f"💾 Saved to: textbook_questions.json")
    
    return output

if __name__ == "__main__":
    save_textbook_questions()
