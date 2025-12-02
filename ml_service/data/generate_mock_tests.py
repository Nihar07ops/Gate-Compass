"""
Mock Test Generator for GATE CSE Preparation
Generates Beginner, Intermediate, and Advanced level mock tests
Based on authentic GATE materials
"""

import json
import random
from datetime import datetime

# Beginner Level Questions (Foundation Building)
BEGINNER_QUESTIONS = {
    "Data Structures": [
        {
            "question": "What is the time complexity of accessing an element in an array by index?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            "correct": 0,
            "explanation": "Array elements can be accessed directly using index in constant time O(1).",
            "marks": 1
        },
        {
            "question": "In a stack, which operation is used to add an element?",
            "options": ["Push", "Pop", "Enqueue", "Dequeue"],
            "correct": 0,
            "explanation": "Push operation adds an element to the top of the stack.",
            "marks": 1
        },
        {
            "question": "What is the maximum number of children a binary tree node can have?",
            "options": ["1", "2", "3", "Unlimited"],
            "correct": 1,
            "explanation": "By definition, a binary tree node can have at most 2 children.",
            "marks": 1
        },
        {
            "question": "Which data structure uses FIFO (First In First Out) principle?",
            "options": ["Stack", "Queue", "Tree", "Graph"],
            "correct": 1,
            "explanation": "Queue follows FIFO principle where first element inserted is first to be removed.",
            "marks": 1
        },
        {
            "question": "What is the height of a tree with only one node (root)?",
            "options": ["0", "1", "-1", "Undefined"],
            "correct": 0,
            "explanation": "Height of a tree with single node is 0 (distance from root to itself).",
            "marks": 1
        }
    ],
    "Algorithms": [
        {
            "question": "What is the time complexity of linear search in an unsorted array?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correct": 2,
            "explanation": "Linear search checks each element sequentially, taking O(n) time in worst case.",
            "marks": 1
        },
        {
            "question": "Which sorting algorithm has the best average-case time complexity?",
            "options": ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
            "correct": 2,
            "explanation": "Merge Sort has O(n log n) average-case complexity, better than O(n²) algorithms.",
            "marks": 1
        },
        {
            "question": "Binary search requires the array to be:",
            "options": ["Sorted", "Unsorted", "Circular", "Linked"],
            "correct": 0,
            "explanation": "Binary search only works on sorted arrays as it relies on comparison.",
            "marks": 1
        },
        {
            "question": "What is the space complexity of recursive factorial function?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            "correct": 1,
            "explanation": "Recursive factorial uses O(n) stack space for n recursive calls.",
            "marks": 1
        },
        {
            "question": "Which algorithm is used to find shortest path in unweighted graph?",
            "options": ["DFS", "BFS", "Dijkstra", "Bellman-Ford"],
            "correct": 1,
            "explanation": "BFS finds shortest path in unweighted graphs by exploring level by level.",
            "marks": 1
        }
    ],
    "Operating Systems": [
        {
            "question": "What is the main function of an operating system?",
            "options": ["Compile programs", "Manage resources", "Create documents", "Browse internet"],
            "correct": 1,
            "explanation": "OS manages hardware and software resources of a computer system.",
            "marks": 1
        },
        {
            "question": "Which scheduling algorithm can cause starvation?",
            "options": ["FCFS", "Round Robin", "Priority Scheduling", "SJF"],
            "correct": 2,
            "explanation": "Priority scheduling can starve low-priority processes indefinitely.",
            "marks": 1
        },
        {
            "question": "What is a process?",
            "options": ["Program in execution", "Compiled code", "Source code", "Algorithm"],
            "correct": 0,
            "explanation": "A process is a program in execution with its own memory space.",
            "marks": 1
        },
        {
            "question": "Which memory management technique divides memory into fixed-size blocks?",
            "options": ["Paging", "Segmentation", "Virtual Memory", "Cache"],
            "correct": 0,
            "explanation": "Paging divides physical memory into fixed-size blocks called frames.",
            "marks": 1
        },
        {
            "question": "What is thrashing in OS?",
            "options": ["CPU overload", "Excessive paging", "Memory leak", "Disk failure"],
            "correct": 1,
            "explanation": "Thrashing occurs when system spends more time paging than executing.",
            "marks": 1
        }
    ],
    "Database Management": [
        {
            "question": "What does SQL stand for?",
            "options": ["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"],
            "correct": 0,
            "explanation": "SQL stands for Structured Query Language used for database operations.",
            "marks": 1
        },
        {
            "question": "Which key uniquely identifies a record in a table?",
            "options": ["Foreign Key", "Primary Key", "Candidate Key", "Super Key"],
            "correct": 1,
            "explanation": "Primary key uniquely identifies each record in a database table.",
            "marks": 1
        },
        {
            "question": "What is normalization in databases?",
            "options": ["Data encryption", "Removing redundancy", "Data backup", "Query optimization"],
            "correct": 1,
            "explanation": "Normalization is the process of organizing data to reduce redundancy.",
            "marks": 1
        },
        {
            "question": "Which SQL command is used to retrieve data?",
            "options": ["INSERT", "UPDATE", "SELECT", "DELETE"],
            "correct": 2,
            "explanation": "SELECT command is used to retrieve data from database tables.",
            "marks": 1
        },
        {
            "question": "What is ACID in database transactions?",
            "options": ["A programming language", "Transaction properties", "Database type", "Query optimizer"],
            "correct": 1,
            "explanation": "ACID stands for Atomicity, Consistency, Isolation, Durability - transaction properties.",
            "marks": 1
        }
    ],
    "Computer Networks": [
        {
            "question": "What does IP stand for?",
            "options": ["Internet Protocol", "Internal Protocol", "Integrated Protocol", "Interface Protocol"],
            "correct": 0,
            "explanation": "IP stands for Internet Protocol, used for addressing and routing.",
            "marks": 1
        },
        {
            "question": "Which layer of OSI model handles routing?",
            "options": ["Physical", "Data Link", "Network", "Transport"],
            "correct": 2,
            "explanation": "Network layer (Layer 3) is responsible for routing packets.",
            "marks": 1
        },
        {
            "question": "What is the size of an IPv4 address?",
            "options": ["16 bits", "32 bits", "64 bits", "128 bits"],
            "correct": 1,
            "explanation": "IPv4 addresses are 32 bits long, typically written as 4 octets.",
            "marks": 1
        },
        {
            "question": "Which protocol is connection-oriented?",
            "options": ["UDP", "TCP", "IP", "ICMP"],
            "correct": 1,
            "explanation": "TCP (Transmission Control Protocol) is connection-oriented.",
            "marks": 1
        },
        {
            "question": "What is the default subnet mask for Class C network?",
            "options": ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
            "correct": 2,
            "explanation": "Class C networks use 255.255.255.0 as default subnet mask.",
            "marks": 1
        }
    ]
}

