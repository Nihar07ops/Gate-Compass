#!/bin/bash

# Gate-Compass MVP Deployment Script
# Quick setup and deployment for production

echo "🚀 Gate-Compass MVP Deployment"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."

# Root dependencies
npm install

# Frontend dependencies
echo "📱 Installing frontend dependencies..."
cd client
npm install
cd ..

# Backend dependencies
echo "🔧 Installing backend dependencies..."
cd server
npm install
cd ..

# ML service dependencies
echo "🤖 Installing ML service dependencies..."
cd ml_service
if command -v python3 &> /dev/null; then
    python3 -m pip install -r requirements.txt
else
    python -m pip install -r requirements.txt
fi
cd ..

echo "✅ All dependencies installed"

# Build frontend for production
echo "🏗️ Building frontend for production..."
cd client
npm run build
cd ..

echo "✅ Frontend built successfully"

# Create production start script
cat > start_production.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Gate-Compass Production Services..."

# Start ML service in background
cd ml_service
if command -v python3 &> /dev/null; then
    python3 app.py &
else
    python app.py &
fi
ML_PID=$!
cd ..

# Start backend in background
cd server
node server-inmemory.js &
BACKEND_PID=$!
cd ..

# Start frontend
cd client
npm run preview &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:4173"
echo "🔧 Backend: http://localhost:5000"
echo "🤖 ML Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $ML_PID $BACKEND_PID $FRONTEND_PID; exit' INT
wait
EOF

chmod +x start_production.sh

# Create development start script
cat > start_development.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Gate-Compass Development Services..."

# Start ML service in background
cd ml_service
if command -v python3 &> /dev/null; then
    python3 app.py &
else
    python app.py &
fi
ML_PID=$!
cd ..

# Start backend in background
cd server
node server-inmemory.js &
BACKEND_PID=$!
cd ..

# Start frontend in development mode
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started in development mode!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "🤖 ML Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $ML_PID $BACKEND_PID $FRONTEND_PID; exit' INT
wait
EOF

chmod +x start_development.sh

# Run system test
echo "🧪 Running system test..."
if command -v python3 &> /dev/null; then
    python3 test_complete_system.py
else
    python test_complete_system.py
fi

echo ""
echo "🎉 Gate-Compass MVP Deployment Complete!"
echo "========================================"
echo ""
echo "🚀 To start in production mode:"
echo "   ./start_production.sh"
echo ""
echo "🔧 To start in development mode:"
echo "   ./start_development.sh"
echo ""
echo "📖 For detailed deployment guide:"
echo "   See MVP_DEPLOYMENT_GUIDE.md"
echo ""
echo "✅ Your Gate-Compass MVP is ready for production!"