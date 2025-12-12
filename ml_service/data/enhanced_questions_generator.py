import json
import random
from datetime import datetime

class EnhancedQuestionGenerator:
    def __init__(self):
        self.subjects = {
            "Algorithms": {
                "topics": [
                    "Sorting Algorithms", "Searching Algorithms", "Graph Algorithms",
                    "Dynamic Programming", "Greedy Algorithms", "Divide and Conquer",
                    "Complexity Analysis", "Tree Algorithms", "String Algorithms"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.2, "medium": 0.5, "hard": 0.3}
            },
            "Data Structures": {
                "topics": [
                    "Arrays and Linked Lists", "Stacks and Queues", "Trees and BST",
                    "Heaps and Priority Queues", "Hash Tables", "Graphs",
                    "Advanced Trees", "Trie and Suffix Trees"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.3, "medium": 0.4, "hard": 0.3}
            },
            "Operating Systems": {
                "topics": [
                    "Process Management", "Memory Management", "File Systems",
                    "CPU Scheduling", "Synchronization", "Deadlocks",
                    "Virtual Memory", "I/O Systems"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.25, "medium": 0.5, "hard": 0.25}
            },
            "DBMS": {
                "topics": [
                    "Relational Model", "SQL Queries", "Normalization",
                    "Transactions", "Indexing", "Query Optimization",
                    "Concurrency Control", "Recovery Systems"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.3, "medium": 0.4, "hard": 0.3}
            },
            "Computer Networks": {
                "topics": [
                    "OSI Model", "TCP/IP Protocol", "Routing Algorithms",
                    "Network Security", "Error Detection", "Flow Control",
                    "Congestion Control", "Application Layer Protocols"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.25, "medium": 0.5, "hard": 0.25}
            },
            "Theory of Computation": {
                "topics": [
                    "Finite Automata", "Regular Languages", "Context-Free Grammars",
                    "Pushdown Automata", "Turing Machines", "Decidability",
                    "Complexity Classes", "NP-Completeness"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.2, "medium": 0.4, "hard": 0.4}
            },
            "Compiler Design": {
                "topics": [
                    "Lexical Analysis", "Syntax Analysis", "Semantic Analysis",
                    "Code Generation", "Code Optimization", "Error Handling",
                    "Symbol Tables", "Runtime Environments"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.25, "medium": 0.45, "hard": 0.3}
            },
            "Digital Logic": {
                "topics": [
                    "Boolean Algebra", "Logic Gates", "Combinational Circuits",
                    "Sequential Circuits", "Flip-Flops", "Counters",
                    "Memory Elements", "Programmable Logic"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.3, "medium": 0.5, "hard": 0.2}
            },
            "Computer Organization": {
                "topics": [
                    "CPU Architecture", "Instruction Set", "Pipelining",
                    "Memory Hierarchy", "Cache Memory", "I/O Organization",
                    "Parallel Processing", "Performance Metrics"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.25, "medium": 0.5, "hard": 0.25}
            },
            "Discrete Mathematics": {
                "topics": [
                    "Set Theory", "Relations and Functions", "Graph Theory",
                    "Combinatorics", "Probability", "Number Theory",
                    "Logic and Proofs", "Recurrence Relations"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.3, "medium": 0.4, "hard": 0.3}
            },
            "Programming": {
                "topics": [
                    "C Programming", "Data Types", "Pointers and Arrays",
                    "Functions", "Structures", "File Handling",
                    "Memory Management", "Recursion"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.4, "medium": 0.4, "hard": 0.2}
            },
            "General Aptitude": {
                "topics": [
                    "Verbal Ability", "Numerical Ability", "Logical Reasoning",
                    "Data Interpretation", "English Grammar", "Reading Comprehension"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.4, "medium": 0.4, "hard": 0.2}
            },
            "Engineering Mathematics": {
                "topics": [
                    "Linear Algebra", "Calculus", "Probability and Statistics",
                    "Differential Equations", "Complex Variables", "Numerical Methods"
                ],
                "years": list(range(2015, 2025)),
                "difficulty_distribution": {"easy": 0.3, "medium": 0.5, "hard": 0.2}
            }
        }
        
        # Year-wise question distribution patterns
        self.year_patterns = {
            2015: {"total": 65, "core_cs_ratio": 0.75},
            2016: {"total": 65, "core_cs_ratio": 0.77},
            2017: {"total": 65, "core_cs_ratio": 0.78},
            2018: {"total": 65, "core_cs_ratio": 0.80},
            2019: {"total": 65, "core_cs_ratio": 0.82},
            2020: {"total": 65, "core_cs_ratio": 0.83},
            2021: {"total": 65, "core_cs_ratio": 0.85},
            2022: {"total": 65, "core_cs_ratio": 0.85},
            2023: {"total": 65, "core_cs_ratio": 0.87},
            2024: {"total": 65, "core_cs_ratio": 0.88}
        }
    
    def generate_comprehensive_database(self):
        """Generate a comprehensive question database with year-wise and topic-wise distribution"""
        all_questions = []
        question_id = 1
        
        for year in range(2015, 2025):
            year_pattern = self.year_patterns[year]
            total_questions = year_pattern["total"]
            core_cs_questions = int(total_questions * year_pattern["core_cs_ratio"])
            
            # Distribute core CS questions among subjects
            core_subjects = ["Algorithms", "Data Structures", "Operating Systems", "DBMS", 
                           "Computer Networks", "Theory of Computation", "Compiler Design",
                           "Digital Logic", "Computer Organization", "Discrete Mathematics", "Programming"]
            
            # Generate questions for each core subject
            questions_per_subject = self._distribute_questions_by_year(core_cs_questions, core_subjects, year)
            
            for subject, count in questions_per_subject.items():
                subject_questions = self._generate_subject_questions(subject, count, year, question_id)
                all_questions.extend(subject_questions)
                question_id += len(subject_questions)
            
            # Generate remaining questions for General Aptitude and Engineering Math
            remaining = total_questions - core_cs_questions
            apt_questions = remaining // 2
            math_questions = remaining - apt_questions
            
            # General Aptitude questions
            apt_qs = self._generate_subject_questions("General Aptitude", apt_questions, year, question_id)
            all_questions.extend(apt_qs)
            question_id += len(apt_qs)
            
            # Engineering Mathematics questions
            math_qs = self._generate_subject_questions("Engineering Mathematics", math_questions, year, question_id)
            all_questions.extend(math_qs)
            question_id += len(math_qs)
        
        return all_questions
    
    def _distribute_questions_by_year(self, total_questions, subjects, year):
        """Distribute questions among subjects based on year and historical patterns"""
        distribution = {}
        
        # Base distribution
        base_per_subject = total_questions // len(subjects)
        remaining = total_questions % len(subjects)
        
        # Year-based emphasis (some subjects become more important over years)
        emphasis_subjects = {
            2015: ["Algorithms", "Data Structures", "Operating Systems"],
            2016: ["Algorithms", "Data Structures", "DBMS"],
            2017: ["Algorithms", "Computer Networks", "Operating Systems"],
            2018: ["Data Structures", "DBMS", "Theory of Computation"],
            2019: ["Algorithms", "Computer Networks", "Compiler Design"],
            2020: ["Data Structures", "Operating Systems", "Digital Logic"],
            2021: ["Algorithms", "DBMS", "Computer Organization"],
            2022: ["Computer Networks", "Theory of Computation", "Programming"],
            2023: ["Algorithms", "Data Structures", "Discrete Mathematics"],
            2024: ["Operating Systems", "DBMS", "Computer Networks"]
        }
        
        emphasized = emphasis_subjects.get(year, subjects[:3])
        
        for subject in subjects:
            if subject in emphasized:
                distribution[subject] = base_per_subject + 1
                remaining -= 1
            else:
                distribution[subject] = base_per_subject
        
        # Distribute any remaining questions
        for i, subject in enumerate(subjects):
            if remaining > 0:
                distribution[subject] += 1
                remaining -= 1
        
        return distribution
    
    def _generate_subject_questions(self, subject, count, year, start_id):
        """Generate questions for a specific subject"""
        questions = []
        subject_data = self.subjects[subject]
        topics = subject_data["topics"]
        difficulty_dist = subject_data["difficulty_distribution"]
        
        for i in range(count):
            topic = random.choice(topics)
            difficulty = self._choose_difficulty(difficulty_dist)
            
            question = {
                "id": f"{subject.upper().replace(' ', '_')}_{year}_{start_id + i:03d}",
                "text": self._generate_question_text(subject, topic, difficulty, year),
                "options": self._generate_options(subject, topic, difficulty),
                "correctAnswer": None,  # Will be set by _generate_options
                "explanation": self._generate_explanation(subject, topic, difficulty),
                "topic": topic,
                "subject": subject,
                "section": "Core Computer Science" if subject not in ["General Aptitude", "Engineering Mathematics"] else subject,
                "difficulty": difficulty,
                "year": year,
                "marks": self._assign_marks(difficulty),
                "questionType": "MCQ" if random.random() < 0.7 else "Numerical",
                "numerical_value": None
            }
            
            # Set correct answer and numerical value if needed
            if question["questionType"] == "Numerical":
                question["numerical_value"] = random.randint(1, 100)
                question["correctAnswer"] = str(question["numerical_value"])
            else:
                question["correctAnswer"] = question["options"][0]  # First option is correct
            
            questions.append(question)
        
        return questions
    
    def _choose_difficulty(self, distribution):
        """Choose difficulty based on distribution"""
        rand = random.random()
        if rand < distribution["easy"]:
            return "easy"
        elif rand < distribution["easy"] + distribution["medium"]:
            return "medium"
        else:
            return "hard"
    
    def _assign_marks(self, difficulty):
        """Assign marks based on difficulty"""
        if difficulty == "easy":
            return random.choice([1, 1, 2])
        elif difficulty == "medium":
            return random.choice([1, 2, 2])
        else:
            return random.choice([2, 2, 3])
    
    def _generate_question_text(self, subject, topic, difficulty, year):
        """Generate realistic question text"""
        templates = {
            "Algorithms": [
                f"What is the time complexity of the optimal solution for {topic.lower()}?",
                f"In {topic.lower()}, which approach gives the best performance?",
                f"Consider a {topic.lower()} problem with input size n. What is the space complexity?"
            ],
            "Data Structures": [
                f"In {topic.lower()}, what is the worst-case time complexity for insertion?",
                f"Which property is essential for {topic.lower()} to maintain efficiency?",
                f"What is the space complexity of {topic.lower()} implementation?"
            ],
            "Operating Systems": [
                f"In {topic.lower()}, what happens when a process requests more resources?",
                f"Which algorithm is most suitable for {topic.lower()}?",
                f"What is the main advantage of {topic.lower()} over other approaches?"
            ]
        }
        
        subject_templates = templates.get(subject, [
            f"What is the key concept in {topic.lower()}?",
            f"Which method is most effective for {topic.lower()}?",
            f"What is the primary consideration in {topic.lower()}?"
        ])
        
        return random.choice(subject_templates)
    
    def _generate_options(self, subject, topic, difficulty):
        """Generate realistic options"""
        if "Complexity" in topic or "Algorithm" in topic:
            return ["O(n log n)", "O(n²)", "O(n)", "O(log n)"]
        elif "Memory" in topic or "Space" in topic:
            return ["O(n)", "O(1)", "O(log n)", "O(n²)"]
        else:
            return [
                "Option A - Correct approach",
                "Option B - Alternative method",
                "Option C - Less efficient method",
                "Option D - Incorrect approach"
            ]
    
    def _generate_explanation(self, subject, topic, difficulty):
        """Generate explanation for the answer"""
        return f"This question tests understanding of {topic} in {subject}. The correct approach considers the fundamental principles and optimal implementation strategies."

def main():
    generator = EnhancedQuestionGenerator()
    questions = generator.generate_comprehensive_database()
    
    # Save to file
    output_file = "comprehensive_gate_questions.json"
    with open(output_file, 'w') as f:
        json.dump(questions, f, indent=2)
    
    # Print statistics
    print(f"Generated {len(questions)} questions")
    print(f"Saved to {output_file}")
    
    # Year-wise statistics
    year_stats = {}
    subject_stats = {}
    
    for q in questions:
        year = q['year']
        subject = q['subject']
        
        year_stats[year] = year_stats.get(year, 0) + 1
        subject_stats[subject] = subject_stats.get(subject, 0) + 1
    
    print("\nYear-wise distribution:")
    for year in sorted(year_stats.keys()):
        print(f"  {year}: {year_stats[year]} questions")
    
    print("\nSubject-wise distribution:")
    for subject in sorted(subject_stats.keys()):
        print(f"  {subject}: {subject_stats[subject]} questions")

if __name__ == "__main__":
    main()