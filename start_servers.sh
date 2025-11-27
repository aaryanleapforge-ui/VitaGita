#!/bin/bash

echo "========================================"
echo "  Gita Admin Panel - Starting Servers"
echo "========================================"
echo ""

echo "Starting Backend Server (Port 5000)..."
cd server
node index.js &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend Server (Port 3000)..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  Servers are running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Login: admin@gitagita.com"
echo "Pass:  Admin@123456"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
