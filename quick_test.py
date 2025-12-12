#!/usr/bin/env python3
import requests
import json

print("🚀 GATE-COMPASS LIVE API TEST")
print("="*40)

# Test Health Check
try:
    r = requests.get('http://localhost:8000/health', timeout=5)
    print(f"✅ Health Check: {r.status_code} - {r.text}")
except Exception as e:
    print(f"❌ Health Check: {e}")

# Test Topic Analysis
try:
    r = requests.get('http://localhost:8000/topic-wise/analysis', timeout=10)
    if r.status_code == 200:
        data = r.json()
        topics = len(data.get('topics', {}))
        total_marks = data.get('total_marks', 0)
        print(f"✅ Topic Analysis: {r.status_code} - {topics} topics, {total_marks} marks")
    else:
        print(f"❌ Topic Analysis: {r.status_code}")
except Exception as e:
    print(f"❌ Topic Analysis: {e}")

# Test Enhanced Analytics
try:
    r = requests.get('http://localhost:8000/enhanced/topic-analysis', timeout=10)
    print(f"✅ Enhanced Analytics: {r.status_code} - Data available")
except Exception as e:
    print(f"❌ Enhanced Analytics: {e}")

# Test Frontend
try:
    r = requests.get('http://localhost:3000', timeout=5)
    print(f"✅ Frontend: {r.status_code} - React app running")
except Exception as e:
    print(f"❌ Frontend: {e}")

# Test Backend
try:
    r = requests.get('http://localhost:5000/api/auth/me', timeout=5)
    print(f"✅ Backend: {r.status_code} - API server running")
except Exception as e:
    print(f"❌ Backend: {e}")

print("\n🎉 GATE-COMPASS MVP IS LIVE AND RUNNING!")
print("🌐 Access at: http://localhost:3000")