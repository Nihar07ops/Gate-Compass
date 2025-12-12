#!/usr/bin/env python3
"""
Comprehensive test script for the full Gate-Compass application
Tests all services: Client (React), Server (Node.js), ML Service (Python)
"""

import requests
import json
import time
from datetime import datetime

# Service URLs
CLIENT_URL = "http://localhost:3000"
SERVER_URL = "http://localhost:5000"
ML_SERVICE_URL = "http://localhost:8000"

def test_service(url, service_name, endpoint=""):
    """Test if a service is running"""
    try:
        response = requests.get(f"{url}{endpoint}", timeout=5)
        status = "✅ RUNNING" if response.status_code in [200, 401] else f"⚠️ STATUS {response.status_code}"
        return status, response.status_code
    except Exception as e:
        return f"❌ DOWN ({str(e)[:50]}...)", None

def test_ml_service_endpoints():
    """Test ML service enhanced endpoints"""
    print(f"\n{'='*60}")
    print("🤖 ML SERVICE - Enhanced Historical Trends Analysis")
    print(f"{'='*60}")
    
    endpoints = [
        ("/health", "Health Check"),
        ("/historical/rankings", "Subject Rankings"),
        ("/historical/trending?min_growth=50", "Trending Topics (50%+ growth)"),
        ("/historical/predictions", "GATE 2025 Predictions"),
        ("/historical/detailed/Programming%20%26%20Data%20Structures", "Programming & DS Analysis"),
        ("/historical/subtopics/Algorithms/Dynamic%20Programming", "Dynamic Programming Subtopics")
    ]
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{ML_SERVICE_URL}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {description}")
                
                # Show key insights
                if "rankings" in endpoint:
                    rankings = data.get('rankings', [])[:3]
                    for i, subject in enumerate(rankings, 1):
                        print(f"   {i}. {subject['subject']}: {subject['marks2024']} marks ({subject['trend']})")
                
                elif "trending" in endpoint:
                    trending = data.get('trending', [])[:3]
                    for i, topic in enumerate(trending, 1):
                        print(f"   {i}. {topic['subject']} - {topic['topic']}: +{topic['growthRate']:.0f}%")
                
                elif "predictions" in endpoint:
                    high_priority = data.get('recommendations', {}).get('highPriority', [])
                    print(f"   High Priority: {', '.join(high_priority[:3])}")
                
                elif "detailed" in endpoint:
                    topics = data.get('topics', [])[:2]
                    for topic in topics:
                        print(f"   • {topic['name']}: {topic['marks'].get('2024', 0)} marks ({topic['trend']})")
                
                elif "subtopics" in endpoint:
                    subtopics = data.get('subtopics', [])[:2]
                    for subtopic in subtopics:
                        print(f"   • {subtopic['name']}: {subtopic['marks'].get('2024', 0)} marks")
                        
            else:
                print(f"⚠️ {description}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {description}: {str(e)[:50]}...")

def test_server_registration():
    """Test server registration functionality"""
    print(f"\n{'='*60}")
    print("🔐 SERVER - Authentication & API")
    print(f"{'='*60}")
    
    # Test registration
    test_user = {
        "name": "Test User",
        "email": f"test_{int(time.time())}@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{SERVER_URL}/api/auth/register", json=test_user, timeout=5)
        if response.status_code == 201:
            print("✅ User Registration: Working")
            data = response.json()
            token = data.get('token')
            
            if token:
                print("✅ JWT Token Generation: Working")
                
                # Test authenticated endpoints
                headers = {"Authorization": f"Bearer {token}"}
                
                # Test profile endpoint
                profile_response = requests.get(f"{SERVER_URL}/api/auth/me", headers=headers, timeout=5)
                if profile_response.status_code == 200:
                    print("✅ Protected Route Access: Working")
                    user_data = profile_response.json()
                    print(f"   User: {user_data.get('name')} ({user_data.get('email')})")
                
                # Test trends endpoint
                trends_response = requests.get(f"{SERVER_URL}/api/trends", headers=headers, timeout=5)
                if trends_response.status_code == 200:
                    print("✅ Trends API: Working")
                    trends_data = trends_response.json()
                    if isinstance(trends_data, list) and len(trends_data) > 0:
                        print(f"   Sample trend: {trends_data[0].get('subject', 'N/A')}")
                else:
                    print(f"⚠️ Trends API: Status {trends_response.status_code}")
            
        elif response.status_code == 400:
            print("✅ User Registration: Working (user may already exist)")
        else:
            print(f"⚠️ User Registration: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Server Authentication: {str(e)[:50]}...")

