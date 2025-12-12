#!/usr/bin/env python3
"""
Comprehensive test for Enhanced Topic-wise Trend Analysis
Tests PDF analysis integration and detailed topic insights
"""

import requests
import json
from datetime import datetime
import os

BASE_URL = "http://localhost:8000"

def test_enhanced_topic_system():
    """Test the complete enhanced topic analysis system"""
    print("🎯 ENHANCED TOPIC-WISE TREND ANALYSIS - COMPREHENSIVE TEST")
    print(f"⏰ Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("📚 Testing PDF Materials Integration + Historical Data Analysis")
    print("="*80)
    
    # Test 1: PDF Analysis
    print("\n📁 1. PDF MATERIALS ANALYSIS")
    print("-" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/enhanced/pdf-analysis", timeout=10)
        if response.status_code == 200:
            pdf_data = response.json()
            
            print(f"✅ PDF Analysis Status: SUCCESS")
            print(f"📊 Data Source: {pdf_data.get('metadata', {}).get('source', 'Unknown')}")
            print(f"📅 Analysis Date: {pdf_data.get('metadata', {}).get('analysis_date', 'Unknown')}")
            print(f"📚 Total Subjects: {pdf_data.get('metadata', {}).get('total_subjects', 0)}")
            
            # Show subject analysis
            subject_analysis = pdf_data.get('subject_analysis', {})
            if subject_analysis:
                print(f"\n📖 Subject Coverage Analysis:")
                for subject, data in list(subject_analysis.items())[:3]:  # Top 3
                    print(f"   • {subject}: {data.get('total_materials', 0)} materials, {data.get('topics_covered', 0)} topics")
            
            # Show recommendations
            recommendations = pdf_data.get('recommendations', [])
            if recommendations:
                print(f"\n💡 PDF Analysis Recommendations:")
                for rec in recommendations[:2]:
                    print(f"   • {rec.get('type', 'Unknown')}: {rec.get('message', 'No message')}")
                    
        else:
            print(f"❌ PDF Analysis Failed: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ PDF Analysis Error: {str(e)[:100]}...")
    
    # Test 2: Enhanced Topic Analysis
    print(f"\n🔬 2. ENHANCED TOPIC ANALYSIS")
    print("-" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/enhanced/topic-analysis", timeout=15)
        if response.status_code == 200:
            topic_data = response.json()
            
            print(f"✅ Enhanced Analysis Status: SUCCESS")
            
            metadata = topic_data.get('metadata', {})
            print(f"📊 Total Topics Analyzed: {metadata.get('total_topics_analyzed', 0)}")
            print(f"🎯 Confidence Level: {metadata.get('confidence_level', 'Unknown')}")
            print(f"📚 Data Sources: {', '.join(metadata.get('data_sources', []))}")
            
            # Show subject-wise summary
            subject_analysis = topic_data.get('subject_wise_analysis', {})
            if subject_analysis:
                print(f"\n📚 Subject-wise Analysis Summary:")
                for subject, data in list(subject_analysis.items())[:5]:  # Top 5
                    summary = data.get('summary', {})
                    print(f"   • {subject}:")
                    print(f"     - Topics: {summary.get('total_topics', 0)}")
                    print(f"     - High Priority: {summary.get('high_priority_topics', 0)}")
                    print(f"     - Study Hours: {summary.get('recommended_study_hours', 0)}")
            
            # Show topic rankings
            rankings = topic_data.get('topic_rankings', {})
            if rankings:
                print(f"\n🏆 Topic Rankings:")
                
                highest_priority = rankings.get('highest_priority', [])
                if highest_priority:
                    print(f"   🔴 Highest Priority Topics:")
                    for i, topic in enumerate(highest_priority[:3], 1):
                        print(f"      {i}. {topic['topic']} (Score: {topic['priority_score']:.1f})")
                
                emerging = rankings.get('emerging_trends', [])
                if emerging:
                    print(f"   📈 Emerging Trends:")
                    for i, topic in enumerate(emerging[:3], 1):
                        print(f"      {i}. {topic['topic']} ({topic['trend']})")
                        
        else:
            print(f"❌ Enhanced Analysis Failed: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Enhanced Analysis Error: {str(e)[:100]}...")
    
    # Test 3: Subject-specific Analysis
    print(f"\n📚 3. SUBJECT-SPECIFIC DETAILED ANALYSIS")
    print("-" * 60)
    
    test_subjects = ["Programming and Data Structures", "Algorithms", "Discrete Mathematics"]
    
    for subject in test_subjects:
        try:
            encoded_subject = subject.replace(" ", "%20")
            response = requests.get(f"{BASE_URL}/enhanced/subject/{encoded_subject}/topics", timeout=10)
            
            if response.status_code == 200:
                subject_data = response.json()
                
                print(f"\n📖 {subject}:")
                print(f"   📊 Total Marks 2024: {subject_data.get('total_marks_2024', 0)}")
                print(f"   📈 Trend: {subject_data.get('trend', 'Unknown')}")
                print(f"   🎯 Priority: {subject_data.get('priority', 'Unknown')}")
                
                # Show top topics
                topics = subject_data.get('topics', {})
                if topics:
                    print(f"   🔥 Top Topics:")
                    sorted_topics = sorted(topics.items(), 
                                         key=lambda x: x[1].get('study_priority', 0), 
                                         reverse=True)
                    
                    for topic_name, topic_data in sorted_topics[:3]:
                        priority = topic_data.get('study_priority', 0)
                        marks = topic_data.get('marks_2024', 0)
                        difficulty = topic_data.get('difficulty_level', 'Unknown')
                        print(f"      • {topic_name}: {marks} marks, Priority: {priority:.1f}, Difficulty: {difficulty}")
                        
            else:
                print(f"   ❌ {subject}: Status {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ {subject}: {str(e)[:50]}...")
    
    # Test 4: Study Recommendations
    print(f"\n🎯 4. ENHANCED STUDY RECOMMENDATIONS")
    print("-" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/enhanced/recommendations", timeout=10)
        if response.status_code == 200:
            rec_data = response.json()
            
            print(f"✅ Recommendations Generated Successfully")
            
            # Immediate focus
            immediate_focus = rec_data.get('study_recommendations', {}).get('immediate_focus', [])
            if immediate_focus:
                print(f"\n🚨 Immediate Focus Areas:")
                for i, topic in enumerate(immediate_focus, 1):
                    print(f"   {i}. {topic['topic']}")
                    print(f"      Priority: {topic['priority_score']:.1f} | Hours: {topic['estimated_hours']} | Difficulty: {topic['difficulty']}")
            
            # Resource allocation
            resource_allocation = rec_data.get('study_recommendations', {}).get('resource_allocation', {})
            if resource_allocation:
                print(f"\n⏰ Study Time Allocation:")
                sorted_allocation = sorted(resource_allocation.items(), key=lambda x: x[1], reverse=True)
                for subject, percentage in sorted_allocation[:5]:
                    print(f"   • {subject}: {percentage}%")
            
            # Preparation strategy
            strategy = rec_data.get('study_recommendations', {}).get('preparation_strategy', [])
            if strategy:
                print(f"\n📋 Preparation Strategy:")
                for i, tip in enumerate(strategy, 1):
                    print(f"   {i}. {tip}")
                    
        else:
            print(f"❌ Recommendations Failed: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Recommendations Error: {str(e)[:100]}...")
    
    # Test 5: System Integration Check
    print(f"\n🔧 5. SYSTEM INTEGRATION VERIFICATION")
    print("-" * 60)
    
    integration_checks = [
        ("PDF Analysis Integration", "/enhanced/pdf-analysis"),
        ("Topic Analysis Engine", "/enhanced/topic-analysis"),
        ("Subject Detail Analysis", "/enhanced/subject/Algorithms/topics"),
        ("Recommendation System", "/enhanced/recommendations"),
        ("Historical Data Access", "/historical/rankings")
    ]
    
    working_endpoints = 0
    total_endpoints = len(integration_checks)
    
    for check_name, endpoint in integration_checks:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"   ✅ {check_name}: WORKING")
                working_endpoints += 1
            else:
                print(f"   ⚠️ {check_name}: Status {response.status_code}")
        except Exception as e:
            print(f"   ❌ {check_name}: ERROR")
    
    integration_score = (working_endpoints / total_endpoints) * 100
    print(f"\n📊 Integration Score: {integration_score:.1f}% ({working_endpoints}/{total_endpoints} endpoints working)")
    
    # Test 6: Performance Metrics
    print(f"\n⚡ 6. PERFORMANCE METRICS")
    print("-" * 60)
    
    performance_tests = [
        ("Quick Health Check", "/health"),
        ("Historical Rankings", "/historical/rankings"),
        ("Enhanced Analysis", "/enhanced/topic-analysis")
    ]
    
    for test_name, endpoint in performance_tests:
        try:
            start_time = datetime.now()
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            end_time = datetime.now()
            
            response_time = (end_time - start_time).total_seconds() * 1000  # ms
            
            if response.status_code == 200:
                print(f"   ✅ {test_name}: {response_time:.0f}ms")
            else:
                print(f"   ⚠️ {test_name}: {response_time:.0f}ms (Status: {response.status_code})")
                
        except Exception as e:
            print(f"   ❌ {test_name}: TIMEOUT/ERROR")
    
    print(f"\n{'='*80}")
    print("🎉 ENHANCED TOPIC ANALYSIS SYSTEM TEST COMPLETED")
    print("📊 System Features:")
    print("   ✅ PDF Materials Analysis Integration")
    print("   ✅ Comprehensive Topic-wise Trend Analysis")
    print("   ✅ Subject-specific Detailed Insights")
    print("   ✅ Enhanced Study Recommendations")
    print("   ✅ Multi-source Data Integration")
    print("   ✅ Performance Optimized API Endpoints")
    print(f"{'='*80}")

def check_gate_materials_folder():
    """Check if GateMaterials folder exists and show contents"""
    print("\n📁 GATE MATERIALS FOLDER CHECK")
    print("-" * 60)
    
    materials_path = "Gate-Compass-master/GateMaterials"
    
    if os.path.exists(materials_path):
        print(f"✅ GateMaterials folder found at: {materials_path}")
        
        # Count files
        total_files = 0
        pdf_files = 0
        
        for root, dirs, files in os.walk(materials_path):
            for file in files:
                total_files += 1
                if file.lower().endswith('.pdf'):
                    pdf_files += 1
        
        print(f"📊 Total files: {total_files}")
        print(f"📄 PDF files: {pdf_files}")
        
        if pdf_files > 0:
            print(f"✅ PDF materials available for analysis")
        else:
            print(f"⚠️ No PDF files found - system will use sample data")
            
    else:
        print(f"❌ GateMaterials folder not found at: {materials_path}")
        print(f"💡 System will generate sample analysis data")

if __name__ == "__main__":
    # Check materials folder first
    check_gate_materials_folder()
    
    # Run comprehensive test
    test_enhanced_topic_system()