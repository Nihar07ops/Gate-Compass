import json
import random

# GATE CSE Format: 65 Questions Total
# Section 1: General Aptitude (10 questions, 15 marks)
# Section 2: Engineering Mathematics (13 questions, 13 marks)  
# Section 3: Core Computer Science (42 questions, 72 marks)

gate_questions = {
    "General Aptitude": [
        {
            "text": "If 'GATE' is coded as 'HBUF', then 'EXAM' will be coded as:",
            "options": ["FYBN", "FZBN", "FYBO", "FZBO"],
            "correctAnswer": "FYBN",
            "difficulty": "easy",
            "marks": 1,
            "section": "General Aptitude"
        },
        {
            "text": "In a class of 60 students, 30 play cricket, 25 play football and 10 play both. How many play neither?",
            "options": ["15", "20", "25", "30"],
            "correctAnswer": "15",
            "difficulty": "medium",
            "marks": 2,
            "section": "General Aptitude"
        },
        {
            "text": "The ratio of boys to girls in a class is 3:2. If there are 45 students, how many are girls?",
            "options": ["18", "20", "25", "27"],
            "correctAnswer": "18",
            "difficulty": "easy",
            "marks": 1,
            "section": "General Aptitude"
        },
        {
            "text": "Complete the series: 2, 6, 12, 20, 30, ?",
            "options": ["40", "42", "44", "46"],
            "correctAnswer": "42",
            "difficulty": "medium",
            "marks": 2,
            "section": "General Aptitude"
        },
        {
            "text": "If A is taller than B, and B is taller than C, then:",
            "options": ["A is taller than C", "C is taller than A", "A and C are equal", "Cannot be determined"],
            "correctAnswer": "A is taller than C",
            "difficulty": "easy",
            "marks": 1,
            "section": "General Aptitude"
        },
        {
            "text": "The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?",
            "options": ["24", "26", "28", "30"],
            "correctAnswer": "28",
            "difficulty": "medium",
            "marks": 2,
            "section": "General Aptitude"
        },
        {
            "text": "A train travels 60 km in 1 hour. How far will it travel in 2.5 hours at the same speed?",
            "options": ["120 km", "130 km", "140 km", "150 km"],
            "correctAnswer": "150 km",
            "difficulty": "easy",
            "marks": 1,
            "section": "General Aptitude"
        },
        {
            "text": "If 20% of x is 40, then x is:",
            "options": ["100", "150", "200", "250"],
            "correctAnswer": "200",
            "difficulty": "easy",
            "marks": 1,
            "section": "General Aptitude"
        },
        {
            "text": "The sum of three consecutive odd numbers is 63. What is the largest number?",
            "options": ["19", "21", "23", "25"],
            "correctAnswer": "23",
            "difficulty": "medium",
            "marks": 2,
            "section": "General Aptitude"
        },
        {
            "text": "In a certain code, COMPUTER is written as RFUVQNPC. How is SCIENCE written?",
            "options": ["TFDJDOC", "TFDJEOF", "TFDJODF", "RFDJDOC"],
            "correctAnswer": "TFDJODF",
            "difficulty": "hard",
            "marks": 2,
            "section": "General Aptitude"
        }
    ],
    
    "Engineering Mathematics": [
        {
            "text": "What is the derivative of x^3 + 2x^2 + 5?",
            "options": ["3x^2 + 4x", "3x^2 + 2x", "x^2 + 4x", "3x^2 + 4x + 5"],
            "correctAnswer": "3x^2 + 4x",
            "difficulty": "easy",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "The probability of getting a sum of 7 when two dice are thrown is:",
            "options": ["1/6", "1/12", "5/36", "7/36"],
            "correctAnswer": "1/6",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "What is the determinant of [[1,2],[3,4]]?",
            "options": ["-2", "-1", "1", "2"],
            "correctAnswer": "-2",
            "difficulty": "easy",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "The integral of 1/x dx is:",
            "options": ["ln|x| + C", "x^2/2 + C", "1/x^2 + C", "e^x + C"],
            "correctAnswer": "ln|x| + C",
            "difficulty": "easy",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "In a normal distribution, what percentage of data falls within 1 standard deviation?",
            "options": ["68%", "95%", "99.7%", "50%"],
            "correctAnswer": "68%",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "What is the rank of a 3x3 identity matrix?",
            "options": ["0", "1", "2", "3"],
            "correctAnswer": "3",
            "difficulty": "easy",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "The eigenvalues of [[2,0],[0,3]] are:",
            "options": ["2, 3", "0, 0", "1, 1", "2, 2"],
            "correctAnswer": "2, 3",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "What is lim(x→0) (sin x)/x?",
            "options": ["0", "1", "∞", "undefined"],
            "correctAnswer": "1",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "The number of edges in a complete graph with n vertices is:",
            "options": ["n", "n(n-1)", "n(n-1)/2", "2n"],
            "correctAnswer": "n(n-1)/2",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "What is the value of e^(iπ) + 1?",
            "options": ["-1", "0", "1", "2"],
            "correctAnswer": "0",
            "difficulty": "hard",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "The Laplace transform of e^(at) is:",
            "options": ["1/(s-a)", "1/(s+a)", "s/(s-a)", "a/(s-a)"],
            "correctAnswer": "1/(s-a)",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "What is the chromatic number of a complete graph K5?",
            "options": ["3", "4", "5", "6"],
            "correctAnswer": "5",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        },
        {
            "text": "The solution to dy/dx = y is:",
            "options": ["y = Ce^x", "y = Cx", "y = C/x", "y = C ln x"],
            "correctAnswer": "y = Ce^x",
            "difficulty": "medium",
            "marks": 1,
            "section": "Engineering Mathematics"
        }
    ],
    
    "Core Computer Science": [
        # Data Structures & Algorithms (12 questions)
        {
            "text": "What is the time complexity of binary search?",
            "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            "correctAnswer": "O(log n)",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "Algorithms"
        },
        {
            "text": "Which data structure is used for BFS traversal?",
            "options": ["Stack", "Queue", "Heap", "Tree"],
            "correctAnswer": "Queue",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "Data Structures"
        },
        {
            "text": "What is the worst case time complexity of Quick Sort?",
            "options": ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
            "correctAnswer": "O(n^2)",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Algorithms"
        },
        {
            "text": "In a max heap with n elements, what is the time to find minimum?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correctAnswer": "O(n)",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Data Structures"
        },
        {
            "text": "What is the space complexity of merge sort?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correctAnswer": "O(n)",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Algorithms"
        },
        {
            "text": "Which traversal of BST gives sorted order?",
            "options": ["Preorder", "Inorder", "Postorder", "Level order"],
            "correctAnswer": "Inorder",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "Data Structures"
        },
        {
            "text": "What is the time complexity of Dijkstra's algorithm using binary heap?",
            "options": ["O(V^2)", "O(E log V)", "O(V log V)", "O(E + V)"],
            "correctAnswer": "O(E log V)",
            "difficulty": "hard",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Algorithms"
        },
        {
            "text": "In a B-tree of order m, maximum children a node can have:",
            "options": ["m", "m-1", "m+1", "2m"],
            "correctAnswer": "m",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Data Structures"
        },
        {
            "text": "Which algorithm is used to find strongly connected components?",
            "options": ["Kruskal's", "Prim's", "Kosaraju's", "Dijkstra's"],
            "correctAnswer": "Kosaraju's",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Algorithms"
        },
        {
            "text": "What is the height of a complete binary tree with n nodes?",
            "options": ["log n", "n", "n/2", "sqrt(n)"],
            "correctAnswer": "log n",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Data Structures"
        },
        {
            "text": "Time complexity of Floyd-Warshall algorithm:",
            "options": ["O(V^2)", "O(V^3)", "O(E log V)", "O(VE)"],
            "correctAnswer": "O(V^3)",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Algorithms"
        },
        {
            "text": "Which data structure is best for LRU cache?",
            "options": ["Array", "Linked List", "Hash Map + Doubly Linked List", "Stack"],
            "correctAnswer": "Hash Map + Doubly Linked List",
            "difficulty": "hard",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Data Structures"
        },
        
        # Operating Systems (10 questions)
        {
            "text": "Which scheduling algorithm can cause starvation?",
            "options": ["FCFS", "Round Robin", "Priority Scheduling", "SJF"],
            "correctAnswer": "Priority Scheduling",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "What is the purpose of TLB?",
            "options": ["Store pages", "Cache page table entries", "Store segments", "Manage disk"],
            "correctAnswer": "Cache page table entries",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "Which page replacement algorithm suffers from Belady's anomaly?",
            "options": ["LRU", "FIFO", "Optimal", "LFU"],
            "correctAnswer": "FIFO",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "What is thrashing?",
            "options": ["High CPU utilization", "Excessive paging", "Deadlock", "Memory leak"],
            "correctAnswer": "Excessive paging",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "Which system call creates a new process?",
            "options": ["exec()", "fork()", "wait()", "exit()"],
            "correctAnswer": "fork()",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "Banker's algorithm is used for:",
            "options": ["Scheduling", "Deadlock avoidance", "Memory management", "File management"],
            "correctAnswer": "Deadlock avoidance",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "Which condition is NOT necessary for deadlock?",
            "options": ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
            "correctAnswer": "Preemption",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "What is internal fragmentation?",
            "options": ["Unused space in page", "Unused space between pages", "Unused space in memory", "Unused space in disk"],
            "correctAnswer": "Unused space in page",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "Which gives minimum average waiting time?",
            "options": ["FCFS", "SJF", "Round Robin", "Priority"],
            "correctAnswer": "SJF",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        {
            "text": "What is a race condition?",
            "options": ["Fast execution", "Multiple processes accessing shared data", "CPU scheduling", "Memory allocation"],
            "correctAnswer": "Multiple processes accessing shared data",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "Operating Systems"
        },
        
        # DBMS (8 questions)
        {
            "text": "Which normal form eliminates transitive dependencies?",
            "options": ["1NF", "2NF", "3NF", "BCNF"],
            "correctAnswer": "3NF",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        {
            "text": "What is a candidate key?",
            "options": ["Primary key", "Foreign key", "Minimal superkey", "Composite key"],
            "correctAnswer": "Minimal superkey",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        {
            "text": "Which SQL command removes a table?",
            "options": ["DELETE", "DROP", "REMOVE", "TRUNCATE"],
            "correctAnswer": "DROP",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        {
            "text": "Which isolation level has highest consistency?",
            "options": ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
            "correctAnswer": "Serializable",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        {
            "text": "Maximum superkeys for relation with n attributes:",
            "options": ["n", "2^n", "2^n - 1", "n!"],
            "correctAnswer": "2^n - 1",
            "difficulty": "hard",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        {
            "text": "What is a lossy decomposition?",
            "options": ["Loss of data", "Loss of attributes", "Cannot reconstruct original", "Loss of tuples"],
            "correctAnswer": "Cannot reconstruct original",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        {
            "text": "Which command modifies table structure?",
            "options": ["UPDATE", "MODIFY", "ALTER", "CHANGE"],
            "correctAnswer": "ALTER",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        {
            "text": "Purpose of indexing:",
            "options": ["Data security", "Faster retrieval", "Data integrity", "Data backup"],
            "correctAnswer": "Faster retrieval",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "DBMS"
        },
        
        # Computer Networks (6 questions)
        {
            "text": "Efficiency of pure ALOHA:",
            "options": ["18.4%", "36.8%", "50%", "100%"],
            "correctAnswer": "18.4%",
            "difficulty": "hard",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Computer Networks"
        },
        {
            "text": "Which layer does error detection?",
            "options": ["Physical", "Data Link", "Network", "Transport"],
            "correctAnswer": "Data Link",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Computer Networks"
        },
        {
            "text": "Subnet mask for /24 network:",
            "options": ["255.255.0.0", "255.255.255.0", "255.255.255.255", "255.0.0.0"],
            "correctAnswer": "255.255.255.0",
            "difficulty": "easy",
            "marks": 1,
            "section": "Core Computer Science",
            "topic": "Computer Networks"
        },
        {
            "text": "Purpose of NAT:",
            "options": ["Routing", "IP address translation", "Error detection", "Flow control"],
            "correctAnswer": "IP address translation",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Computer Networks"
        },
        {
            "text": "Which protocol uses sliding window?",
            "options": ["Stop and Wait", "Go-Back-N", "HTTP", "DNS"],
            "correctAnswer": "Go-Back-N",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Computer Networks"
        },
        {
            "text": "Purpose of ARP:",
            "options": ["IP to MAC mapping", "MAC to IP mapping", "Domain to IP mapping", "Port mapping"],
            "correctAnswer": "IP to MAC mapping",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Computer Networks"
        },
        
        # Theory of Computation (3 questions)
        {
            "text": "Which language is NOT context-free?",
            "options": ["a^n b^n", "a^n b^n c^n", "Palindromes", "Balanced parentheses"],
            "correctAnswer": "a^n b^n c^n",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Theory of Computation"
        },
        {
            "text": "Which problem is decidable?",
            "options": ["Halting problem", "Membership in CFG", "Equivalence of TM", "Emptiness of TM"],
            "correctAnswer": "Membership in CFG",
            "difficulty": "hard",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Theory of Computation"
        },
        {
            "text": "Pumping lemma constant for regular languages:",
            "options": ["Number of states", "Number of transitions", "Number of symbols", "Length of string"],
            "correctAnswer": "Number of states",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Theory of Computation"
        },
        
        # Compiler Design (2 questions)
        {
            "text": "Which parser is most powerful?",
            "options": ["LL(1)", "LR(0)", "LALR", "CLR"],
            "correctAnswer": "CLR",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Compiler Design"
        },
        {
            "text": "Purpose of semantic analysis:",
            "options": ["Syntax checking", "Type checking", "Code generation", "Optimization"],
            "correctAnswer": "Type checking",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Compiler Design"
        },
        
        # Digital Logic (1 question)
        {
            "text": "How many minterms for n variables?",
            "options": ["n", "2n", "2^n", "n^2"],
            "correctAnswer": "2^n",
            "difficulty": "medium",
            "marks": 2,
            "section": "Core Computer Science",
            "topic": "Digital Logic"
        }
    ]
}

def generate_gate_format_test():
    """Generate a GATE format test with 65 questions"""
    all_questions = []
    question_id = 1
    year = 2024
    
    # Add all questions with proper IDs
    for section, questions in gate_questions.items():
        for q in questions:
            question = {
                "id": f"GATE{year}_Q{question_id:02d}",
                "text": q["text"],
                "options": q["options"],
                "correctAnswer": q["correctAnswer"],
                "difficulty": q["difficulty"],
                "marks": q["marks"],
                "section": q["section"],
                "topic": q.get("topic", section),
                "year": year
            }
            all_questions.append(question)
            question_id += 1
    
    # Calculate totals
    ga_count = len([q for q in all_questions if q["section"] == "General Aptitude"])
    em_count = len([q for q in all_questions if q["section"] == "Engineering Mathematics"])
    cs_count = len([q for q in all_questions if q["section"] == "Core Computer Science"])
    
    total_marks = sum(q["marks"] for q in all_questions)
    
    data = {
        "metadata": {
            "totalQuestions": len(all_questions),
            "totalMarks": total_marks,
            "sections": {
                "General Aptitude": {"questions": ga_count, "marks": sum(q["marks"] for q in all_questions if q["section"] == "General Aptitude")},
                "Engineering Mathematics": {"questions": em_count, "marks": sum(q["marks"] for q in all_questions if q["section"] == "Engineering Mathematics")},
                "Core Computer Science": {"questions": cs_count, "marks": sum(q["marks"] for q in all_questions if q["section"] == "Core Computer Science")}
            },
            "format": "GATE CSE 2024",
            "duration": "180 minutes",
            "lastUpdated": "2024-11-29"
        },
        "questions": all_questions
    }
    
    with open('gate_format_complete.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Generated GATE format test with {len(all_questions)} questions")
    print(f"📊 Section Distribution:")
    print(f"   - General Aptitude: {ga_count} questions ({data['metadata']['sections']['General Aptitude']['marks']} marks)")
    print(f"   - Engineering Mathematics: {em_count} questions ({data['metadata']['sections']['Engineering Mathematics']['marks']} marks)")
    print(f"   - Core Computer Science: {cs_count} questions ({data['metadata']['sections']['Core Computer Science']['marks']} marks)")
    print(f"📝 Total Marks: {total_marks}")
    
    return data

if __name__ == "__main__":
    generate_gate_format_test()