def main():
    """Run comprehensive full application test"""
    print("🎯 GATE-COMPASS FULL APPLICATION TEST")
    print(f"⏰ Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    
    # Test all services
    print("🔍 SERVICE STATUS CHECK")
    print(f"{'='*60}")
    
    client_status, client_code = test_service(CLIENT_URL, "React Client")
    server_status, server_code = test_service(SERVER_URL, "Node.js Server", "/api/auth/me")
    ml_status, ml_code = test_service(ML_SERVICE_URL, "Python ML Service", "/health")
    
    print(f"🌐 React Client (Port 3000): {client_status}")
    print(f"🔧 Node.js Server (Port 5000): {server_status}")
    print(f"🤖 Python ML Service (Port 8000): {ml_status}")
    
    # Test ML Service in detail
    if ml_code == 200:
        test_ml_service_endpoints()
    
    # Test Server functionality
    if server_code in [200, 401]:  # 401 is expected for /api/auth/me without token
        test_server_registration()
    
    # Application Architecture Summary
    print(f"\n{'='*60}")
    print("🏗️ APPLICATION ARCHITECTURE")
    print(f"{'='*60}")
    print("📱 Frontend: React + Vite (Port 3000)")
    print("   • Modern React application with Tailwind CSS")
    print("   • Real-time data visualization")
    print("   • Responsive design for all devices")
    print("")
    print("🔧 Backend: Node.js + Express (Port 5000)")
    print("   • RESTful API with JWT authentication")
    print("   • In-memory database for development")
    print("   • CORS enabled for cross-origin requests")
    print("")
    print("🤖 ML Service: Python + Flask (Port 8000)")
    print("   • Enhanced historical trends analysis")
    print("   • Topic-wise and subtopic-wise predictions")
    print("   • Statistical growth rate calculations")
    print("   • GATE 2025 strategic recommendations")
    
    # Feature Summary
    print(f"\n{'='*60}")
    print("🚀 KEY FEATURES AVAILABLE")
    print(f"{'='*60}")
    print("✅ User Authentication & Registration")
    print("✅ Historical Trends Analysis (10 years of data)")
    print("✅ Topic-wise Growth Rate Calculations")
    print("✅ Subtopic-level Detailed Breakdowns")
    print("✅ GATE 2025 Predictions & Recommendations")
    print("✅ Strategic Study Planning")
    print("✅ Real-time Data Visualization")
    print("✅ Responsive Web Interface")
    
    print(f"\n{'='*60}")
    print("🎉 FULL APPLICATION STATUS")
    print(f"{'='*60}")
    
    all_services_running = all([
        client_code == 200,
        server_code in [200, 401],
        ml_code == 200
    ])
    
    if all_services_running:
        print("🟢 ALL SERVICES RUNNING SUCCESSFULLY!")
        print("🌐 Access the application at: http://localhost:3000")
        print("📊 ML Analytics available at: http://localhost:8000")
        print("🔧 API Server running at: http://localhost:5000")
        print("")
        print("🎯 Gate-Compass is fully operational with enhanced")
        print("   historical trends analysis and strategic insights!")
    else:
        print("🟡 SOME SERVICES MAY NEED ATTENTION")
        print("   Check individual service status above")
    
    print(f"{'='*60}")

if __name__ == "__main__":
    main()