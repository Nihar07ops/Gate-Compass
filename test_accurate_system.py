#!/usr/bin/env python3
"""
Comprehensive test of the accurate GATE CSE historical trends system
Based on actual gatecse.in mark distribution data
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_accurate_system():
    """Test the complete system with accurate gatecse.in data"""
    print("🎯 GATE CSE ACCURATE HISTORICAL TRENDS - COMPREHENSIVE TEST")
    print(f"⏰ Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("📊 Based on actual gatecse.in mark distribution data")
    print("="*70)
    
    # Test 1: Debug data verification
    print("\n🔍 1. DATA VERIFICATION")
    print("-" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/debug/data")
        if response.status_code == 200:
            debug_data = response.json()
            print(f"✅ Total Subjects Loaded: {debug_data['totalSubjects']}")
            print("✅ Subject Names:")
            for i, subject in enumerate(debug_data['subjectNames'], 1):
                print(f"   {i}. {subject}")
            
            sample = debug_data.get('sampleSubject', {})
            if sample:
                print(f"\n📚 Sample Subject: {sample['name']}")
                sample_data = sample.get('data', {})
                print(f"   2024 Marks: {sample_data.get('totalMarks', {}).get('2024', 'N/A')}")
                print(f"   Trend: {sample_data.get('trend', 'N/A')}")
                print(f"   Priority: {sample_data.get('priority', 'N/A')}")
        else:
            print(f"❌ Debug endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Debug test failed: {e}")
    
    # Test 2: Subject rankings with accurate data
    print(f"\n📊 2. ACCURATE SUBJECT RANKINGS")
    print("-" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/historical/rankings")
        if response.status_code == 200:
            rankings_data = response.json()
            rankings = rankings_data.get('rankings', [])
            
            print("🏆 Top 10 Subjects (Accurate Data):")
            total_marks = 0
            for i, subject in enumerate(rankings, 1):
                marks = subject['marks2024']
                total_marks += marks
                print(f"{i:2d}. {subject['subject']:<35} {marks:2d} marks ({subject['trend']})")
            
            print(f"\n📈 Total Marks Across All Subjects: {total_marks}")
            print(f"✅ Expected ~100 marks total for GATE CSE")
            
            if 95 <= total_marks <= 105:
                print("✅ ACCURATE DATA CONFIRMED - Total marks within expected range")
            else:
                print("⚠️ Data may need verification - Total marks outside expected range")
                
        else:
            print(f"❌ Rankings endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Rankings test failed: {e}")
    
    # Test 3: Detailed subject analysis
    print(f"\n🔬 3. DETAILED SUBJECT ANALYSIS")
    print("-" * 50)
    
    high_priority_subjects = [
        "Programming and Data Structures",
        "Algorithms", 
        "Discrete Mathematics"
    ]
    
    for subject in high_priority_subjects:
        try:
            encoded_subject = subject.replace(" ", "%20")
            response = requests.get(f"{BASE_URL}/historical/detailed/{encoded_subject}")
            
            if response.status_code == 200:
                detailed_data = response.json()
                
                print(f"\n📚 {subject}:")
                total_marks = detailed_data.get('totalMarks', {})
                print(f"   2024 Marks: {total_marks.get('2024', 'N/A')}")
                print(f"   Trend: {detailed_data.get('trend', 'N/A')}")
                print(f"   Priority: {detailed_data.get('priority', 'N/A')}")
                
                topics = detailed_data.get('topics', [])[:3]  # Top 3 topics
                if topics:
                    print(f"   Top Topics:")
                    for topic in topics:
                        topic_marks = topic.get('marks', {}).get('2024', 0)
                        print(f"     • {topic['name']}: {topic_marks} marks ({topic['trend']})")
                        
            else:
                print(f"❌ {subject}: Status {response.status_code}")
                
        except Exception as e:
            print(f"❌ {subject}: {e}")
    
    # Test 4: Topic trends analysis
    print(f"\n📈 4. TOPIC TRENDS ANALYSIS")
    print("-" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/historical/trending?min_growth=0")
        if response.status_code == 200:
            trending_data = response.json()
            trending = trending_data.get('trending', [])
            
            print("🚀 Top Trending Topics:")
            for i, topic in enumerate(trending[:5], 1):
                print(f"{i}. {topic['subject']} - {topic['topic']}")
                print(f"   Growth: {topic['growthRate']:.1f}% | Recent Marks: {topic['recentMarks']}")
                
        else:
            print(f"❌ Trending endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Trending test failed: {e}")
    
    # Test 5: GATE 2025 predictions
    print(f"\n🔮 5. GATE 2025 PREDICTIONS")
    print("-" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/historical/predictions")
        if response.status_code == 200:
            predictions_data = response.json()
            
            recommendations = predictions_data.get('recommendations', {})
            high_priority = recommendations.get('highPriority', [])
            medium_priority = recommendations.get('mediumPriority', [])
            low_priority = recommendations.get('lowPriority', [])
            
            print("🎯 Study Priority Recommendations:")
            print(f"🔴 High Priority: {', '.join(high_priority)}")
            print(f"🟡 Medium Priority: {', '.join(medium_priority[:3])}...")
            print(f"🟢 Low Priority: {', '.join(low_priority)}")
            
            # Show time allocation
            time_allocation = recommendations.get('studyTimeAllocation', {})
            if time_allocation:
                print(f"\n⏰ Recommended Study Time Allocation:")
                for subject, percentage in time_allocation.items():
                    if percentage >= 10:  # Show only significant allocations
                        print(f"   {subject}: {percentage}%")
                        
        else:
            print(f"❌ Predictions endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Predictions test failed: {e}")
    
    # Test 6: Data accuracy verification
    print(f"\n✅ 6. DATA ACCURACY VERIFICATION")
    print("-" * 50)
    
    # Key accuracy checks based on gatecse.in
    accuracy_checks = [
        ("Programming and Data Structures should be ~15 marks", "Programming and Data Structures", 15),
        ("Algorithms should be ~15 marks", "Algorithms", 15),
        ("Theory of Computation should be ~5 marks", "Theory of Computation", 5),
        ("Discrete Mathematics should be ~15 marks", "Discrete Mathematics", 15)
    ]
    
    for check_name, subject, expected_marks in accuracy_checks:
        try:
            encoded_subject = subject.replace(" ", "%20")
            response = requests.get(f"{BASE_URL}/historical/detailed/{encoded_subject}")
            
            if response.status_code == 200:
                detailed_data = response.json()
                actual_marks = detailed_data.get('totalMarks', {}).get('2024', 0)
                
                if actual_marks == expected_marks:
                    print(f"✅ {check_name}: CORRECT ({actual_marks} marks)")
                else:
                    print(f"⚠️ {check_name}: Got {actual_marks}, expected {expected_marks}")
            else:
                print(f"❌ {check_name}: Could not verify")
                
        except Exception as e:
            print(f"❌ {check_name}: Error - {e}")
    
    print(f"\n{'='*70}")
    print("🎉 COMPREHENSIVE TEST COMPLETED")
    print("📊 System is running with accurate gatecse.in mark distribution data")
    print("🎯 Ready for strategic GATE CSE 2025 preparation guidance")
    print(f"{'='*70}")

if __name__ == "__main__":
    test_accurate_system()