#!/usr/bin/env python3
import requests
import json

print("🔍 Testing Historical Trends API")
print("="*40)

try:
    response = requests.get('http://localhost:8000/historical-trends/gate-cse', timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"✅ API Status: {response.status_code}")
        print(f"📊 Subjects Analyzed: {len(data['subjects'])}")
        print(f"📅 Years Covered: {len(data['years'])} ({data['years'][0]}-{data['years'][-1]})")
        print(f"📈 Total Average Marks: {data['statistics']['totalMarks']:.1f}")
        print(f"🚀 Trending Up Subjects: {data['statistics']['trendingUp']}")
        
        print(f"\n🏆 Top 3 Subjects by Average Marks:")
        for i, subject in enumerate(data['statistics']['topSubjects'][:3], 1):
            print(f"   {i}. {subject['name']}: {subject['avgMarks']:.1f} marks")
        
        print(f"\n📋 Data Source: {data['metadata']['source']}")
        print(f"✅ Historical Trends API is working perfectly!")
        
    else:
        print(f"❌ API Error: Status {response.status_code}")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")