#!/usr/bin/env python3
"""
Generate 300+ GATE CSE Questions
Complete question bank across all subjects
"""
import json
import random

def main():
    questions = []
    qid = 1
    
    print("="*60)
    print("GATE CSE Question Generator - 300+ Questions")
    print("="*60)
    
    # Operating Systems - 30 questions
    print("\n📚 Generating Operating Systems questions...")
    os_data = [
        ("What is the purpose of TLB?", ["Cache memory", "Speed up address translation", "Store page tables", "Manage processes"], "Speed up address translation", "TLB caches virtual-to-physical translations", "medium"),
        ("Which page replacement is optimal?", ["FIFO", "LRU", "Optimal", "LFU"], "Optimal", "Optimal replaces page not used for longest time in future", "easy"),
        ("Max processes in deadlock with 3 resources?", ["2", "3", "4", "Unlimited"], "3", "Max processes = number of resources", "medium"),
        ("Which scheduling causes starvation?", ["FCFS", "Round Robin", "Priority", "SJF"], "Priority", "Low priority may never execute", "medium"),
        ("Critical section ensures?", ["Deadlock", "Race condition", "Mutual exclusion", "Starvation"], "Mutual exclusion", "Critical section ensures mutual exclusion", "easy"),
        ("Fastest IPC mechanism?", ["Pipes", "Message Queue", "Shared Memory", "Sockets"], "Shared Memory", "Shared memory avoids kernel copying", "medium"),
        ("Banker algorithm for?", ["Scheduling", "Deadlock avoidance", "Memory allocation", "File management"], "Deadlock avoidance", "Prevents deadlock", "medium"),
        ("Round Robin uses?", ["Fixed time slice", "Variable time", "Priority based", "Random"], "Fixed time slice", "RR uses fixed quantum", "easy"),
        ("External fragmentation in?", ["Paging", "Segmentation", "Both", "Neither"], "Segmentation", "Segmentation causes external fragmentation", "medium"),
        ("Working set is?", ["Pages in memory", "Processes", "Resources", "Threads"], "Pages in memory", "Pages referenced in time window", "medium"),
        ("Fair disk scheduling?", ["FCFS", "SSTF", "SCAN", "LOOK"], "FCFS", "FCFS treats all equally", "easy"),
        ("fork() creates?", ["Thread", "Process", "Program", "Terminate"], "Process", "fork() creates child process", "easy"),
        ("Zombie process is?", ["Dead", "Waiting for parent", "Orphan", "Sleeping"], "Waiting for parent", "Terminated but parent hasn't read exit", "medium"),
        ("Thrashing is?", ["High CPU", "Excessive paging", "Memory leak", "Disk failure"], "Excessive paging", "System spends more time paging", "medium"),
        ("SJF minimizes?", ["Turnaround", "Waiting time", "Response", "All"], "Waiting time", "SJF minimizes average waiting time", "medium"),
        ("Semaphore is?", ["Lock", "Counter", "Sync primitive", "All"], "All", "Semaphore is sync primitive with counter", "easy"),
        ("Convoy effect in?", ["FCFS", "SJF", "Round Robin", "Priority"], "FCFS", "Short processes wait for long", "medium"),
        ("Demand paging loads?", ["All pages", "On demand", "Preload", "Cache"], "On demand", "Loads pages only when needed", "easy"),
        ("exec() does?", ["Create process", "Replace image", "Terminate", "Suspend"], "Replace image", "Replaces current process with new program", "medium"),
        ("Mutex vs semaphore?", ["Binary vs counting", "Lock vs signal", "Both", "Neither"], "Binary vs counting", "Mutex is binary, semaphore counting", "medium"),
        ("Page fault is?", ["Memory error", "Page not in memory", "Disk error", "CPU error"], "Page not in memory", "Referenced page not in memory", "easy"),
        ("Aging prevents?", ["Starvation", "Deadlock", "Thrashing", "Fragmentation"], "Starvation", "Gradually increases priority", "medium"),
        ("Monitor is?", ["Hardware", "Sync construct", "Display", "Process"], "Sync construct", "High-level synchronization", "medium"),
        ("Preemptive scheduling?", ["CPU can be taken", "Priority based", "Time based", "Resource based"], "CPU can be taken", "CPU taken from running process", "easy"),
        ("wait() for?", ["Child", "Resource", "Signal", "Time"], "Child", "Parent waits for child termination", "easy"),
        ("Context switch overhead?", ["High", "Low", "Zero", "Variable"], "High", "Saving and restoring state is expensive", "medium"),
        ("Belady anomaly in?", ["FIFO", "LRU", "Optimal", "All"], "FIFO", "More frames can cause more faults", "hard"),
        ("Spinlock uses?", ["Busy waiting", "Sleep", "Block", "Yield"], "Busy waiting", "Continuously checks lock", "medium"),
        ("Copy-on-write in?", ["fork()", "exec()", "wait()", "exit()"], "fork()", "Delays copying until write", "medium"),
        ("Multilevel queue has?", ["Multiple queues", "Single queue", "Priority", "FCFS"], "Multiple queues", "Separate queues for different priorities", "easy"),
    ]
    
    for text, opts, ans, exp, diff in os_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Operating Systems",
            "subject": "Operating Systems",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ Operating Systems: {len(os_data)} questions")
    
    # DBMS - 27 questions
    print("\n📚 Generating DBMS questions...")
    dbms_data = [
        ("Primary key is?", ["Unique identifier", "Foreign key", "Index", "Constraint"], "Unique identifier", "Uniquely identifies each record", "easy"),
        ("Normalization reduces?", ["Redundancy", "Speed", "Size", "Complexity"], "Redundancy", "Reduces redundancy and dependency", "easy"),
        ("3NF eliminates?", ["Partial dependency", "Transitive dependency", "Both", "Neither"], "Transitive dependency", "3NF removes transitive dependencies", "medium"),
        ("ACID stands for?", ["Atomicity Consistency Isolation Durability", "All Correct In Database", "Atomic Consistent Isolated Durable", "None"], "Atomicity Consistency Isolation Durability", "Transaction properties", "easy"),
        ("Foreign key references?", ["Primary key", "Unique key", "Candidate key", "Super key"], "Primary key", "References primary key of another table", "easy"),
        ("Full outer join returns?", ["All rows from both", "Matching rows", "Left table rows", "Right table rows"], "All rows from both", "Returns all rows from both tables", "medium"),
        ("Indexing improves?", ["Query speed", "Storage", "Backup", "Security"], "Query speed", "Speeds up queries", "easy"),
        ("View is?", ["Virtual table", "Physical table", "Index", "Constraint"], "Virtual table", "Based on query result", "easy"),
        ("Read committed prevents?", ["Dirty reads", "Non-repeatable reads", "Phantom reads", "All"], "Dirty reads", "Prevents reading uncommitted data", "medium"),
        ("Denormalization adds?", ["Redundancy", "Constraints", "Indexes", "Views"], "Redundancy", "Adds redundancy for performance", "medium"),
        ("Candidate key is?", ["Minimal super key", "Primary key", "Foreign key", "Unique key"], "Minimal super key", "Minimal set that uniquely identifies", "medium"),
        ("CREATE is?", ["DDL", "DML", "DCL", "TCL"], "DDL", "Data Definition Language", "easy"),
        ("Trigger executes?", ["Automatically", "Manually", "On demand", "Never"], "Automatically", "Executes on events", "medium"),
        ("GROUP BY does?", ["Groups rows", "Sorts rows", "Filters rows", "Joins rows"], "Groups rows", "Groups rows with same values", "easy"),
        ("DELETE vs TRUNCATE?", ["DML vs DDL", "Same", "DELETE faster", "TRUNCATE slower"], "DML vs DDL", "DELETE can rollback, TRUNCATE cannot", "medium"),
        ("Composite key uses?", ["Multiple columns", "Single column", "Foreign key", "Index"], "Multiple columns", "Multiple columns as key", "easy"),
        ("2NF eliminates?", ["Partial dependency", "Transitive dependency", "Both", "Neither"], "Partial dependency", "Removes partial dependencies", "medium"),
        ("Deadlock in DBMS?", ["Circular wait", "Starvation", "Timeout", "Error"], "Circular wait", "Transactions wait for each other", "medium"),
        ("HAVING filters?", ["Groups", "Rows", "Tables", "Columns"], "Groups", "Filters groups after GROUP BY", "medium"),
        ("Referential integrity?", ["Foreign key constraint", "Primary key constraint", "Unique constraint", "Check constraint"], "Foreign key constraint", "Ensures valid foreign key references", "medium"),
        ("Clustered index?", ["Sorts data physically", "Logical pointer", "Both", "Neither"], "Sorts data physically", "Data sorted by index key", "medium"),
        ("Schema defines?", ["Database structure", "Query", "Table", "Index"], "Database structure", "Defines structure", "easy"),
        ("COMMIT does?", ["Saves transaction", "Rollback", "Start", "End"], "Saves transaction", "Permanently saves changes", "easy"),
        ("Subquery is?", ["Query within query", "Join", "View", "Procedure"], "Query within query", "Nested query", "easy"),
        ("UNION removes?", ["Duplicates", "Nothing", "All rows", "Nulls"], "Duplicates", "UNION removes duplicates", "medium"),
        ("Stored procedure is?", ["Precompiled SQL", "Query", "Table", "Index"], "Precompiled SQL", "Precompiled code", "medium"),
        ("Serializable prevents?", ["All anomalies", "Dirty reads", "Phantom reads", "None"], "All anomalies", "Highest isolation level", "hard"),
    ]
    
    for text, opts, ans, exp, diff in dbms_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "DBMS",
            "subject": "Database Management Systems",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ DBMS: {len(dbms_data)} questions")
    
    # Computer Networks - 27 questions
    print("\n📚 Generating Computer Networks questions...")
    cn_data = [
        ("OSI has how many layers?", ["5", "6", "7", "8"], "7", "OSI model has 7 layers", "easy"),
        ("Network layer handles?", ["Routing", "Error detection", "Flow control", "Encryption"], "Routing", "Network layer routes packets", "easy"),
        ("ARP resolves?", ["IP to MAC", "MAC to IP", "IP to port", "Port to IP"], "IP to MAC", "Address Resolution Protocol", "medium"),
        ("TCP is?", ["Connection-oriented", "Connectionless", "Both", "Neither"], "Connection-oriented", "TCP establishes connection", "easy"),
        ("Class C subnet mask?", ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"], "255.255.255.0", "Class C default mask", "easy"),
        ("DNS does?", ["Name resolution", "Routing", "Error detection", "Flow control"], "Name resolution", "Resolves domain names to IP", "easy"),
        ("HTTP uses port?", ["80", "443", "21", "25"], "80", "HTTP default port", "easy"),
        ("TCP header max size?", ["20 bytes", "40 bytes", "60 bytes", "80 bytes"], "60 bytes", "With options up to 60 bytes", "medium"),
        ("CSMA/CD detects?", ["Collisions", "Errors", "Flow", "Routes"], "Collisions", "Collision detection in Ethernet", "medium"),
        ("Transport layer provides?", ["End-to-end communication", "Routing", "Physical transmission", "Presentation"], "End-to-end communication", "Transport layer function", "easy"),
        ("NAT translates?", ["IP addresses", "Port numbers", "Both", "Neither"], "Both", "Network Address Translation", "medium"),
        ("Hub vs Switch?", ["Broadcast vs unicast", "Same", "Hub faster", "Switch slower"], "Broadcast vs unicast", "Hub broadcasts, switch unicasts", "medium"),
        ("ICMP for?", ["Error reporting", "Data transfer", "Routing", "Name resolution"], "Error reporting", "Internet Control Message Protocol", "medium"),
        ("SMTP for?", ["Email", "Web", "File transfer", "Name resolution"], "Email", "Simple Mail Transfer Protocol", "easy"),
        ("Sliding window provides?", ["Flow control", "Error control", "Both", "Neither"], "Both", "Flow and error control", "medium"),
        ("TCP vs UDP?", ["Reliable vs unreliable", "Same", "TCP faster", "UDP reliable"], "Reliable vs unreliable", "TCP reliable, UDP not", "easy"),
        ("Checksum for?", ["Error detection", "Error correction", "Flow control", "Routing"], "Error detection", "Detects errors", "easy"),
        ("RIP uses?", ["Distance vector", "Link state", "Path vector", "Hybrid"], "Distance vector", "Routing Information Protocol", "medium"),
        ("DHCP assigns?", ["IP addresses", "Names", "Routes", "Errors"], "IP addresses", "Dynamic Host Configuration Protocol", "easy"),
        ("MSS is?", ["MTU minus headers", "MTU", "1500 bytes", "65535 bytes"], "MTU minus headers", "Maximum Segment Size", "medium"),
        ("Three-way handshake?", ["Establishes connection", "Closes connection", "Transfers data", "Detects errors"], "Establishes connection", "TCP connection establishment", "medium"),
        ("Presentation layer?", ["Encryption", "Routing", "Physical transmission", "Error detection"], "Encryption", "Handles encryption and formatting", "medium"),
        ("TTL prevents?", ["Routing loops", "Errors", "Flow issues", "Collisions"], "Routing loops", "Time To Live", "medium"),
        ("Router vs Gateway?", ["Layer 3 vs Layer 7", "Same", "Router faster", "Gateway faster"], "Layer 3 vs Layer 7", "Different OSI layers", "medium"),
        ("MAC address is?", ["Physical address", "Logical address", "Port address", "Domain address"], "Physical address", "Hardware address", "easy"),
        ("Congestion control?", ["Prevents overload", "Detects errors", "Controls flow", "Routes packets"], "Prevents overload", "Prevents network congestion", "medium"),
        ("Socket is?", ["Communication endpoint", "Protocol", "Address", "Port"], "Communication endpoint", "Endpoint for communication", "medium"),
    ]
    
    for text, opts, ans, exp, diff in cn_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Computer Networks",
            "subject": "Computer Networks",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ Computer Networks: {len(cn_data)} questions")
    
    # Data Structures & Algorithms - 40 questions
    print("\n📚 Generating DSA questions...")
    dsa_data = [
        ("Binary search complexity?", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], "O(log n)", "Logarithmic complexity", "easy"),
        ("Stack uses?", ["LIFO", "FIFO", "Random", "Priority"], "LIFO", "Last In First Out", "easy"),
        ("Quicksort worst case?", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], "O(n^2)", "Worst case quadratic", "medium"),
        ("Preorder visits?", ["Root first", "Root last", "Root middle", "Level order"], "Root first", "Root before children", "easy"),
        ("Merge sort space?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "O(n)", "Requires extra space", "medium"),
        ("BFS uses?", ["Queue", "Stack", "Tree", "Heap"], "Queue", "Breadth-first search", "easy"),
        ("Heap sort complexity?", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], "O(n log n)", "Always n log n", "medium"),
        ("Dijkstra finds?", ["Shortest path", "MST", "Cycle", "Topological order"], "Shortest path", "Shortest path algorithm", "medium"),
        ("Complete binary tree height?", ["log n", "n", "n log n", "sqrt(n)"], "log n", "Logarithmic height", "medium"),
        ("Stable sorting?", ["Merge sort", "Quick sort", "Heap sort", "Selection sort"], "Merge sort", "Maintains relative order", "medium"),
        ("Hash table insertion?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "O(1)", "Average case constant", "easy"),
        ("DFS uses?", ["Stack", "Queue", "Tree", "Heap"], "Stack", "Depth-first search", "easy"),
        ("Dynamic programming uses?", ["Memoization", "Divide and conquer", "Greedy", "Backtracking"], "Memoization", "Stores subproblem solutions", "medium"),
        ("Min heap find min?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "O(1)", "Root is minimum", "easy"),
        ("Topological sort uses?", ["DFS", "BFS", "Both", "Neither"], "Both", "Both can do topological sort", "medium"),
        ("DFS space complexity?", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], "O(n)", "Recursion stack", "medium"),
        ("Linked list O(1) operation?", ["Insert at head", "Search", "Access middle", "Sort"], "Insert at head", "Constant time insertion", "medium"),
        ("Build heap complexity?", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], "O(n)", "Linear time", "medium"),
        ("Kruskal finds?", ["MST", "Shortest path", "Cycle", "Topological order"], "MST", "Minimum spanning tree", "medium"),
        ("Insertion sort worst case?", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], "O(n^2)", "Quadratic worst case", "easy"),
        ("Priority queue uses?", ["Heap", "Array", "Linked list", "Stack"], "Heap", "Heap implementation", "easy"),
        ("Floyd-Warshall complexity?", ["O(n^2)", "O(n^3)", "O(n log n)", "O(n)"], "O(n^3)", "Cubic complexity", "medium"),
        ("Quicksort average case?", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], "O(n log n)", "Average n log n", "medium"),
        ("AVL tree is?", ["Balanced BST", "Binary tree", "Complete tree", "Full tree"], "Balanced BST", "Self-balancing", "medium"),
        ("BST deletion?", ["O(log n)", "O(1)", "O(n)", "O(n log n)"], "O(log n)", "Average case logarithmic", "medium"),
        ("Cycle detection uses?", ["DFS", "BFS", "Both", "Neither"], "Both", "Both can detect cycles", "medium"),
        ("Quicksort space?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "O(log n)", "Recursion stack", "medium"),
        ("Undo operation uses?", ["Stack", "Queue", "Tree", "Graph"], "Stack", "Stack for undo", "easy"),
        ("Bellman-Ford complexity?", ["O(V)", "O(E)", "O(VE)", "O(V^2)"], "O(VE)", "Vertices times edges", "medium"),
        ("BST inorder gives?", ["Sorted order", "Reverse order", "Random order", "Level order"], "Sorted order", "Inorder traversal", "easy"),
        ("Graph with n vertices max edges?", ["n", "n(n-1)", "n(n-1)/2", "n^2"], "n(n-1)/2", "Complete graph", "medium"),
        ("Prim's algorithm finds?", ["MST", "Shortest path", "Cycle", "Topological order"], "MST", "Minimum spanning tree", "medium"),
        ("Bubble sort best case?", ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], "O(n)", "Already sorted", "easy"),
        ("Red-Black tree is?", ["Balanced BST", "Binary tree", "Complete tree", "Full tree"], "Balanced BST", "Self-balancing", "hard"),
        ("Trie is used for?", ["String operations", "Sorting", "Searching numbers", "Graph traversal"], "String operations", "Prefix tree", "medium"),
        ("Counting sort complexity?", ["O(n+k)", "O(n log n)", "O(n^2)", "O(n)"], "O(n+k)", "Linear with range", "medium"),
        ("Segment tree query?", ["O(log n)", "O(n)", "O(1)", "O(n log n)"], "O(log n)", "Logarithmic query", "hard"),
        ("Kadane's algorithm for?", ["Maximum subarray sum", "Sorting", "Searching", "Graph traversal"], "Maximum subarray sum", "Dynamic programming", "medium"),
        ("Union-Find complexity?", ["O(α(n))", "O(log n)", "O(n)", "O(1)"], "O(α(n))", "Inverse Ackermann", "hard"),
        ("Radix sort is?", ["Non-comparison sort", "Comparison sort", "Unstable", "In-place"], "Non-comparison sort", "Sorts by digits", "medium"),
    ]
    
    for text, opts, ans, exp, diff in dsa_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Data Structures & Algorithms",
            "subject": "DSA",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": random.choice([1, 2]),
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ DSA: {len(dsa_data)} questions")
    
    # Theory of Computation - 25 questions
    print("\n📚 Generating Theory of Computation questions...")
    toc_data = [
        ("DFA accepts?", ["Regular", "Context-free", "Context-sensitive", "Recursive"], "Regular", "DFA accepts regular languages", "easy"),
        ("Pumping lemma proves?", ["Non-regularity", "Regularity", "Decidability", "Undecidability"], "Non-regularity", "Proves language not regular", "medium"),
        ("NFA vs DFA power?", ["Equal", "NFA more", "DFA more", "Depends"], "Equal", "Equal computational power", "easy"),
        ("Regular languages closed under?", ["Union", "Intersection", "Complement", "All"], "All", "Closed under all operations", "medium"),
        ("Halting problem is?", ["Undecidable", "Decidable", "NP-complete", "P"], "Undecidable", "Cannot be decided", "medium"),
        ("CYK algorithm complexity?", ["O(n)", "O(n^2)", "O(n^3)", "O(2^n)"], "O(n^3)", "Cubic complexity", "medium"),
        ("PDA accepts?", ["Context-free", "Regular", "Context-sensitive", "Recursive"], "Context-free", "Pushdown automata", "easy"),
        ("CNF is?", ["Grammar form", "Automaton form", "Language form", "Expression form"], "Grammar form", "Chomsky Normal Form", "medium"),
        ("Regular closed under complement?", ["Yes", "No", "Sometimes", "Never"], "Yes", "Regular languages closed", "medium"),
        ("Pumping length equals?", ["Number of states", "String length", "Alphabet size", "Transitions"], "Number of states", "DFA states", "medium"),
        ("CFL membership is?", ["Decidable", "Undecidable", "NP-complete", "P"], "Decidable", "Can be decided", "hard"),
        ("Turing machine is?", ["Abstract machine", "Physical machine", "Virtual machine", "Real machine"], "Abstract machine", "Computational model", "easy"),
        ("Type 3 grammar generates?", ["Regular", "Context-free", "Context-sensitive", "Unrestricted"], "Regular", "Regular grammar", "easy"),
        ("DFA vs NFA determinism?", ["DFA deterministic", "NFA deterministic", "Both", "Neither"], "DFA deterministic", "DFA is deterministic", "easy"),
        ("CFL not closed under?", ["Intersection", "Union", "Concatenation", "Kleene star"], "Intersection", "Not closed under intersection", "medium"),
        ("Rice theorem about?", ["Decidability", "Complexity", "Automata", "Grammars"], "Decidability", "Non-trivial properties undecidable", "hard"),
        ("Epsilon transition?", ["Empty transition", "Final transition", "Initial transition", "Loop"], "Empty transition", "Moves without input", "easy"),
        ("Most powerful automaton?", ["TM", "PDA", "NFA", "DFA"], "TM", "Turing machine", "easy"),
        ("Left recursion?", ["A -> Aa", "A -> aA", "A -> AA", "A -> a"], "A -> Aa", "Non-terminal derives itself left", "medium"),
        ("PCP is?", ["Undecidable", "Decidable", "NP-complete", "P"], "Undecidable", "Post Correspondence Problem", "hard"),
        ("Ambiguous grammar has?", ["Multiple derivations", "No derivation", "Single derivation", "Infinite derivations"], "Multiple derivations", "Multiple parse trees", "medium"),
        ("Regular expression denotes?", ["Regular language", "Context-free language", "Context-sensitive language", "Recursive language"], "Regular language", "Denotes regular language", "easy"),
        ("Context-free grammar has?", ["Productions", "States", "Transitions", "Tapes"], "Productions", "Grammar productions", "easy"),
        ("Finite automaton has?", ["Finite states", "Infinite states", "No states", "Variable states"], "Finite states", "Finite number of states", "easy"),
        ("Chomsky hierarchy has?", ["4 types", "3 types", "5 types", "2 types"], "4 types", "Type 0, 1, 2, 3", "medium"),
    ]
    
    for text, opts, ans, exp, diff in toc_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Theory of Computation",
            "subject": "Theory of Computation",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": random.choice([1, 2]),
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ Theory of Computation: {len(toc_data)} questions")
    
    # Computer Organization & Architecture - 30 questions
    print("\n📚 Generating COA questions...")
    coa_data = [
        ("Cache speeds up?", ["Memory access", "CPU", "Disk", "Network"], "Memory access", "Faster memory access", "easy"),
        ("Register addressing uses?", ["Register", "Memory", "Immediate", "Indirect"], "Register", "Uses register operand", "easy"),
        ("Pipelining is?", ["Overlapped execution", "Sequential", "Parallel", "Random"], "Overlapped execution", "Overlaps instruction stages", "medium"),
        ("ALU performs?", ["Arithmetic and logic", "Only arithmetic", "Only logic", "Memory operations"], "Arithmetic and logic", "Arithmetic Logic Unit", "easy"),
        ("Fastest cache mapping?", ["Associative", "Direct", "Set-associative", "All same"], "Associative", "Fully associative fastest", "medium"),
        ("Instruction cycle has?", ["Fetch-Decode-Execute", "Fetch-Execute", "Decode-Execute", "Fetch-Decode"], "Fetch-Decode-Execute", "Three phases", "easy"),
        ("Program counter holds?", ["Next instruction address", "Data", "Result", "Operand"], "Next instruction address", "PC holds next address", "easy"),
        ("SRAM vs DRAM?", ["SRAM faster", "DRAM faster", "Same speed", "Depends"], "SRAM faster", "Static RAM faster", "easy"),
        ("Virtual memory extends?", ["Physical memory", "Cache", "Registers", "Disk"], "Physical memory", "Uses disk as extension", "medium"),
        ("MAR holds?", ["Memory address", "Data", "Instruction", "Result"], "Memory address", "Memory Address Register", "easy"),
        ("Pipeline hazards?", ["Data, Control, Structural", "Only data", "Only control", "Only structural"], "Data, Control, Structural", "Three types of hazards", "medium"),
        ("RISC uses?", ["Simple instructions", "Complex instructions", "Variable length", "Microprogramming"], "Simple instructions", "Reduced Instruction Set", "easy"),
        ("TLB caches?", ["Page table entries", "Data", "Instructions", "Registers"], "Page table entries", "Translation Lookaside Buffer", "medium"),
        ("Data bus transfers?", ["Data", "Address", "Control signals", "All"], "Data", "Transfers data", "easy"),
        ("DMA allows?", ["Direct memory access", "Dynamic allocation", "Data access", "Direct allocation"], "Direct memory access", "Bypasses CPU", "medium"),
        ("Interrupt signals?", ["CPU", "Memory", "Disk", "Cache"], "CPU", "Signals CPU for attention", "easy"),
        ("Volatile memory?", ["RAM", "ROM", "Flash", "Hard disk"], "RAM", "Loses data on power off", "easy"),
        ("Instruction pipelining?", ["Overlaps stages", "Sequential", "Parallel", "Random"], "Overlaps stages", "Overlaps execution", "medium"),
        ("Stack pointer points to?", ["Top of stack", "Bottom", "Middle", "Random"], "Top of stack", "SP points to top", "easy"),
        ("Von Neumann uses?", ["Unified memory", "Separate memory", "Cache only", "Registers only"], "Unified memory", "Single memory for instructions and data", "medium"),
        ("Cache coherence ensures?", ["Consistency", "Speed", "Size", "Mapping"], "Consistency", "Consistency in multiprocessor", "hard"),
        ("Control unit?", ["Controls operations", "Stores data", "Executes", "Holds addresses"], "Controls operations", "Manages execution", "easy"),
        ("Non-volatile memory?", ["ROM", "RAM", "Cache", "Register"], "ROM", "Retains data", "easy"),
        ("Microprogramming implements?", ["Control unit", "ALU", "Memory", "Cache"], "Control unit", "Control unit implementation", "medium"),
        ("Harvard architecture has?", ["Separate memory", "Unified memory", "No memory", "Cache only"], "Separate memory", "Separate instruction and data memory", "medium"),
        ("Superscalar executes?", ["Multiple instructions per cycle", "One per cycle", "Sequential", "Random"], "Multiple instructions per cycle", "Multiple issue", "hard"),
        ("Cache miss penalty?", ["Memory access time", "Cache access time", "Zero", "Infinite"], "Memory access time", "Time to fetch from memory", "medium"),
        ("CISC has?", ["Complex instructions", "Simple instructions", "Fixed length", "No instructions"], "Complex instructions", "Complex Instruction Set", "easy"),
        ("Write-through cache?", ["Writes to memory immediately", "Writes later", "Never writes", "Writes to cache only"], "Writes to memory immediately", "Immediate write", "medium"),
        ("Booth's algorithm for?", ["Multiplication", "Division", "Addition", "Subtraction"], "Multiplication", "Efficient multiplication", "medium"),
    ]
    
    for text, opts, ans, exp, diff in coa_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Computer Organization & Architecture",
            "subject": "COA",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ COA: {len(coa_data)} questions")
    
    # Compiler Design - 20 questions
    print("\n📚 Generating Compiler Design questions...")
    cd_data = [
        ("Lexical analysis does?", ["Tokenization", "Parsing", "Code generation", "Optimization"], "Tokenization", "Converts to tokens", "easy"),
        ("Syntax errors detected by?", ["Parser", "Lexer", "Semantic analyzer", "Code generator"], "Parser", "Syntax analysis", "easy"),
        ("Parse tree shows?", ["Derivation", "Tokens", "Code", "Errors"], "Derivation", "Derivation tree", "medium"),
        ("LL parser is?", ["Top-down", "Bottom-up", "Both", "Neither"], "Top-down", "Left-to-right leftmost", "medium"),
        ("Semantic analysis checks?", ["Types", "Syntax", "Tokens", "Code"], "Types", "Type checking", "easy"),
        ("Intermediate code is?", ["Machine-independent", "Machine code", "Source code", "Assembly"], "Machine-independent", "Platform independent", "medium"),
        ("Register allocation in?", ["Code generation", "Parsing", "Lexical analysis", "Semantic analysis"], "Code generation", "During code generation", "medium"),
        ("Symbol table stores?", ["Identifiers", "Tokens", "Code", "Errors"], "Identifiers", "Identifier information", "easy"),
        ("Left factoring removes?", ["Common prefix", "Left recursion", "Ambiguity", "Errors"], "Common prefix", "Removes common prefix", "medium"),
        ("Code generation produces?", ["Target code", "Tokens", "Parse tree", "Errors"], "Target code", "Final code", "easy"),
        ("Handle in LR parsing?", ["Substring matching production", "Token", "Non-terminal", "Terminal"], "Substring matching production", "Matches production", "hard"),
        ("Constant folding?", ["Evaluates at compile time", "Removes constants", "Adds constants", "Stores constants"], "Evaluates at compile time", "Compile-time evaluation", "medium"),
        ("Ambiguous grammar has?", ["Multiple parse trees", "No parse tree", "Single parse tree", "Infinite trees"], "Multiple parse trees", "Multiple derivations", "medium"),
        ("Three-address code?", ["Intermediate representation", "Machine code", "Source code", "Assembly"], "Intermediate representation", "IR with three operands", "medium"),
        ("Lookahead predicts?", ["Production", "Token", "Code", "Error"], "Production", "Predicts production", "medium"),
        ("Dead code elimination removes?", ["Unreachable code", "Comments", "Variables", "Functions"], "Unreachable code", "Removes unused code", "medium"),
        ("LR vs LL?", ["LR more powerful", "LL more powerful", "Equal", "Depends"], "LR more powerful", "LR handles more grammars", "medium"),
        ("Register allocation assigns?", ["Variables to registers", "Memory", "Code", "Tokens"], "Variables to registers", "Assigns to registers", "medium"),
        ("Shift-reduce is?", ["Bottom-up", "Top-down", "Both", "Neither"], "Bottom-up", "Bottom-up parsing", "medium"),
        ("Loop optimization improves?", ["Loop performance", "Removes loops", "Adds loops", "Unrolls loops"], "Loop performance", "Improves efficiency", "medium"),
    ]
    
    for text, opts, ans, exp, diff in cd_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Compiler Design",
            "subject": "Compiler Design",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ Compiler Design: {len(cd_data)} questions")
    
    # Digital Logic - 25 questions
    print("\n📚 Generating Digital Logic questions...")
    dl_data = [
        ("Universal gate?", ["NAND", "AND", "OR", "XOR"], "NAND", "NAND is universal", "easy"),
        ("3-variable minterms?", ["8", "4", "6", "16"], "8", "2^3 = 8 minterms", "easy"),
        ("Flip-flop is?", ["Sequential", "Combinational", "Logic gate", "Memory"], "Sequential", "Sequential circuit", "easy"),
        ("D flip-flop has?", ["No invalid state", "Invalid state", "Two states", "Three states"], "No invalid state", "No invalid state", "medium"),
        ("Multiplexer is?", ["Data selector", "Data distributor", "Encoder", "Decoder"], "Data selector", "Selects input", "easy"),
        ("K-map simplifies?", ["Boolean expressions", "Circuits", "Tests", "Analysis"], "Boolean expressions", "Simplification tool", "easy"),
        ("Decoder converts?", ["n to 2^n", "2^n to n", "Data selector", "Data distributor"], "n to 2^n", "n inputs to 2^n outputs", "medium"),
        ("Latch vs flip-flop?", ["Level vs edge", "Speed", "Cost", "Size"], "Level vs edge", "Triggering difference", "medium"),
        ("Half adder adds?", ["Two bits", "Three bits", "Four bits", "One bit"], "Two bits", "Adds two bits", "easy"),
        ("Priority encoder encodes?", ["Highest priority", "All inputs", "Decodes", "Selects"], "Highest priority", "Highest priority input", "medium"),
        ("Propagation delay is?", ["Output change time", "Input change time", "Clock period", "Setup time"], "Output change time", "Time for output change", "medium"),
        ("Counter is?", ["Sequential", "Combinational", "Logic gate", "Memory"], "Sequential", "Sequential circuit", "easy"),
        ("Shift register?", ["Sequential", "Combinational", "Logic gate", "Memory"], "Sequential", "Shifts data", "easy"),
        ("Fan-out is?", ["Gates driven", "Inputs", "Outputs", "Levels"], "Gates driven", "Number of gates driven", "medium"),
        ("Demultiplexer?", ["Data distributor", "Data selector", "Encoder", "Decoder"], "Data distributor", "Distributes data", "easy"),
        ("Setup time?", ["Before clock edge", "After clock edge", "Propagation delay", "Clock period"], "Before clock edge", "Input stable before clock", "medium"),
        ("Full adder adds?", ["Three bits", "Two bits", "Four bits", "One bit"], "Three bits", "Adds three bits", "easy"),
        ("Race condition?", ["Output depends on delay", "Input", "Clock", "Power"], "Output depends on delay", "Timing dependent", "medium"),
        ("Synchronous counter?", ["All clocked together", "Separate clocks", "No clock", "Multiple clocks"], "All clocked together", "Common clock", "medium"),
        ("Hold time?", ["After clock edge", "Before clock edge", "Propagation delay", "Clock period"], "After clock edge", "Input stable after clock", "medium"),
        ("JK flip-flop eliminates?", ["Invalid state", "Valid state", "All states", "No states"], "Invalid state", "No invalid state", "medium"),
        ("Encoder converts?", ["2^n to n", "n to 2^n", "Data selector", "Data distributor"], "2^n to n", "2^n inputs to n outputs", "medium"),
        ("T flip-flop toggles?", ["On T=1", "On T=0", "Always", "Never"], "On T=1", "Toggles when T=1", "easy"),
        ("Asynchronous counter?", ["Ripple carry", "Synchronous", "No carry", "Parallel"], "Ripple carry", "Ripple through", "medium"),
        ("Excitation table shows?", ["Required inputs", "Outputs", "States", "Transitions"], "Required inputs", "Inputs for state change", "medium"),
    ]
    
    for text, opts, ans, exp, diff in dl_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Digital Logic",
            "subject": "Digital Logic",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ Digital Logic: {len(dl_data)} questions")
    
    # Engineering Mathematics - 40 questions
    print("\n📚 Generating Mathematics questions...")
    math_data = [
        ("Derivative of sin(x)?", ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], "cos(x)", "d/dx[sin(x)] = cos(x)", "easy"),
        ("Integral of 1/x?", ["ln(x)", "x", "1/x^2", "e^x"], "ln(x)", "∫(1/x)dx = ln|x| + C", "easy"),
        ("det(I) = ?", ["1", "0", "-1", "n"], "1", "Identity matrix determinant", "easy"),
        ("Rank of zero matrix?", ["0", "1", "n", "Undefined"], "0", "Zero matrix rank is 0", "easy"),
        ("Euler's formula?", ["e^(ix) = cos(x) + i*sin(x)", "e^x = cos(x)", "e^(ix) = sin(x)", "e^x = x"], "e^(ix) = cos(x) + i*sin(x)", "Complex exponential", "medium"),
        ("Fair coin probability?", ["0.5", "0.25", "0.75", "1"], "0.5", "Equal probability", "easy"),
        ("Mean of 1,2,3,4,5?", ["3", "2", "4", "5"], "3", "Average = 3", "easy"),
        ("Laplace of 1?", ["1/s", "s", "1", "0"], "1/s", "L{1} = 1/s", "medium"),
        ("Eigenvalue equation?", ["Ax = λx", "Ax = x", "Ax = 0", "Ax = I"], "Ax = λx", "Eigenvalue definition", "medium"),
        ("Gradient is?", ["Vector", "Scalar", "Matrix", "Tensor"], "Vector", "Vector of partial derivatives", "medium"),
        ("Divergence is?", ["Scalar", "Vector", "Matrix", "Tensor"], "Scalar", "Scalar output", "medium"),
        ("Curl of gradient?", ["Zero", "One", "Vector", "Scalar"], "Zero", "Always zero", "medium"),
        ("Fourier transform for?", ["Frequency analysis", "Time analysis", "Spatial analysis", "All"], "Frequency analysis", "Time to frequency domain", "medium"),
        ("Linearly independent means?", ["No linear combination", "All equal", "All zero", "Orthogonal"], "No linear combination", "Cannot express as combinations", "medium"),
        ("Binomial theorem?", ["(a+b)^n expansion", "(a-b)^n", "a^n + b^n", "a^n - b^n"], "(a+b)^n expansion", "Expands (a+b)^n", "easy"),
        ("Conditional probability?", ["P(A|B) = P(A∩B)/P(B)", "P(A)*P(B)", "P(A) + P(B)", "P(A) - P(B)"], "P(A|B) = P(A∩B)/P(B)", "Conditional formula", "medium"),
        ("Standard deviation?", ["√variance", "variance^2", "Mean", "Sum"], "√variance", "Square root of variance", "easy"),
        ("Normal distribution?", ["Bell curve", "Uniform", "Exponential", "Poisson"], "Bell curve", "Bell-shaped", "easy"),
        ("Chain rule?", ["f'(g(x))*g'(x)", "f'(x)*g'(x)", "f(x)*g(x)", "f'(x) + g'(x)"], "f'(g(x))*g'(x)", "Composite function derivative", "medium"),
        ("Integration by parts?", ["∫u dv = uv - ∫v du", "uv + ∫v du", "u + v", "u - v"], "∫u dv = uv - ∫v du", "Integration formula", "medium"),
        ("Dot product of perpendicular?", ["0", "1", "-1", "Undefined"], "0", "Perpendicular vectors", "easy"),
        ("Cross product magnitude?", ["|a||b|sin(θ)", "|a||b|cos(θ)", "|a||b|", "|a|+|b|"], "|a||b|sin(θ)", "Cross product formula", "medium"),
        ("Symmetric matrix?", ["A = A^T", "A = -A^T", "A = A^(-1)", "A = I"], "A = A^T", "Equals transpose", "easy"),
        ("Basis is?", ["Linearly independent spanning set", "Any set", "Orthogonal", "Unit vectors"], "Linearly independent spanning set", "Basis definition", "medium"),
        ("Cauchy-Schwarz?", ["|<u,v>| ≤ ||u|| ||v||", "|<u,v>| ≥ ||u|| ||v||", "|<u,v>| = ||u|| ||v||", "|<u,v>| = 0"], "|<u,v>| ≤ ||u|| ||v||", "Inner product inequality", "hard"),
        ("Markov chain is?", ["Memoryless process", "Deterministic", "Random walk", "Time series"], "Memoryless process", "Memoryless property", "medium"),
        ("Determinant of transpose?", ["Same as original", "Negative", "Zero", "Inverse"], "Same as original", "det(A^T) = det(A)", "medium"),
        ("Orthogonal vectors?", ["Dot product zero", "Parallel", "Equal", "Opposite"], "Dot product zero", "Perpendicular", "easy"),
        ("Probability axioms?", ["0 ≤ P(A) ≤ 1", "P(A) < 0", "P(A) > 1", "P(A) = 2"], "0 ≤ P(A) ≤ 1", "Probability range", "easy"),
        ("Bayes theorem?", ["P(A|B) = P(B|A)P(A)/P(B)", "P(A)*P(B)", "P(A) + P(B)", "P(A) - P(B)"], "P(A|B) = P(B|A)P(A)/P(B)", "Bayes formula", "medium"),
        ("Variance formula?", ["E[(X-μ)^2]", "E[X]", "E[X^2]", "E[X] + E[X^2]"], "E[(X-μ)^2]", "Variance definition", "medium"),
        ("Covariance measures?", ["Linear relationship", "Mean", "Variance", "Standard deviation"], "Linear relationship", "Measures correlation", "medium"),
        ("Poisson distribution for?", ["Rare events", "Normal events", "Uniform events", "Exponential events"], "Rare events", "Models rare events", "medium"),
        ("Exponential distribution?", ["Memoryless", "Has memory", "Discrete", "Uniform"], "Memoryless", "Memoryless continuous", "medium"),
        ("Central limit theorem?", ["Sum approaches normal", "Sum approaches uniform", "Sum approaches exponential", "Sum approaches Poisson"], "Sum approaches normal", "Approaches normal distribution", "hard"),
        ("Rank-nullity theorem?", ["rank + nullity = n", "rank - nullity = n", "rank * nullity = n", "rank / nullity = n"], "rank + nullity = n", "Dimension theorem", "medium"),
        ("Diagonalizable matrix has?", ["n linearly independent eigenvectors", "No eigenvectors", "One eigenvector", "Infinite eigenvectors"], "n linearly independent eigenvectors", "Diagonalization condition", "hard"),
        ("Gram-Schmidt for?", ["Orthogonalization", "Diagonalization", "Inversion", "Transposition"], "Orthogonalization", "Creates orthogonal basis", "medium"),
        ("Singular matrix has?", ["Zero determinant", "Non-zero determinant", "Positive determinant", "Negative determinant"], "Zero determinant", "Non-invertible", "medium"),
        ("Trace of matrix?", ["Sum of diagonal", "Sum of all elements", "Determinant", "Rank"], "Sum of diagonal", "Diagonal sum", "easy"),
    ]
    
    for text, opts, ans, exp, diff in math_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Engineering Mathematics",
            "subject": "Mathematics",
            "section": "Engineering Mathematics",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ Mathematics: {len(math_data)} questions")
    
    # Programming & C - 20 questions
    print("\n📚 Generating Programming questions...")
    prog_data = [
        ("Pointer stores?", ["Address", "Value", "Both", "Neither"], "Address", "Stores memory address", "easy"),
        ("malloc returns?", ["void*", "int*", "char*", "NULL"], "void*", "Returns void pointer", "medium"),
        ("sizeof operator returns?", ["Size in bytes", "Size in bits", "Address", "Value"], "Size in bytes", "Returns byte size", "easy"),
        ("Static variable scope?", ["File", "Function", "Block", "Global"], "File", "File scope", "medium"),
        ("Pass by reference uses?", ["Pointers", "Values", "Constants", "Macros"], "Pointers", "Uses pointers", "easy"),
        ("Array name is?", ["Pointer to first element", "Value", "Address", "Index"], "Pointer to first element", "Pointer constant", "medium"),
        ("Structure padding for?", ["Alignment", "Size", "Speed", "Memory"], "Alignment", "Memory alignment", "medium"),
        ("Union stores?", ["One member at a time", "All members", "No members", "Two members"], "One member at a time", "Shares memory", "medium"),
        ("Recursion uses?", ["Stack", "Heap", "Queue", "Array"], "Stack", "Uses call stack", "easy"),
        ("Dangling pointer?", ["Points to freed memory", "NULL pointer", "Valid pointer", "Array pointer"], "Points to freed memory", "Invalid reference", "medium"),
        ("Memory leak occurs?", ["Not freeing allocated memory", "Freeing memory", "Using stack", "Using static"], "Not freeing allocated memory", "Memory not freed", "medium"),
        ("Inline function?", ["Expanded at call site", "Normal function", "Recursive", "Static"], "Expanded at call site", "Code expansion", "medium"),
        ("Macro vs function?", ["Preprocessor vs runtime", "Same", "Macro slower", "Function slower"], "Preprocessor vs runtime", "Preprocessing difference", "medium"),
        ("Volatile keyword?", ["Prevents optimization", "Constant", "Static", "Register"], "Prevents optimization", "No optimization", "hard"),
        ("Const pointer?", ["Cannot change address", "Cannot change value", "Both", "Neither"], "Cannot change address", "Fixed address", "medium"),
        ("Function pointer stores?", ["Function address", "Function value", "Function name", "Function result"], "Function address", "Stores address", "medium"),
        ("Typedef creates?", ["Type alias", "New type", "Variable", "Function"], "Type alias", "Type synonym", "easy"),
        ("Enum assigns?", ["Integer values", "Float values", "String values", "Character values"], "Integer values", "Integer constants", "easy"),
        ("Bitwise AND?", ["&", "&&", "|", "||"], "&", "Bitwise operator", "easy"),
        ("Ternary operator?", ["? :", "?", ":", "??"], "? :", "Conditional operator", "easy"),
    ]
    
    for text, opts, ans, exp, diff in prog_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "Programming",
            "subject": "Programming & C",
            "section": "Core Computer Science",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ Programming: {len(prog_data)} questions")
    
    # General Aptitude - 20 questions
    print("\n📚 Generating General Aptitude questions...")
    ga_data = [
        ("If A is taller than B, and B is taller than C, then?", ["A is taller than C", "C is taller than A", "A equals C", "Cannot determine"], "A is taller than C", "Transitive property", "easy"),
        ("Complete: 2, 4, 8, 16, __", ["32", "24", "20", "18"], "32", "Powers of 2", "easy"),
        ("Antonym of 'abundant'?", ["Scarce", "Plenty", "Rich", "Full"], "Scarce", "Opposite meaning", "easy"),
        ("If 5 workers complete a task in 10 days, how many days for 10 workers?", ["5", "10", "15", "20"], "5", "Inverse proportion", "easy"),
        ("Synonym of 'meticulous'?", ["Careful", "Careless", "Fast", "Slow"], "Careful", "Similar meaning", "easy"),
        ("A train travels 60 km/h for 2 hours. Distance?", ["120 km", "60 km", "30 km", "240 km"], "120 km", "Distance = speed × time", "easy"),
        ("If all roses are flowers, and some flowers are red, then?", ["Some roses may be red", "All roses are red", "No roses are red", "All flowers are roses"], "Some roses may be red", "Logical deduction", "medium"),
        ("Complete: ACE, BDF, CEG, __", ["DFH", "EFG", "DEF", "FGH"], "DFH", "Pattern recognition", "easy"),
        ("Percentage of 25 out of 200?", ["12.5%", "25%", "50%", "10%"], "12.5%", "(25/200) × 100", "easy"),
        ("If A:B = 2:3 and B:C = 4:5, then A:C = ?", ["8:15", "2:5", "3:5", "4:15"], "8:15", "Ratio calculation", "medium"),
        ("Opposite of 'expand'?", ["Contract", "Grow", "Increase", "Enlarge"], "Contract", "Antonym", "easy"),
        ("Simple interest on 1000 at 5% for 2 years?", ["100", "50", "150", "200"], "100", "SI = PRT/100", "easy"),
        ("If today is Monday, what day after 100 days?", ["Tuesday", "Monday", "Wednesday", "Thursday"], "Tuesday", "100 mod 7 = 2", "medium"),
        ("Average of 10, 20, 30, 40?", ["25", "20", "30", "35"], "25", "Sum/count = 100/4", "easy"),
        ("Compound interest formula?", ["P(1+r)^t", "Prt", "P+rt", "P(1+rt)"], "P(1+r)^t", "CI formula", "medium"),
        ("If x% of 50 = 10, then x = ?", ["20", "10", "5", "25"], "20", "(x/100) × 50 = 10", "easy"),
        ("Probability of getting 6 on a die?", ["1/6", "1/2", "1/3", "1/4"], "1/6", "One outcome out of six", "easy"),
        ("Speed of 72 km/h in m/s?", ["20", "72", "36", "10"], "20", "72 × 5/18 = 20", "medium"),
        ("If A can do work in 6 days, B in 8 days, together?", ["3.43 days", "7 days", "14 days", "2 days"], "3.43 days", "1/(1/6 + 1/8)", "hard"),
        ("Profit percentage if CP=100, SP=120?", ["20%", "10%", "25%", "15%"], "20%", "(20/100) × 100", "easy"),
    ]
    
    for text, opts, ans, exp, diff in ga_data:
        questions.append({
            "id": f"Q{qid:04d}",
            "text": text,
            "options": opts,
            "correctAnswer": ans,
            "explanation": exp,
            "topic": "General Aptitude",
            "subject": "General Aptitude",
            "section": "General Aptitude",
            "difficulty": diff,
            "year": random.choice([2020, 2021, 2022, 2023, 2024]),
            "marks": 1,
            "questionType": "MCQ"
        })
        qid += 1
    
    print(f"✓ General Aptitude: {len(ga_data)} questions")
    
    # Save
    output_file = "comprehensive_300_questions.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"✅ Generated {len(questions)} questions")
    print(f"💾 Saved to: {output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
