#!/bin/bash

# Start both backend and frontend in the background
echo "🚀 Starting Kinna in development mode..."

# Start PostgreSQL if not running
if ! pgrep -x "postgres" > /dev/null; then
    echo "📦 Starting PostgreSQL..."
    sudo service postgresql start
    sleep 2
fi

# Start backend
echo "🔧 Starting backend API..."
cd packages/backend && npm run dev > /tmp/kinna-backend.log 2>&1 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend && npm run dev > /tmp/kinna-frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Kinna is running!"
echo "📝 Backend:  http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📋 Backend PID: $BACKEND_PID"
echo "📋 Frontend PID: $FRONTEND_PID"
echo ""
echo "📊 Logs:"
echo "  Backend:  tail -f /tmp/kinna-backend.log"
echo "  Frontend: tail -f /tmp/kinna-frontend.log"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