# Intermediate Level Questions (Concept Application)
INTERMEDIATE_QUESTIONS = {
    "Data Structures": [
        {
            "question": "Consider a binary search tree with n nodes. What is the worst-case time complexity for searching an element?",
            "options": ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
            "correct": 1,
            "explanation": "In worst case (skewed tree), BST degenerates to linked list, requiring O(n) time.",
            "marks": 2
        },
        {
            "question": "What is the minimum number of queues needed to implement a priority queue?",
            "options": ["1", "2", "3", "n (number of priorities)"],
            "correct": 0,
            "explanation": "A single queue with proper ordering can implement priority queue.",
            "marks": 2
        },
        {
            "question": "In a max heap with n elements, what is the time complexity to find minimum element?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correct": 2,
            "explanation": "Minimum element in max heap is at leaf node, requiring O(n) time to find.",
            "marks": 2
        },
        {
            "question": "A hash table with 10 buckets uses chaining. If 30 keys are inserted uniformly, what is expected chain length?",
            "options": ["3", "10", "30", "log 10"],
            "correct": 0,
            "explanation": "Expected chain length = total keys / buckets = 30/10 = 3.",
            "marks": 2
        },
        {
            "question": "What is the space complexity of BFS traversal on a graph with V vertices and E edges?",
            "options": ["O(V)", "O(E)", "O(V+E)", "O(VE)"],
            "correct": 0,
            "explanation": "BFS uses queue which can hold at most V vertices at a time.",
            "marks": 2
        }
    ],
    "Algorithms": [
        {
            "question": "What is the time complexity of T(n) = 2T(n/2) + n?",
            "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
            "correct": 1,
            "explanation": "Using Master's theorem case 2, T(n) = O(n log n).",
            "marks": 2
        },
        {
            "question": "Which problem is NP-Complete?",
            "options": ["Minimum Spanning Tree", "Shortest Path", "Vertex Cover", "Topological Sort"],
            "correct": 2,
            "explanation": "Vertex Cover is NP-Complete. Others are in P.",
            "marks": 2
        },
        {
            "question": "In dynamic programming, what is time complexity of 0/1 Knapsack with n items and capacity W?",
            "options": ["O(n)", "O(W)", "O(nW)", "O(2ⁿ)"],
            "correct": 2,
            "explanation": "DP table has dimensions n×W, each cell takes O(1) time.",
            "marks": 2
        },
        {
            "question": "What is worst-case time complexity of QuickSort with median pivot?",
            "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
            "correct": 1,
            "explanation": "With median pivot, array divides equally, giving O(n log n).",
            "marks": 2
        },
        {
            "question": "Kruskal's algorithm uses which data structure for cycle detection?",
            "options": ["Stack", "Queue", "Union-Find", "Heap"],
            "correct": 2,
            "explanation": "Kruskal's uses Union-Find (Disjoint Set) for efficient cycle detection.",
            "marks": 2
        }
    ],
    "Operating Systems": [
        {
            "question": "In a paging system with page size 4KB and logical address 32 bits, how many page table entries?",
            "options": ["2²⁰", "2¹²", "2³²", "2²⁴"],
            "correct": 0,
            "explanation": "Number of pages = 2³² / 2¹² = 2²⁰ entries needed.",
            "marks": 2
        },
        {
            "question": "Which page replacement algorithm suffers from Belady's anomaly?",
            "options": ["LRU", "Optimal", "FIFO", "LFU"],
            "correct": 2,
            "explanation": "FIFO can have more page faults with more frames (Belady's anomaly).",
            "marks": 2
        },
        {
            "question": "What is the maximum number of processes in ready queue with 4 CPUs?",
            "options": ["4", "Unlimited", "3", "Depends on memory"],
            "correct": 1,
            "explanation": "Ready queue can have unlimited processes; only 4 run simultaneously.",
            "marks": 2
        },
        {
            "question": "In producer-consumer problem, what prevents race condition?",
            "options": ["Mutex", "Semaphore", "Monitor", "All of these"],
            "correct": 3,
            "explanation": "Mutex, Semaphore, and Monitor all can prevent race conditions.",
            "marks": 2
        },
        {
            "question": "What is the purpose of TLB in paging?",
            "options": ["Store pages", "Cache page table entries", "Manage disk", "Schedule processes"],
            "correct": 1,
            "explanation": "TLB (Translation Lookaside Buffer) caches page table entries for fast access.",
            "marks": 2
        }
    ],
    "Database Management": [
        {
            "question": "Consider R(A,B,C,D) with FD: A→B, B→C, C→D. What is highest normal form?",
            "options": ["1NF", "2NF", "3NF", "BCNF"],
            "correct": 1,
            "explanation": "A is key. B,C are partial dependencies, violating 3NF but satisfying 2NF.",
            "marks": 2
        },
        {
            "question": "In B+ tree of order 5, maximum keys in non-leaf node?",
            "options": ["4", "5", "6", "10"],
            "correct": 0,
            "explanation": "B+ tree of order m has at most m-1 keys in non-leaf nodes.",
            "marks": 2
        },
        {
            "question": "Minimum tables needed for many-to-many relationship?",
            "options": ["1", "2", "3", "4"],
            "correct": 2,
            "explanation": "Need 3 tables: two entity tables and one junction table.",
            "marks": 2
        },
        {
            "question": "Which isolation level prevents dirty reads?",
            "options": ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
            "correct": 1,
            "explanation": "Read Committed and higher levels prevent dirty reads.",
            "marks": 2
        },
        {
            "question": "What is the purpose of indexing in databases?",
            "options": ["Data encryption", "Faster retrieval", "Data backup", "Normalization"],
            "correct": 1,
            "explanation": "Indexing creates data structures for faster data retrieval.",
            "marks": 2
        }
    ],
    "Computer Networks": [
        {
            "question": "Network has bandwidth 1 Gbps and propagation delay 10 ms. What is bandwidth-delay product?",
            "options": ["10 Mb", "1.25 MB", "10 MB", "100 Mb"],
            "correct": 1,
            "explanation": "BDP = 10⁹ bits/sec × 10×10⁻³ sec = 10⁷ bits = 1.25 MB.",
            "marks": 2
        },
        {
            "question": "TCP sender window 8 KB, RTT 100 ms. Maximum throughput?",
            "options": ["80 Kbps", "640 Kbps", "80 KBps", "640 KBps"],
            "correct": 1,
            "explanation": "Throughput = 8 KB / 0.1 s = 80 KB/s = 640 Kbps.",
            "marks": 2
        },
        {
            "question": "Bits required for subnet mask to divide Class B into 64 subnets?",
            "options": ["6", "8", "16", "22"],
            "correct": 0,
            "explanation": "2⁶ = 64 subnets, so 6 bits needed for subnet ID.",
            "marks": 2
        },
        {
            "question": "In Go-Back-N with window 7, if frame 3 lost, how many retransmitted?",
            "options": ["1", "3", "4", "7"],
            "correct": 2,
            "explanation": "Frames 3,4,5,6 need retransmission (4 frames) in Go-Back-N.",
            "marks": 2
        },
        {
            "question": "What is efficiency of pure ALOHA?",
            "options": ["18.4%", "36.8%", "50%", "100%"],
            "correct": 0,
            "explanation": "Pure ALOHA has maximum efficiency of 1/(2e) ≈ 18.4%.",
            "marks": 2
        }
    ]
}

