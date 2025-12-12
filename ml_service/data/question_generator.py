import json
import random

# Comprehensive GATE CSE Questions Database
questions_db = {
    "Algorithms": [
        {
            "text": "What is the time complexity of binary search?",
            "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            "correctAnswer": "O(log n)",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "Which sorting algorithm has the best average case time complexity?",
            "options": ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
            "correctAnswer": "Quick Sort",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is the time complexity of Dijkstra's algorithm using a binary heap?",
            "options": ["O(V^2)", "O(E log V)", "O(V log V)", "O(E + V)"],
            "correctAnswer": "O(E log V)",
            "difficulty": "hard",
            "marks": 2
        },
        {
            "text": "Which algorithm is used to find the shortest path in a graph with negative weights?",
            "options": ["Dijkstra", "Bellman-Ford", "Prim's", "Kruskal's"],
            "correctAnswer": "Bellman-Ford",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is the space complexity of merge sort?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correctAnswer": "O(n)",
            "difficulty": "medium",
            "marks": 1
        }
    ],
    "Data Structures": [
        {
            "text": "In a B-tree of order m, what is the maximum number of children a node can have?",
            "options": ["m", "m-1", "m+1", "2m"],
            "correctAnswer": "m",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is the worst-case time complexity of searching in a hash table?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
            "correctAnswer": "O(n)",
            "difficulty": "medium",
            "marks": 1
        },
        {
            "text": "Which data structure is used for BFS traversal?",
            "options": ["Stack", "Queue", "Heap", "Tree"],
            "correctAnswer": "Queue",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is the height of a complete binary tree with n nodes?",
            "options": ["log n", "n", "n/2", "sqrt(n)"],
            "correctAnswer": "log n",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which data structure is best for implementing LRU cache?",
            "options": ["Array", "Linked List", "Hash Map + Doubly Linked List", "Stack"],
            "correctAnswer": "Hash Map + Doubly Linked List",
            "difficulty": "hard",
            "marks": 2
        }
    ],
    "Operating Systems": [
        {
            "text": "Which scheduling algorithm can cause starvation?",
            "options": ["FCFS", "Round Robin", "Priority Scheduling", "SJF"],
            "correctAnswer": "Priority Scheduling",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is the purpose of a semaphore?",
            "options": ["Memory management", "Process synchronization", "File management", "I/O management"],
            "correctAnswer": "Process synchronization",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "Which page replacement algorithm suffers from Belady's anomaly?",
            "options": ["LRU", "FIFO", "Optimal", "LFU"],
            "correctAnswer": "FIFO",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is thrashing in operating systems?",
            "options": ["High CPU utilization", "Excessive paging", "Deadlock", "Memory leak"],
            "correctAnswer": "Excessive paging",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which system call is used to create a new process?",
            "options": ["exec()", "fork()", "wait()", "exit()"],
            "correctAnswer": "fork()",
            "difficulty": "easy",
            "marks": 1
        }
    ],
    "DBMS": [
        {
            "text": "Which normal form eliminates transitive dependencies?",
            "options": ["1NF", "2NF", "3NF", "BCNF"],
            "correctAnswer": "3NF",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is the purpose of indexing in databases?",
            "options": ["Data security", "Faster retrieval", "Data backup", "Data compression"],
            "correctAnswer": "Faster retrieval",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "Which isolation level prevents dirty reads?",
            "options": ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
            "correctAnswer": "Read Committed",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is a candidate key?",
            "options": ["Primary key", "Foreign key", "Minimal superkey", "Composite key"],
            "correctAnswer": "Minimal superkey",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which SQL command is used to remove a table?",
            "options": ["DELETE", "DROP", "REMOVE", "TRUNCATE"],
            "correctAnswer": "DROP",
            "difficulty": "easy",
            "marks": 1
        }
    ],
    "Computer Networks": [
        {
            "text": "What is the purpose of the Transport Layer in the OSI model?",
            "options": ["Routing", "End-to-end communication", "Physical transmission", "Data encryption"],
            "correctAnswer": "End-to-end communication",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "Which protocol is used for email transmission?",
            "options": ["HTTP", "FTP", "SMTP", "DNS"],
            "correctAnswer": "SMTP",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is the maximum size of an IPv4 packet?",
            "options": ["1500 bytes", "65535 bytes", "1024 bytes", "4096 bytes"],
            "correctAnswer": "65535 bytes",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which routing algorithm is used by OSPF?",
            "options": ["Distance Vector", "Link State", "Path Vector", "Hybrid"],
            "correctAnswer": "Link State",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is the purpose of ARP?",
            "options": ["IP to MAC mapping", "MAC to IP mapping", "Domain to IP mapping", "Port mapping"],
            "correctAnswer": "IP to MAC mapping",
            "difficulty": "medium",
            "marks": 2
        }
    ],
    "Theory of Computation": [
        {
            "text": "Which language is accepted by a finite automaton?",
            "options": ["Regular", "Context-free", "Context-sensitive", "Recursive"],
            "correctAnswer": "Regular",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is the pumping lemma used for?",
            "options": ["Proving regularity", "Proving non-regularity", "Parsing", "Optimization"],
            "correctAnswer": "Proving non-regularity",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which problem is undecidable?",
            "options": ["Halting problem", "Sorting", "Searching", "Graph traversal"],
            "correctAnswer": "Halting problem",
            "difficulty": "hard",
            "marks": 2
        },
        {
            "text": "What is the closure property of regular languages?",
            "options": ["Union only", "Intersection only", "Union, intersection, complement", "None"],
            "correctAnswer": "Union, intersection, complement",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which automaton is more powerful than DFA?",
            "options": ["NFA", "PDA", "Both are equal", "None"],
            "correctAnswer": "PDA",
            "difficulty": "medium",
            "marks": 2
        }
    ],
    "Programming": [
        {
            "text": "What is the output of: print(2 ** 3 ** 2)?",
            "options": ["64", "512", "256", "128"],
            "correctAnswer": "512",
            "difficulty": "medium",
            "marks": 1
        },
        {
            "text": "Which keyword is used for exception handling in Python?",
            "options": ["catch", "except", "error", "handle"],
            "correctAnswer": "except",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is the time complexity of list.append() in Python?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            "correctAnswer": "O(1)",
            "difficulty": "medium",
            "marks": 1
        },
        {
            "text": "Which data structure is used to implement recursion?",
            "options": ["Queue", "Stack", "Heap", "Tree"],
            "correctAnswer": "Stack",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is a lambda function?",
            "options": ["Named function", "Anonymous function", "Recursive function", "Generator function"],
            "correctAnswer": "Anonymous function",
            "difficulty": "easy",
            "marks": 1
        }
    ],
    "Digital Logic": [
        {
            "text": "How many input combinations are possible for a 3-input logic gate?",
            "options": ["3", "6", "8", "9"],
            "correctAnswer": "8",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "Which gate is a universal gate?",
            "options": ["AND", "OR", "NAND", "XOR"],
            "correctAnswer": "NAND",
            "difficulty": "medium",
            "marks": 1
        },
        {
            "text": "What is a flip-flop?",
            "options": ["Combinational circuit", "Sequential circuit", "Logic gate", "Multiplexer"],
            "correctAnswer": "Sequential circuit",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "Which number system uses base 16?",
            "options": ["Binary", "Octal", "Decimal", "Hexadecimal"],
            "correctAnswer": "Hexadecimal",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is the purpose of a multiplexer?",
            "options": ["Data selection", "Data storage", "Data transmission", "Data encryption"],
            "correctAnswer": "Data selection",
            "difficulty": "medium",
            "marks": 2
        }
    ],
    "Computer Organization": [
        {
            "text": "What is the purpose of cache memory?",
            "options": ["Permanent storage", "Faster access", "Backup", "Virtual memory"],
            "correctAnswer": "Faster access",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "Which addressing mode uses a register to store the address?",
            "options": ["Immediate", "Direct", "Indirect", "Register"],
            "correctAnswer": "Indirect",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is pipelining in CPU?",
            "options": ["Parallel execution", "Sequential execution", "Overlapped execution", "Random execution"],
            "correctAnswer": "Overlapped execution",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which memory is volatile?",
            "options": ["ROM", "RAM", "Hard Disk", "SSD"],
            "correctAnswer": "RAM",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is the purpose of ALU?",
            "options": ["Storage", "Arithmetic and logic operations", "Control", "I/O"],
            "correctAnswer": "Arithmetic and logic operations",
            "difficulty": "easy",
            "marks": 1
        }
    ],
    "Discrete Mathematics": [
        {
            "text": "What is the cardinality of power set of a set with n elements?",
            "options": ["n", "2n", "2^n", "n^2"],
            "correctAnswer": "2^n",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which graph has an Eulerian path?",
            "options": ["All vertices even degree", "Exactly 2 odd degree vertices", "All vertices odd degree", "No edges"],
            "correctAnswer": "Exactly 2 odd degree vertices",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is the chromatic number of a complete graph with n vertices?",
            "options": ["1", "2", "n-1", "n"],
            "correctAnswer": "n",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which relation is both reflexive and symmetric but not transitive?",
            "options": ["Equivalence", "Partial order", "None", "Depends on set"],
            "correctAnswer": "Depends on set",
            "difficulty": "hard",
            "marks": 2
        },
        {
            "text": "What is the number of spanning trees in a complete graph with n vertices?",
            "options": ["n", "n^2", "n^(n-2)", "2^n"],
            "correctAnswer": "n^(n-2)",
            "difficulty": "hard",
            "marks": 2
        }
    ],
    "Compiler Design": [
        {
            "text": "Which phase of compiler performs syntax analysis?",
            "options": ["Lexical", "Parser", "Semantic", "Code generation"],
            "correctAnswer": "Parser",
            "difficulty": "easy",
            "marks": 1
        },
        {
            "text": "What is the purpose of a symbol table?",
            "options": ["Store keywords", "Store identifiers", "Store operators", "Store literals"],
            "correctAnswer": "Store identifiers",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which grammar is used by LR parsers?",
            "options": ["LL", "LR", "LALR", "All of these"],
            "correctAnswer": "All of these",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "What is left recursion?",
            "options": ["A -> Aa", "A -> aA", "A -> a", "A -> AA"],
            "correctAnswer": "A -> Aa",
            "difficulty": "medium",
            "marks": 2
        },
        {
            "text": "Which optimization is performed in the code generation phase?",
            "options": ["Constant folding", "Dead code elimination", "Register allocation", "Loop unrolling"],
            "correctAnswer": "Register allocation",
            "difficulty": "hard",
            "marks": 2
        }
    ]
}

def generate_questions_json():
    all_questions = []
    question_id = 1
    years = [2019, 2020, 2021, 2022, 2023, 2024]
    
    for subject, questions in questions_db.items():
        for q in questions:
            question = {
                "id": f"Q{question_id:03d}",
                "text": q["text"],
                "options": q["options"],
                "correctAnswer": q["correctAnswer"],
                "topic": subject,
                "subject": subject,
                "difficulty": q["difficulty"],
                "year": random.choice(years),
                "marks": q["marks"]
            }
            all_questions.append(question)
            question_id += 1
    
    data = {
        "metadata": {
            "totalQuestions": len(all_questions),
            "subjects": list(questions_db.keys()),
            "years": years,
            "lastUpdated": "2024-11-29"
        },
        "questions": all_questions
    }
    
    with open('gate_questions_complete.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Generated {len(all_questions)} questions across {len(questions_db)} subjects")
    return data

if __name__ == "__main__":
    generate_questions_json()
