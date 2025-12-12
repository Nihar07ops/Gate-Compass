#!/usr/bin/env python3
"""
PDF Analysis Module for GATE Materials
Extracts topic-wise trends from PDF materials in GateMaterials folder
"""

import os
import json
import re
from datetime import datetime
from collections import defaultdict, Counter

class GatePDFAnalyzer:
    def __init__(self):
        self.materials_path = os.path.join(os.path.dirname(__file__), '..', '..', 'GateMaterials')
        self.topic_patterns = self.load_topic_patterns()
        self.subject_mapping = self.load_subject_mapping()
        
    def load_topic_patterns(self):
        """Define patterns to identify topics in PDF content"""
        return {
            'Programming and Data Structures': [
                r'array[s]?', r'linked\s+list[s]?', r'stack[s]?', r'queue[s]?',
                r'tree[s]?', r'binary\s+tree[s]?', r'bst', r'binary\s+search\s+tree[s]?',
                r'graph[s]?', r'hash[ing]?', r'heap[s]?', r'sorting', r'searching'
            ],
            'Algorithms': [
                r'dynamic\s+programming', r'dp', r'greedy', r'divide\s+and\s+conquer',
                r'graph\s+algorithm[s]?', r'shortest\s+path', r'dijkstra', r'floyd',
                r'minimum\s+spanning\s+tree', r'mst', r'complexity', r'time\s+complexity'
            ],
            'Theory of Computation': [
                r'finite\s+automata', r'regular\s+expression[s]?', r'context\s+free',
                r'pushdown\s+automata', r'turing\s+machine[s]?', r'decidability',
                r'np\s+complete', r'complexity\s+class[es]?'
            ],
            'Computer Organization': [
                r'pipeline', r'pipelining', r'cache', r'memory\s+hierarchy',
                r'instruction\s+set', r'risc', r'cisc', r'alu', r'control\s+unit'
            ],
            'Operating System': [
                r'process[es]?', r'thread[s]?', r'synchronization', r'deadlock[s]?',
                r'cpu\s+scheduling', r'memory\s+management', r'virtual\s+memory',
                r'file\s+system[s]?'
            ],
            'Databases': [
                r'sql', r'relational\s+algebra', r'normalization', r'er\s+model',
                r'transaction[s]?', r'acid', r'concurrency\s+control', r'indexing'
            ],
            'Computer Networks': [
                r'tcp', r'ip', r'osi\s+model', r'routing', r'switching',
                r'network\s+layer', r'transport\s+layer', r'application\s+layer'
            ],
            'Compiler Design': [
                r'lexical\s+analysis', r'parsing', r'syntax\s+analysis',
                r'semantic\s+analysis', r'code\s+generation', r'optimization'
            ],
            'Digital Logic': [
                r'boolean\s+algebra', r'combinational\s+circuit[s]?',
                r'sequential\s+circuit[s]?', r'flip\s+flop[s]?', r'counter[s]?'
            ],
            'Discrete Mathematics': [
                r'graph\s+theory', r'set[s]?', r'relation[s]?', r'function[s]?',
                r'combinatorics', r'probability', r'logic', r'proof[s]?'
            ]
        }
    
    def load_subject_mapping(self):
        """Map file patterns to subjects"""
        return {
            'algo': 'Algorithms',
            'ds': 'Programming and Data Structures',
            'data': 'Programming and Data Structures',
            'toc': 'Theory of Computation',
            'co': 'Computer Organization',
            'os': 'Operating System',
            'db': 'Databases',
            'cn': 'Computer Networks',
            'cd': 'Compiler Design',
            'dl': 'Digital Logic',
            'dm': 'Discrete Mathematics'
        }
    
    def analyze_pdf_materials(self):
        """Analyze PDF materials and extract topic trends"""
        print("🔍 Analyzing GATE PDF Materials...")
        
        if not os.path.exists(self.materials_path):
            print(f"❌ GateMaterials folder not found at: {self.materials_path}")
            return self.generate_sample_analysis()
        
        # Get list of PDF files
        pdf_files = []
        for root, dirs, files in os.walk(self.materials_path):
            for file in files:
                if file.lower().endswith('.pdf'):
                    pdf_files.append(os.path.join(root, file))
        
        print(f"📚 Found {len(pdf_files)} PDF files")
        
        if not pdf_files:
            print("⚠️ No PDF files found, generating sample analysis")
            return self.generate_sample_analysis()
        
        # Analyze each PDF (simulated - would need actual PDF parsing)
        analysis_results = self.simulate_pdf_analysis(pdf_files)
        
        return analysis_results
    
    def simulate_pdf_analysis(self, pdf_files):
        """Simulate PDF analysis based on file names and structure"""
        topic_frequency = defaultdict(lambda: defaultdict(int))
        subject_distribution = defaultdict(int)
        
        for pdf_path in pdf_files:
            filename = os.path.basename(pdf_path).lower()
            
            # Identify subject from filename
            subject = self.identify_subject_from_filename(filename)
            if subject:
                subject_distribution[subject] += 1
                
                # Simulate topic extraction based on filename patterns
                topics = self.extract_topics_from_filename(filename, subject)
                for topic in topics:
                    topic_frequency[subject][topic] += 1
        
        return self.format_analysis_results(topic_frequency, subject_distribution)
    
    def identify_subject_from_filename(self, filename):
        """Identify subject from PDF filename"""
        for pattern, subject in self.subject_mapping.items():
            if pattern in filename:
                return subject
        
        # Check for full subject names
        for subject in self.topic_patterns.keys():
            if any(word in filename for word in subject.lower().split()):
                return subject
        
        return None
    
    def extract_topics_from_filename(self, filename, subject):
        """Extract likely topics from filename"""
        topics = []
        
        if subject in self.topic_patterns:
            for pattern in self.topic_patterns[subject]:
                if re.search(pattern, filename, re.IGNORECASE):
                    # Convert pattern to readable topic name
                    topic_name = self.pattern_to_topic_name(pattern)
                    topics.append(topic_name)
        
        return topics if topics else ['General']
    
    def pattern_to_topic_name(self, pattern):
        """Convert regex pattern to readable topic name"""
        # Remove regex characters and format
        clean_pattern = re.sub(r'[\\+*?^${}()|[\]]', '', pattern)
        clean_pattern = clean_pattern.replace('\\s+', ' ')
        
        # Capitalize words
        return ' '.join(word.capitalize() for word in clean_pattern.split())
    
    def format_analysis_results(self, topic_frequency, subject_distribution):
        """Format analysis results into structured data"""
        results = {
            'metadata': {
                'source': 'GateMaterials PDF Analysis',
                'analysis_date': datetime.now().strftime('%Y-%m-%d'),
                'total_subjects': len(subject_distribution),
                'analysis_method': 'Filename and structure-based extraction'
            },
            'subject_analysis': {},
            'topic_trends': {},
            'recommendations': []
        }
        
        # Process each subject
        for subject, topic_counts in topic_frequency.items():
            total_materials = subject_distribution[subject]
            
            results['subject_analysis'][subject] = {
                'total_materials': total_materials,
                'topics_covered': len(topic_counts),
                'topic_distribution': dict(topic_counts),
                'coverage_score': min(100, (len(topic_counts) / 10) * 100)  # Assume 10 topics per subject
            }
            
            # Generate topic trends
            for topic, count in topic_counts.items():
                frequency_score = (count / total_materials) * 100 if total_materials > 0 else 0
                
                results['topic_trends'][f"{subject} - {topic}"] = {
                    'subject': subject,
                    'topic': topic,
                    'frequency': count,
                    'frequency_score': frequency_score,
                    'importance': self.calculate_importance(frequency_score),
                    'recommendation': self.generate_topic_recommendation(frequency_score)
                }
        
        # Generate overall recommendations
        results['recommendations'] = self.generate_recommendations(results)
        
        return results
    
    def calculate_importance(self, frequency_score):
        """Calculate topic importance based on frequency"""
        if frequency_score >= 80:
            return 'VERY HIGH'
        elif frequency_score >= 60:
            return 'HIGH'
        elif frequency_score >= 40:
            return 'MEDIUM'
        elif frequency_score >= 20:
            return 'LOW'
        else:
            return 'VERY LOW'
    
    def generate_topic_recommendation(self, frequency_score):
        """Generate study recommendation for topic"""
        if frequency_score >= 80:
            return 'Critical topic - Allocate maximum study time'
        elif frequency_score >= 60:
            return 'Important topic - Focus significant attention'
        elif frequency_score >= 40:
            return 'Moderate topic - Regular practice needed'
        elif frequency_score >= 20:
            return 'Basic topic - Understand fundamentals'
        else:
            return 'Optional topic - Review if time permits'
    
    def generate_recommendations(self, results):
        """Generate overall study recommendations"""
        recommendations = []
        
        # Find high-priority subjects
        high_priority_subjects = []
        for subject, analysis in results['subject_analysis'].items():
            if analysis['coverage_score'] >= 70:
                high_priority_subjects.append(subject)
        
        if high_priority_subjects:
            recommendations.append({
                'type': 'HIGH_PRIORITY_SUBJECTS',
                'message': f"Focus on: {', '.join(high_priority_subjects)}",
                'subjects': high_priority_subjects
            })
        
        # Find critical topics
        critical_topics = []
        for topic_key, topic_data in results['topic_trends'].items():
            if topic_data['importance'] == 'VERY HIGH':
                critical_topics.append(topic_key)
        
        if critical_topics:
            recommendations.append({
                'type': 'CRITICAL_TOPICS',
                'message': f"Critical topics requiring immediate attention: {len(critical_topics)} topics identified",
                'topics': critical_topics[:5]  # Top 5
            })
        
        return recommendations
    
    def generate_sample_analysis(self):
        """Generate sample analysis when PDFs are not accessible"""
        return {
            'metadata': {
                'source': 'Sample Analysis (PDFs not accessible)',
                'analysis_date': datetime.now().strftime('%Y-%m-%d'),
                'total_subjects': 10,
                'analysis_method': 'Template-based sample data'
            },
            'subject_analysis': {
                'Programming and Data Structures': {
                    'total_materials': 15,
                    'topics_covered': 8,
                    'topic_distribution': {
                        'Arrays': 12, 'Linked Lists': 10, 'Trees': 15, 'Graphs': 8,
                        'Stacks': 6, 'Queues': 5, 'Hashing': 7, 'Sorting': 9
                    },
                    'coverage_score': 80
                },
                'Algorithms': {
                    'total_materials': 12,
                    'topics_covered': 6,
                    'topic_distribution': {
                        'Dynamic Programming': 10, 'Greedy': 8, 'Graph Algorithms': 9,
                        'Divide and Conquer': 6, 'Searching': 7, 'Complexity': 5
                    },
                    'coverage_score': 75
                }
            },
            'recommendations': [
                {
                    'type': 'PDF_ACCESS_NEEDED',
                    'message': 'Install PDF parsing libraries to analyze actual materials',
                    'action': 'pip install PyPDF2 pdfplumber'
                }
            ]
        }

def main():
    """Main function to run PDF analysis"""
    analyzer = GatePDFAnalyzer()
    results = analyzer.analyze_pdf_materials()
    
    # Save results
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'pdf_analysis_results.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"✅ PDF analysis completed and saved to: {output_path}")
    return results

if __name__ == "__main__":
    main()