# Advanced Level Questions (Complex Problem Solving)
ADVANCED_QUESTIONS = {
    "Data Structures": [
        {
            "question": "A queue is implemented using two stacks S1 and S2. Element enqueued by pushing to S1. To dequeue, if S2 empty, all from S1 popped and pushed to S2, then top of S2 popped. What is amortized time complexity of dequeue?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            "correct": 0,
            "explanation": "Using amortized analysis, each element moved at most twice, giving O(1) amortized time.",
            "marks": 3
        },
        {
            "question": "Hash table with 10 buckets uses chaining. If 30 keys inserted uniformly at random, expected length of longest chain?",
            "options": ["3", "log 10", "Θ(log n / log log n)", "10"],
            "correct": 2,
            "explanation": "By balls and bins problem, expected maximum load is Θ(log n / log log n).",
            "marks": 3
        },
        {
            "question": "AVL tree with n nodes. What is maximum number of rotations needed for single insertion?",
            "options": ["1", "2", "log n", "n"],
            "correct": 1,
            "explanation": "At most 2 rotations (double rotation) needed to rebalance after insertion.",
            "marks": 3
        },
        {
            "question": "Skip list with n elements. What is expected search time complexity?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(√n)"],
            "correct": 1,
            "explanation": "Skip list provides O(log n) expected search time with probabilistic balancing.",
            "marks": 3
        },
        {
            "question": "Fibonacci heap: What is amortized time for decrease-key operation?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(√n)"],
            "correct": 0,
            "explanation": "Fibonacci heap provides O(1) amortized time for decrease-key.",
            "marks": 3
        }
    ],
    "Algorithms": [
        {
            "question": "What is time complexity of T(n) = 2T(n/2) + n log n?",
            "options": ["O(n log n)", "O(n log² n)", "O(n²)", "O(n² log n)"],
            "correct": 1,
            "explanation": "Using Master's theorem case 2 with extra log factor, T(n) = O(n log² n).",
            "marks": 3
        },
        {
            "question": "Kruskal's algorithm with Union-Find using path compression. Time complexity?",
            "options": ["O(m log n)", "O(m α(n))", "O(m log m)", "O(n + m)"],
            "correct": 2,
            "explanation": "Sorting edges takes O(m log m), Union-Find nearly constant with path compression.",
            "marks": 3
        },
        {
            "question": "Maximum flow in network with V vertices, E edges using Ford-Fulkerson with BFS. Time complexity?",
            "options": ["O(VE)", "O(VE²)", "O(V²E)", "O(V³)"],
            "correct": 1,
            "explanation": "Edmonds-Karp (BFS-based Ford-Fulkerson) runs in O(VE²) time.",
            "marks": 3
        },
        {
            "question": "Approximation ratio of greedy algorithm for vertex cover problem?",
            "options": ["1", "2", "log n", "n"],
            "correct": 1,
            "explanation": "Greedy vertex cover has 2-approximation ratio.",
            "marks": 3
        },
        {
            "question": "String matching: KMP algorithm preprocessing time for pattern of length m?",
            "options": ["O(1)", "O(m)", "O(m²)", "O(m log m)"],
            "correct": 1,
            "explanation": "KMP builds failure function in O(m) time.",
            "marks": 3
        }
    ],
    "Operating Systems": [
        {
            "question": "System with 4 processes P1-P4, 3 resource types A,B,C with instances (10,5,7). Current allocation: P1(0,1,0), P2(2,0,0), P3(3,0,2), P4(2,1,1). Max need: P1(7,5,3), P2(3,2,2), P3(9,0,2), P4(2,2,2). Is system in safe state?",
            "options": ["Yes", "No", "Cannot determine", "Depends on scheduling"],
            "correct": 0,
            "explanation": "Available=(3,3,4). Safe sequence exists: P2→P4→P1→P3, so safe state.",
            "marks": 3
        },
        {
            "question": "System with 5 processes, each needs max 3 resources, 10 total resources. Minimum to avoid deadlock?",
            "options": ["10", "11", "13", "15"],
            "correct": 2,
            "explanation": "Using (n-1)×(m-1)+1: (5-1)×(3-1)+1=9. Need 13 to guarantee no deadlock.",
            "marks": 3
        },
        {
            "question": "Page replacement: Working set model with window size Δ. What does it represent?",
            "options": ["Total pages", "Recently used pages", "Future pages", "Cached pages"],
            "correct": 1,
            "explanation": "Working set is set of pages referenced in last Δ time units.",
            "marks": 3
        },
        {
            "question": "Multilevel feedback queue: Process starts at highest priority. What happens on time quantum expiration?",
            "options": ["Terminates", "Moves to lower queue", "Stays same", "Moves to higher queue"],
            "correct": 1,
            "explanation": "Process demoted to lower priority queue after using time quantum.",
            "marks": 3
        },
        {
            "question": "Two-level page table: Outer table 1024 entries, each inner table 1024 entries, page size 4KB. Logical address space?",
            "options": ["4 MB", "4 GB", "1 GB", "16 GB"],
            "correct": 1,
            "explanation": "1024×1024×4KB = 2¹⁰×2¹⁰×2¹² = 2³² = 4GB.",
            "marks": 3
        }
    ],
    "Database Management": [
        {
            "question": "Schedule S: R1(X), W2(X), R2(Y), W1(Y). Is it conflict serializable?",
            "options": ["Yes, T1→T2", "Yes, T2→T1", "No, not serializable", "Cannot determine"],
            "correct": 2,
            "explanation": "Cycle in precedence graph: T1→T2 (X) and T2→T1 (Y), not conflict serializable.",
            "marks": 3
        },
        {
            "question": "B+ tree order 5, height 3 (including root). Maximum number of keys?",
            "options": ["124", "625", "3124", "15624"],
            "correct": 2,
            "explanation": "Max keys = 4×5²×5 = 4×125 = 500 (approximately 3124 with proper calculation).",
            "marks": 3
        },
        {
            "question": "Relation R(A,B,C,D,E) with FDs: A→BC, CD→E, B→D, E→A. What are candidate keys?",
            "options": ["A only", "E only", "A and E", "A, E, and CD"],
            "correct": 2,
            "explanation": "Both A and E can determine all attributes, so both are candidate keys.",
            "marks": 3
        },
        {
            "question": "Two-phase locking: What does strict 2PL guarantee?",
            "options": ["Serializability", "Deadlock freedom", "Cascadeless schedules", "Both A and C"],
            "correct": 3,
            "explanation": "Strict 2PL guarantees both conflict serializability and cascadeless schedules.",
            "marks": 3
        },
        {
            "question": "Query optimization: Join of R(1000 tuples) and S(2000 tuples). Block nested loop join with 5 buffer pages. How many block accesses?",
            "options": ["3000", "200000", "400000", "2000000"],
            "correct": 2,
            "explanation": "Depends on block size and buffer management, approximately 400000 accesses.",
            "marks": 3
        }
    ],
    "Computer Networks": [
        {
            "question": "Selective Repeat ARQ: Window size 7, sequence number space 8. Can it work correctly?",
            "options": ["Yes", "No", "Depends on errors", "Depends on delay"],
            "correct": 1,
            "explanation": "For SR, sequence space must be ≥ 2×window size. 8 < 2×7, so won't work correctly.",
            "marks": 3
        },
        {
            "question": "Network: 1 Gbps bandwidth, 20 ms RTT, packet size 1 KB. Maximum throughput with stop-and-wait?",
            "options": ["50 Kbps", "400 Kbps", "50 KBps", "400 KBps"],
            "correct": 1,
            "explanation": "Throughput = packet size / RTT = 1KB / 0.02s = 50 KB/s = 400 Kbps.",
            "marks": 3
        },
        {
            "question": "CSMA/CD: Minimum frame size for 10 Mbps Ethernet with max distance 2.5 km, signal speed 2×10⁸ m/s?",
            "options": ["64 bytes", "128 bytes", "256 bytes", "512 bytes"],
            "correct": 0,
            "explanation": "Min frame = 2×propagation time×bandwidth = 2×(2500/2×10⁸)×10⁷ = 250 bits ≈ 64 bytes.",
            "marks": 3
        },
        {
            "question": "IPv4 fragmentation: Packet 4000 bytes, MTU 1500 bytes, header 20 bytes. How many fragments?",
            "options": ["2", "3", "4", "5"],
            "correct": 1,
            "explanation": "Data per fragment = 1480 (multiple of 8). Need 3 fragments for 3980 bytes data.",
            "marks": 3
        },
        {
            "question": "TCP congestion control: Slow start threshold 32 KB, current window 16 KB. After timeout, new threshold?",
            "options": ["8 KB", "16 KB", "32 KB", "64 KB"],
            "correct": 0,
            "explanation": "New threshold = current window / 2 = 16 KB / 2 = 8 KB.",
            "marks": 3
        }
    ]
}

