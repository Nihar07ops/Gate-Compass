#!/usr/bin/env python3
"""
Test script to verify the accurate GATE CSE data is loaded correctly
"""

import requests
import json
from datetime import datetime

def test_accurate_data():
    """Test if the accurate gatecse.in data is being used"""
    print("🔍 Testing Accurate GATE CSE Data Loading")
    print(f"⏰ Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Test direct data file
    try:
        with open('ml_service/data/gate_historical_trends_data.json', 'r') as f:
            data = json.load(f)
        
        print("📁 Direct File Check:")
        print(f"✅ Data Source: {data.get('metadata', {}).get('source', 'Unknown')}")
        print(f"✅ Data Accuracy: {data.get('metadata', {}).get('dataAccuracy', 'Unknown')}")
        print(f"✅ Total Subjects: {len(data.get('subjects', {}))}")
        
        # Check specific subject data
        prog_ds = data.get('subjects', {}).get('Programming and Data Structures', {})
        if prog_ds:
            print(f"✅ Programming & DS 2024 marks: {prog_ds.get('totalMarks', {}).get('2024', 'N/A')}")
            print(f"✅ Programming & DS trend: {prog_ds.get('trend', 'N/A')}")
        
        print("\n📊 Subject List from File:")
        for i, subject in enumerate(data.get('subjects', {}).keys(), 1):
            marks_2024 = data['subjects'][subject].get('totalMarks', {}).get('2024', 0)
            trend = data['subjects'][subject].get('trend', 'N/A')
            print(f"{i}. {subject}: {marks_2024} marks ({trend})")
            
    except Exception as e:
        print(f"❌ File Error: {e}")
    
    # Test API endpoint
    print(f"\n{'='*60}")
    print("🌐 API Endpoint Check:")
    
    try:
        response = requests.get("http://localhost:8000/historical/rankings", timeout=5)
        if response.status_code == 200:
            api_data = response.json()
            rankings = api_data.get('rankings', [])
            
            print("✅ API Response received")
            print(f"✅ Number of subjects: {len(rankings)}")
            
            print("\n📊 Top 5 Subjects from API:")
            for i, subject in enumerate(rankings[:5], 1):
                print(f"{i}. {subject['subject']}: {subject['marks2024']} marks ({subject['trend']})")
                
            # Check if we're getting the accurate data
            if any('Programming and Data Structures' in s['subject'] for s in rankings):
                print("✅ Accurate subject names detected")
            else:
                print("⚠️ Old subject names still in use")
                
        else:
            print(f"❌ API Error: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ API Error: {e}")
    
    # Test specific accurate data points
    print(f"\n{'='*60}")
    print("🎯 Accuracy Verification:")
    
    try:
        response = requests.get("http://localhost:8000/historical/detailed/Programming%20and%20Data%20Structures", timeout=5)
        if response.status_code == 200:
            detailed_data = response.json()
            print("✅ Detailed analysis endpoint working")
            
            subject_name = detailed_data.get('subject', 'Unknown')
            total_marks = detailed_data.get('totalMarks', {})
            
            print(f"📚 Subject: {subject_name}")
            if '2024' in total_marks:
                print(f"📊 2024 Marks: {total_marks['2024']}")
                
                # Verify this matches our accurate data (should be 15, not 32)
                if total_marks['2024'] == 15:
                    print("✅ ACCURATE DATA CONFIRMED - Using gatecse.in values")
                elif total_marks['2024'] == 32:
                    print("⚠️ OLD DATA DETECTED - Still using previous estimates")
                else:
                    print(f"❓ UNKNOWN DATA - Unexpected value: {total_marks['2024']}")
            
        else:
            print(f"❌ Detailed API Error: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Detailed API Error: {e}")
    
    print(f"\n{'='*60}")
    print("🎯 SUMMARY:")
    print("Expected accurate values based on gatecse.in:")
    print("- Programming & Data Structures: 15 marks (not 32)")
    print("- Algorithms: 15 marks (not 26)")
    print("- Theory of Computation: 5 marks (not 14)")
    print("- All subjects should total ~100 marks")
    print(f"{'='*60}")

if __name__ == "__main__":
    test_accurate_data()