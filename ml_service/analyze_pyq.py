import pdfplumber
import re
import json
from collections import defaultdict

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def analyze_cse_questions(text):
    """Analyze CSE questions and categorize by topic"""
    
    # Define topic keywords for classification
    topic_keywords = {
        'Algorithms': ['algorithm', 'sorting', 'searching', 'complexity', 'time complexity', 'space complexity', 
                       'dynamic programming', 'greedy', 'divide and conquer', 'backtracking'],
        'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'binary tree', 'bst', 
                           'heap', 'hash', 'graph', 'trie'],
        'Operating Systems': ['process', 'thread', 'scheduling', 'deadlock', 'semaphore', 'mutex', 
                             'memory management', 'paging', 'segmentation', 'virtual memory'],
        'DBMS': ['database', 'sql', 'normalization', 'transaction', 'acid', 'relational', 
                'query', 'join', 'index', 'er diagram'],
        'Computer Networks': ['network', 'tcp', 'udp', 'ip', 'osi', 'routing', 'protocol', 
                             'subnet', 'dns', 'http', 'ethernet'],
        'Theory of Computation': ['automata', 'finite automata', 'turing machine', 'grammar', 
                                 'regular expression', 'context free', 'decidable', 'np complete'],
        'Compiler Design': ['compiler', 'lexical', 'parser', 'syntax', 'semantic', 
                           'code generation', 'optimization', 'symbol table'],
        'Digital Logic': ['logic gate', 'boolean', 'karnaugh', 'flip flop', 'multiplexer', 
                         'decoder', 'counter', 'combinational', 'sequential'],
        'Computer Organization': ['cpu', 'cache', 'pipeline', 'instruction', 'register', 
                                 'memory hierarchy', 'risc', 'cisc', 'addressing mode'],
        'Discrete Mathematics': ['set theory', 'graph theory', 'combinatorics', 'probability', 
                                'relation', 'function', 'group theory', 'lattice'],
        'Programming': ['c programming', 'pointer', 'recursion', 'function', 'array manipulation']
    }
    
    # Extract year-wise questions
    year_pattern = r'(20\d{2}|19\d{2})'
    years = re.findall(year_pattern, text)
    
    # Split text into questions (assuming questions are numbered)
    question_pattern = r'(?:Q\.|Question|^\d+\.|\n\d+\))'
    questions = re.split(question_pattern, text, flags=re.MULTILINE)
    
    # Analyze each question
    results = defaultdict(lambda: defaultdict(int))
    year_totals = defaultdict(int)
    
    current_year = None
    for i, question in enumerate(questions):
        if len(question.strip()) < 20:  # Skip very short segments
            continue
            
        # Try to find year in question
        year_match = re.search(year_pattern, question)
        if year_match:
            current_year = year_match.group(1)
        
        if current_year and 2010 <= int(current_year) <= 2024:
            question_lower = question.lower()
            
            # Classify question by topic
            for topic, keywords in topic_keywords.items():
                for keyword in keywords:
                    if keyword in question_lower:
                        results[current_year][topic] += 1
                        year_totals[current_year] += 1
                        break  # Count each question only once per topic
    
    return dict(results), dict(year_totals)

def main():
    print("🔍 Analyzing GATE Previous Year Question Papers...\n")
    
    # Analyze CSE PDF
    cse_pdf_path = "../GateMaterials/Previous year questions/CSE.pdf"
    print(f"📄 Reading: {cse_pdf_path}")
    
    cse_text = extract_text_from_pdf(cse_pdf_path)
    print(f"✅ Extracted {len(cse_text)} characters from CSE PDF\n")
    
    # Analyze questions
    topic_data, year_totals = analyze_cse_questions(cse_text)
    
    # Display results
    print("📊 TOPIC-WISE QUESTION DISTRIBUTION:\n")
    print("=" * 80)
    
    all_years = sorted(topic_data.keys(), reverse=True)
    all_topics = set()
    for year_data in topic_data.values():
        all_topics.update(year_data.keys())
    
    for year in all_years:
        print(f"\n📅 YEAR {year} (Total: {year_totals.get(year, 0)} questions)")
        print("-" * 80)
        if year in topic_data:
            for topic in sorted(all_topics):
                count = topic_data[year].get(topic, 0)
                if count > 0:
                    print(f"  {topic:30s}: {count:3d} questions")
    
    # Save to JSON
    output_data = {
        'topic_wise_distribution': topic_data,
        'year_totals': year_totals,
        'analysis_date': '2024-12-02',
        'source': 'GATE CSE Previous Year Questions'
    }
    
    output_file = 'data/pyq_analysis.json'
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n\n✅ Analysis saved to: {output_file}")
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