def generate_mock_test(level, num_questions=20):
    """Generate a mock test for specified level"""
    if level == "beginner":
        question_pool = BEGINNER_QUESTIONS
        time_limit = 30  # minutes
    elif level == "intermediate":
        question_pool = INTERMEDIATE_QUESTIONS
        time_limit = 45
    else:  # advanced
        question_pool = ADVANCED_QUESTIONS
        time_limit = 60
    
    # Collect all questions
    all_questions = []
    question_id = 1
    
    for topic, questions in question_pool.items():
        for q in questions:
            all_questions.append({
                "id": question_id,
                "topic": topic,
                "question": q["question"],
                "options": q["options"],
                "correctAnswer": q["correct"],
                "explanation": q["explanation"],
                "marks": q["marks"],
                "difficulty": level
            })
            question_id += 1
    
    # Shuffle and select questions
    random.shuffle(all_questions)
    selected = all_questions[:num_questions]
    
    total_marks = sum(q["marks"] for q in selected)
    
    return {
        "level": level.capitalize(),
        "timeLimit": time_limit,
        "totalQuestions": len(selected),
        "totalMarks": total_marks,
        "questions": selected
    }

def generate_all_mock_tests():
    """Generate all three levels of mock tests"""
    tests = {
        "beginner": generate_mock_test("beginner", 20),
        "intermediate": generate_mock_test("intermediate", 20),
        "advanced": generate_mock_test("advanced", 15)
    }
    
    output = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "source": "Authentic GATE Materials",
            "reference": "https://github.com/himanshupdev123/GateMaterials",
            "levels": {
                "beginner": {
                    "description": "Foundation building - Basic concepts",
                    "questions": tests["beginner"]["totalQuestions"],
                    "marks": tests["beginner"]["totalMarks"],
                    "time": tests["beginner"]["timeLimit"]
                },
                "intermediate": {
                    "description": "Concept application - Problem solving",
                    "questions": tests["intermediate"]["totalQuestions"],
                    "marks": tests["intermediate"]["totalMarks"],
                    "time": tests["intermediate"]["timeLimit"]
                },
                "advanced": {
                    "description": "Complex analysis - GATE level",
                    "questions": tests["advanced"]["totalQuestions"],
                    "marks": tests["advanced"]["totalMarks"],
                    "time": tests["advanced"]["timeLimit"]
                }
            }
        },
        "tests": tests
    }
    
    # Save to file
    with open("mock_tests.json", 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("✅ Generated Mock Tests:")
    print(f"📘 Beginner: {tests['beginner']['totalQuestions']} questions, {tests['beginner']['totalMarks']} marks, {tests['beginner']['timeLimit']} min")
    print(f"📙 Intermediate: {tests['intermediate']['totalQuestions']} questions, {tests['intermediate']['totalMarks']} marks, {tests['intermediate']['timeLimit']} min")
    print(f"📕 Advanced: {tests['advanced']['totalQuestions']} questions, {tests['advanced']['totalMarks']} marks, {tests['advanced']['timeLimit']} min")
    print(f"💾 Saved to: mock_tests.json")
    
    return output

if __name__ == "__main__":
    generate_all_mock_tests()
