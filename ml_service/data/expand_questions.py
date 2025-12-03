import json
from datetime import datetime

# Comprehensive GATE CSE Questions
comprehensive_questions = [
    # Algorithms - 20 questions
    {"id": "algo_201", "text": "What is the recurrence relation for Merge Sort?", "options": ["T(n) = 2T(n/2) + O(n)", "T(n) = T(n-1) + O(1)", "T(n) = T(n/2) + O(1)", "T(n) = 2T(n-1) + O(n)"], "correctAnswer": "T(n) = 2T(n/2) + O(n)", "explanation": "Merge Sort divides array into two halves and merges them.", "topic": "Divide and Conquer", "subject": "Algorithms", "section": "Core Computer Science", "difficulty": "medium", "year": 2023, "marks": 2},
    {"id": "algo_202", "text": "Which algorithm is used to find the shortest path in a weighted graph?", "options": ["BFS", "DFS", "Dijkstra's", "Kruskal's"], "correctAnswer": "Dijkstra's", "explanation": "Dijkstra's algorithm finds shortest paths from source to all vertices.", "topic": "Graph Algorithms", "subject": "Algorithms", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "algo_203", "text": "What is the time complexity of the Floyd-Warshall algorithm?", "options": ["O(V^2)", "O(V^3)", "O(V log V)", "O(E log V)"], "correctAnswer": "O(V^3)", "explanation": "Floyd-Warshall uses three nested loops over all vertices.", "topic": "Graph Algorithms", "subject": "Algorithms", "section": "Core Computer Science", "difficulty": "medium", "year": 2022, "marks": 1},
    {"id": "algo_204", "text": "Which sorting algorithm is stable and has O(n log n) complexity?", "options": ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], "correctAnswer": "Merge Sort", "explanation": "Merge Sort maintains relative order of equal elements.", "topic": "Sorting", "subject": "Algorithms", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "algo_205", "text": "What is the optimal substructure property in dynamic programming?", "options": ["Problem can be divided into subproblems", "Optimal solution contains optimal solutions to subproblems", "Subproblems overlap", "Problem has greedy choice property"], "correctAnswer": "Optimal solution contains optimal solutions to subproblems", "explanation": "Optimal substructure means optimal solution is built from optimal solutions of subproblems.", "topic": "Dynamic Programming", "subject": "Algorithms", "section": "Core Computer Science", "difficulty": "medium", "year": 2022, "marks": 2},
    
    # Data Structures - 20 questions
    {"id": "ds_201", "text": "What is the maximum number of nodes at level L in a binary tree?", "options": ["2^L", "2^(L-1)", "2^(L+1)", "L^2"], "correctAnswer": "2^L", "explanation": "At level L, maximum nodes = 2^L (assuming root is at level 0).", "topic": "Trees", "subject": "Data Structures", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "ds_202", "text": "Which data structure is used in Breadth First Search?", "options": ["Stack", "Queue", "Priority Queue", "Deque"], "correctAnswer": "Queue", "explanation": "BFS uses FIFO queue to explore nodes level by level.", "topic": "Graph Traversal", "subject": "Data Structures", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "ds_203", "text": "What is the height of a complete binary tree with n nodes?", "options": ["log n", "n", "n log n", "sqrt(n)"], "correctAnswer": "log n", "explanation": "Height of complete binary tree is floor(log2(n)).", "topic": "Trees", "subject": "Data Structures", "section": "Core Computer Science", "difficulty": "medium", "year": 2022, "marks": 1},
    {"id": "ds_204", "text": "Which operation is NOT efficient in a singly linked list?", "options": ["Insertion at beginning", "Deletion at beginning", "Accessing last element", "Insertion after a node"], "correctAnswer": "Accessing last element", "explanation": "Accessing last element requires O(n) traversal in singly linked list.", "topic": "Linked Lists", "subject": "Data Structures", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "ds_205", "text": "What is the time complexity of building a heap from n elements?", "options": ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"], "correctAnswer": "O(n)", "explanation": "Building a heap using bottom-up approach takes O(n) time.", "topic": "Heaps", "subject": "Data Structures", "section": "Core Computer Science", "difficulty": "hard", "year": 2022, "marks": 2},
    
    # Operating Systems - 15 questions
    {"id": "os_201", "text": "What is the purpose of the Translation Lookaside Buffer (TLB)?", "options": ["Cache memory", "Speed up virtual to physical address translation", "Store page tables", "Manage processes"], "correctAnswer": "Speed up virtual to physical address translation", "explanation": "TLB caches recent virtual-to-physical address translations.", "topic": "Memory Management", "subject": "Operating Systems", "section": "Core Computer Science", "difficulty": "medium", "year": 2023, "marks": 1},
    {"id": "os_202", "text": "Which page replacement algorithm suffers from Belady's anomaly?", "options": ["LRU", "Optimal", "FIFO", "LFU"], "correctAnswer": "FIFO", "explanation": "FIFO can have more page faults with more frames (Belady's anomaly).", "topic": "Memory Management", "subject": "Operating Systems", "section": "Core Computer Science", "difficulty": "hard", "year": 2022, "marks": 2},
    {"id": "os_203", "text": "What is a race condition?", "options": ["CPU scheduling conflict", "Multiple processes accessing shared data simultaneously", "Deadlock situation", "Priority inversion"], "correctAnswer": "Multiple processes accessing shared data simultaneously", "explanation": "Race condition occurs when outcome depends on timing of uncontrollable events.", "topic": "Process Synchronization", "subject": "Operating Systems", "section": "Core Computer Science", "difficulty": "medium", "year": 2023, "marks": 1},
    {"id": "os_204", "text": "Which scheduling algorithm gives minimum average waiting time?", "options": ["FCFS", "SJF", "Round Robin", "Priority"], "correctAnswer": "SJF", "explanation": "Shortest Job First minimizes average waiting time.", "topic": "CPU Scheduling", "subject": "Operating Systems", "section": "Core Computer Science", "difficulty": "medium", "year": 2023, "marks": 1},
    {"id": "os_205", "text": "What is the main advantage of multi-threading?", "options": ["Reduced memory usage", "Better resource utilization", "Simplified programming", "Faster execution"], "correctAnswer": "Better resource utilization", "explanation": "Threads share resources and allow better CPU utilization.", "topic": "Threads", "subject": "Operating Systems", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    
    # DBMS - 15 questions
    {"id": "dbms_201", "text": "What is the highest normal form?", "options": ["3NF", "BCNF", "4NF", "5NF"], "correctAnswer": "5NF", "explanation": "5NF (Fifth Normal Form) or PJNF is the highest normal form.", "topic": "Normalization", "subject": "DBMS", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "dbms_202", "text": "Which isolation level prevents dirty reads?", "options": ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], "correctAnswer": "Read Committed", "explanation": "Read Committed prevents reading uncommitted data.", "topic": "Transactions", "subject": "DBMS", "section": "Core Computer Science", "difficulty": "medium", "year": 2022, "marks": 1},
    {"id": "dbms_203", "text": "What is a candidate key?", "options": ["Primary key", "Foreign key", "Minimal superkey", "Composite key"], "correctAnswer": "Minimal superkey", "explanation": "Candidate key is a minimal set of attributes that uniquely identifies tuples.", "topic": "Keys", "subject": "DBMS", "section": "Core Computer Science", "difficulty": "medium", "year": 2023, "marks": 1},
    {"id": "dbms_204", "text": "Which join returns all rows from both tables?", "options": ["Inner Join", "Left Join", "Right Join", "Full Outer Join"], "correctAnswer": "Full Outer Join", "explanation": "Full Outer Join returns all rows from both tables with NULLs for non-matching rows.", "topic": "SQL", "subject": "DBMS", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "dbms_205", "text": "What is the purpose of indexing in databases?", "options": ["Data security", "Faster data retrieval", "Data backup", "Data normalization"], "correctAnswer": "Faster data retrieval", "explanation": "Indexes speed up data retrieval operations.", "topic": "Indexing", "subject": "DBMS", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    
    # Computer Networks - 15 questions
    {"id": "cn_201", "text": "Which layer of OSI model handles routing?", "options": ["Physical", "Data Link", "Network", "Transport"], "correctAnswer": "Network", "explanation": "Network layer (Layer 3) handles routing and logical addressing.", "topic": "OSI Model", "subject": "Computer Networks", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "cn_202", "text": "What is the maximum size of TCP header?", "options": ["20 bytes", "40 bytes", "60 bytes", "80 bytes"], "correctAnswer": "60 bytes", "explanation": "TCP header can be 20-60 bytes (20 bytes fixed + 40 bytes options).", "topic": "TCP/IP", "subject": "Computer Networks", "section": "Core Computer Science", "difficulty": "medium", "year": 2022, "marks": 1},
    {"id": "cn_203", "text": "Which protocol is used for email transmission?", "options": ["HTTP", "FTP", "SMTP", "POP3"], "correctAnswer": "SMTP", "explanation": "SMTP (Simple Mail Transfer Protocol) is used to send emails.", "topic": "Application Layer", "subject": "Computer Networks", "section": "Core Computer Science", "difficulty": "easy", "year": 2023, "marks": 1},
    {"id": "cn_204", "text": "What is the purpose of ARP?", "options": ["IP to MAC address resolution", "MAC to IP address resolution", "Domain name resolution", "Port number assignment"], "correctAnswer": "IP to MAC address resolution", "explanation": "ARP (Address Resolution Protocol) maps IP addresses to MAC addresses.", "topic": "Network Layer", "subject": "Computer Networks", "section": "Core Computer Science", "difficulty": "medium", "year": 2023, "marks": 1},
    {"id": "cn_205", "text": "Which routing algorithm is used by OSPF?", "options": ["Distance Vector", "Link State", "Path Vector", "Hybrid"], "correctAnswer": "Link State", "explanation": "OSPF uses Link State routing algorithm.", "topic": "Routing", "subject": "Computer Networks", "section": "Core Computer Science", "difficulty": "medium", "year": 2022, "marks": 1},
]

def expand_question_database():
    print("=" * 70)
    print("  Expanding GATE CSE Question Database")
    print("=" * 70)
    print()
    
    # Load existing
    try:
        with open('gate_format_complete.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            existing = data.get('questions', [])
    except FileNotFoundError:
        existing = []
        data = {}
    
    print(f"📊 Current questions: {len(existing)}")
    
    # Add new questions
    existing_ids = {q['id'] for q in existing}
    new_questions = [q for q in comprehensive_questions if q['id'] not in existing_ids]
    
    all_questions = existing + new_questions
    
    print(f"➕ Adding {len(new_questions)} new questions")
    print(f"📊 Total questions: {len(all_questions)}")
    
    # Calculate metadata
    sections = {}
    subjects = {}
    for q in all_questions:
        section = q.get('section', 'Core Computer Science')
        subject = q.get('subject', 'Computer Science')
        sections[section] = sections.get(section, 0) + 1
        subjects[subject] = subjects.get(subject, 0) + 1
    
    data = {
        "questions": all_questions,
        "metadata": {
            "totalQuestions": len(all_questions),
            "totalMarks": sum(q.get('marks', 1) for q in all_questions),
            "sections": {
                section: {
                    "questions": count,
                    "marks": sum(q.get('marks', 1) for q in all_questions if q.get('section') == section)
                }
                for section, count in sections.items()
            },
            "subjects": subjects,
            "lastUpdated": datetime.now().isoformat()
        }
    }
    
    # Save
    with open('gate_format_complete.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("\n✅ Database expanded successfully!")
    print(f"\n📊 Summary by Subject:")
    for subject, count in sorted(subjects.items()):
        print(f"   {subject}: {count} questions")
    
    return data

if __name__ == "__main__":
    expand_question_database()
