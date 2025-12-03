"""
Run detailed topic analysis with progress tracking
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from detailed_topic_analyzer import DetailedTopicAnalyzer

if __name__ == "__main__":
    print("=" * 100)
    print("GATE CSE DETAILED TOPIC ANALYSIS")
    print("=" * 100)
    print()
    
    analyzer = DetailedTopicAnalyzer()
    pdf_path = "../GateMaterials/Previous year questions/CSE.pdf"
    
    try:
        result = analyzer.generate_report(pdf_path)
        print("\n✅ Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()
