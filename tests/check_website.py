#!/usr/bin/env python3
import requests
import json

print("🌐 GATE-COMPASS WEBSITE STATUS CHECK")
print("="*50)

# Check Frontend (try both ports)
frontend_working = False
frontend_url = ""

for port in [3000, 3001, 3002]:
    try:
        r = requests.get(f'http://localhost:{port}', timeout=3)
        if r.status_code == 200:
            print(f"✅ Frontend: Running on http://localhost:{port}")
            frontend_working = True
            frontend_url = f"http://localhost:{port}"
            break
    except:
        continue

if not frontend_working:
    print("❌ Frontend: Not accessible")

# Check Backend
try:
    r = requests.get('http://localhost:5000/api/auth/me', timeout=5)
    if r.status_code in [200, 401]:  # 401 is expected for auth endpoint
        print(f"✅ Backend API: Running on http://localhost:5000 (Status: {r.status_code})")
    else:
        print(f"⚠️ Backend API: Unexpected status {r.status_code}")
except Exception as e:
    print(f"❌ Backend API: Not accessible - {e}")

# Check ML Service
try:
    r = requests.get('http://localhost:8000/health', timeout=5)
    if r.status_code == 200:
        print(f"✅ ML Service: Running on http://localhost:8000")
    else:
        print(f"❌ ML Service: Status {r.status_code}")
except Exception as e:
    print(f"❌ ML Service: Not accessible - {e}")

# Test Topic Analysis API
try:
    r = requests.get('http://localhost:8000/topic-wise/analysis', timeout=10)
    if r.status_code == 200:
        data = r.json()
        topics = len(data.get('topics', {}))
        print(f"✅ Topic Analysis: {topics} topics available")
    else:
        print(f"❌ Topic Analysis: Status {r.status_code}")
except Exception as e:
    print(f"❌ Topic Analysis: Error - {e}")

print("\n" + "="*50)
if frontend_working:
    print(f"🎉 WEBSITE IS RUNNING!")
    print(f"🌐 Access your Gate-Compass at: {frontend_url}")
    print("📊 Features available:")
    print("   • Topic Analysis Dashboard")
    print("   • Study Recommendations") 
    print("   • Mock Tests")
    print("   • User Authentication")
    print("   • Enhanced Analytics")
else:
    print("❌ WEBSITE IS NOT RUNNING")
    print("🔧 Try restarting the frontend service")

print(f"\n📋 Service URLs:")
if frontend_working:
    print(f"   Frontend: {frontend_url}")
print(f"   Backend:  http://localhost:5000")
print(f"   ML API:   http://localhost:8000")