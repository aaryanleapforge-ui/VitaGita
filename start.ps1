# Gita Admin Panel - Start Script
# This script starts both backend and frontend servers

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gita Admin Panel - Starting...  " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "Node.js version: " -NoNewline
node --version
Write-Host ""

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    cd client
    npm install
    cd ..
}

# Check if data directory exists
if (-not (Test-Path "server\data")) {
    Write-Host ""
    Write-Host "WARNING: Data directory not found!" -ForegroundColor Yellow
    Write-Host "Creating data directory..." -ForegroundColor Yellow
    New-Item -Path "server\data" -ItemType Directory -Force | Out-Null
    Write-Host "Please copy your shlok and video data:" -ForegroundColor Cyan
    Write-Host "  copy ..\gita_app_final\assets\shlok_data.json server\data\shloks.json" -ForegroundColor White
    Write-Host "  copy ..\gita_app_final\assets\video_links.json server\data\videos.json" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Backend Server..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Backend Server' -ForegroundColor Green; npm start"

# Wait a bit for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Admin Panel is Starting!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Email:    admin@gitagita.com" -ForegroundColor White
Write-Host "  Password: Admin@123456" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
