import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    PORT = int(os.getenv('PORT', 8000))
    
    # Git Repository
    REPO_URL = os.getenv('REPO_URL', 'https://github.com/himanshupdev123/GateMaterials.git')
    REPO_PATH = './data/gate_materials'
    
    # Database
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    DB_NAME = 'gate_trends'
    
    # Redis Cache
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    CACHE_TTL = 3600  # 1 hour
    
    # Analysis Settings
    MIN_YEAR = 2015
    MAX_YEAR = 2025
    PARSING_ACCURACY_THRESHOLD = 0.95
    
    # Subjects and Topics
    SUBJECTS = [
        'Engineering Mathematics',
        'Digital Logic',
        'Computer Organization',
        'Programming & Data Structures',
        'Algorithms',
        'Theory of Computation',
        'Compiler Design',
        'Operating Systems',
        'Databases',
        'Computer Networks',
        'Discrete Mathematics'
    ]
    
    TOPIC_KEYWORDS = {
        'Algorithms': {
            'Greedy': ['greedy', 'activity selection', 'huffman', 'fractional knapsack'],
            'Dynamic Programming': ['dynamic programming', 'dp', 'memoization', 'optimal substructure', 'knapsack', 'lcs', 'lis'],
            'Graph Algorithms': ['graph', 'bfs', 'dfs', 'dijkstra', 'bellman', 'floyd', 'kruskal', 'prim', 'mst', 'shortest path'],
            'Sorting': ['sorting', 'quicksort', 'mergesort', 'heapsort', 'bubble', 'insertion', 'selection'],
            'Searching': ['binary search', 'linear search', 'searching'],
            'Divide and Conquer': ['divide and conquer', 'merge sort', 'quick sort', 'binary search'],
            'Backtracking': ['backtracking', 'n-queen', 'sudoku', 'hamiltonian'],
        },
        'Data Structures': {
            'Arrays': ['array', 'matrix', '2d array'],
            'Linked Lists': ['linked list', 'singly', 'doubly', 'circular'],
            'Stacks': ['stack', 'push', 'pop', 'infix', 'postfix', 'prefix'],
            'Queues': ['queue', 'circular queue', 'priority queue', 'deque'],
            'Trees': ['tree', 'binary tree', 'bst', 'avl', 'red-black', 'b-tree', 'b+ tree'],
            'Heaps': ['heap', 'min heap', 'max heap', 'heap sort'],
            'Hashing': ['hash', 'hash table', 'collision', 'chaining', 'open addressing'],
            'Graphs': ['graph', 'adjacency matrix', 'adjacency list', 'directed', 'undirected'],
        },
        'Operating Systems': {
            'Process Management': ['process', 'thread', 'fork', 'exec', 'context switch'],
            'CPU Scheduling': ['scheduling', 'fcfs', 'sjf', 'round robin', 'priority', 'multilevel'],
            'Deadlocks': ['deadlock', 'banker', 'resource allocation', 'circular wait'],
            'Memory Management': ['memory', 'paging', 'segmentation', 'virtual memory', 'page replacement'],
            'Synchronization': ['semaphore', 'mutex', 'monitor', 'critical section', 'race condition'],
            'File Systems': ['file system', 'inode', 'directory', 'disk scheduling'],
        },
        'Databases': {
            'SQL': ['sql', 'select', 'join', 'query', 'aggregate'],
            'Normalization': ['normalization', '1nf', '2nf', '3nf', 'bcnf', 'functional dependency'],
            'Transactions': ['transaction', 'acid', 'commit', 'rollback', 'isolation'],
            'Indexing': ['index', 'b-tree', 'b+ tree', 'hash index'],
            'Concurrency': ['concurrency', 'lock', 'timestamp', '2pl', 'deadlock'],
            'ER Model': ['er diagram', 'entity', 'relationship', 'cardinality'],
        },
        'Computer Networks': {
            'OSI Model': ['osi', 'layer', 'physical', 'data link', 'network', 'transport', 'application'],
            'TCP/IP': ['tcp', 'udp', 'ip', 'protocol', 'segment', 'packet'],
            'Routing': ['routing', 'rip', 'ospf', 'bgp', 'distance vector', 'link state'],
            'Network Layer': ['ip address', 'subnet', 'cidr', 'nat', 'icmp'],
            'Data Link': ['mac', 'ethernet', 'arp', 'switching', 'vlan'],
            'Application Layer': ['http', 'ftp', 'smtp', 'dns', 'dhcp'],
        },
        'Theory of Computation': {
            'Automata': ['automata', 'dfa', 'nfa', 'finite automata', 'state machine'],
            'Regular Languages': ['regular expression', 'regular language', 'pumping lemma'],
            'Context-Free': ['cfg', 'context free', 'pda', 'pushdown automata', 'cfl'],
            'Turing Machines': ['turing machine', 'tm', 'decidable', 'undecidable'],
            'Complexity': ['p', 'np', 'np-complete', 'np-hard', 'complexity class'],
        },
        'Compiler Design': {
            'Lexical Analysis': ['lexical', 'token', 'lexer', 'scanner', 'regular expression'],
            'Syntax Analysis': ['parser', 'parsing', 'top-down', 'bottom-up', 'll', 'lr', 'slr'],
            'Semantic Analysis': ['semantic', 'type checking', 'symbol table'],
            'Code Generation': ['code generation', 'intermediate code', 'three address'],
            'Optimization': ['optimization', 'constant folding', 'dead code'],
        },
        'Digital Logic': {
            'Boolean Algebra': ['boolean', 'logic gate', 'and', 'or', 'not', 'xor', 'nand', 'nor'],
            'Combinational': ['combinational', 'multiplexer', 'demultiplexer', 'encoder', 'decoder', 'adder'],
            'Sequential': ['sequential', 'flip flop', 'counter', 'register', 'state machine'],
            'K-Map': ['karnaugh', 'k-map', 'minimization'],
        },
        'Computer Organization': {
            'CPU': ['cpu', 'alu', 'control unit', 'register', 'instruction cycle'],
            'Memory': ['cache', 'memory hierarchy', 'ram', 'rom', 'sram', 'dram'],
            'Pipeline': ['pipeline', 'pipelining', 'hazard', 'forwarding', 'stall'],
            'Instruction Set': ['instruction', 'risc', 'cisc', 'addressing mode'],
            'I/O': ['input output', 'dma', 'interrupt', 'polling'],
        },
        'Programming & Data Structures': {
            'C Programming': ['pointer', 'array', 'structure', 'function', 'recursion'],
            'Complexity': ['time complexity', 'space complexity', 'big o', 'asymptotic'],
            'Recursion': ['recursion', 'recursive', 'base case', 'recurrence'],
        },
        'Engineering Mathematics': {
            'Linear Algebra': ['matrix', 'determinant', 'eigenvalue', 'eigenvector', 'vector space'],
            'Calculus': ['derivative', 'integral', 'limit', 'differential', 'maxima', 'minima'],
            'Probability': ['probability', 'random variable', 'distribution', 'expectation', 'variance'],
            'Graph Theory': ['graph', 'tree', 'path', 'cycle', 'connectivity', 'planar'],
        },
        'Discrete Mathematics': {
            'Set Theory': ['set', 'union', 'intersection', 'complement', 'cardinality'],
            'Relations': ['relation', 'equivalence', 'partial order', 'reflexive', 'symmetric', 'transitive'],
            'Combinatorics': ['permutation', 'combination', 'binomial', 'counting'],
            'Logic': ['propositional', 'predicate', 'logic', 'quantifier', 'inference'],
        }
    }
