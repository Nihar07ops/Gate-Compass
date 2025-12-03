import pdfplumber
import re
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class PDFParser:
    """Parse GATE question papers from PDF files"""
    
    def __init__(self):
        self.question_pattern = r'(?:Q\.|Question|^\d+\.|\n\d+\))'
        self.year_pattern = r'(20\d{2}|19\d{2})'
        self.marks_pattern = r'(\d+)\s*(?:mark|marks|mk)'
        
    def extract_text(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            logger.info(f"Extracted {len(text)} characters from {pdf_path}")
        except Exception as e:
            logger.error(f"Error reading PDF {pdf_path}: {e}")
        return text
    
    def extract_questions(self, text: str) -> List[Dict]:
        """Extract individual questions from text"""
        questions = []
        
        # Split by question markers
        segments = re.split(self.question_pattern, text, flags=re.MULTILINE)
        
        current_year = None
        for segment in segments:
            if len(segment.strip()) < 20:  # Skip very short segments
                continue
            
            # Try to find year
            year_match = re.search(self.year_pattern, segment)
            if year_match:
                year = int(year_match.group(1))
                if 2010 <= year <= 2025:
                    current_year = year
            
            # Extract marks
            marks_match = re.search(self.marks_pattern, segment, re.IGNORECASE)
            marks = int(marks_match.group(1)) if marks_match else 1
            
            if current_year:
                questions.append({
                    'year': current_year,
                    'text': segment.strip(),
                    'marks': marks,
                    'difficulty': self._estimate_difficulty(segment, marks)
                })
        
        logger.info(f"Extracted {len(questions)} questions")
        return questions
    
    def _estimate_difficulty(self, text: str, marks: int) -> str:
        """Estimate question difficulty based on marks and keywords"""
        text_lower = text.lower()
        
        # Difficulty indicators
        hard_keywords = ['prove', 'derive', 'analyze', 'design', 'implement', 'optimize']
        medium_keywords = ['explain', 'compare', 'calculate', 'determine', 'find']
        
        hard_count = sum(1 for kw in hard_keywords if kw in text_lower)
        medium_count = sum(1 for kw in medium_keywords if kw in text_lower)
        
        # Score based on marks and keywords
        score = marks
        if hard_count > 0:
            score += 2
        elif medium_count > 0:
            score += 1
        
        if score >= 5:
            return 'Hard'
        elif score >= 3:
            return 'Medium'
        else:
            return 'Easy'
    
    def parse_gate_paper(self, pdf_path: str, year: int = None) -> List[Dict]:
        """Parse a complete GATE paper"""
        text = self.extract_text(pdf_path)
        questions = self.extract_questions(text)
        
        # Override year if provided
        if year:
            for q in questions:
                q['year'] = year
        
        return questions
