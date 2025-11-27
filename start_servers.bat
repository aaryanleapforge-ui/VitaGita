@echo off
echo ========================================
echo   Gita Admin Panel - Starting Servers
echo ========================================
echo.

echo Starting Backend Server (Port 5000)...
start "Gita Backend" cmd /k "cd server && node index.js"
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3000)...
start "Gita Frontend" cmd /k "cd client && npm start"

echo.
echo ========================================
echo   Servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login: admin@gitagita.com
echo Pass:  Admin@123456
echo.
echo Press any key to exit this window...
pause > nul
