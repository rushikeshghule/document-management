# PowerShell script to start both frontend and backend services
# This script works around the limitation that PowerShell doesn't support && for command chaining

Write-Host "Starting Document Management System..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Start backend in a new PowerShell window
Write-Host "Starting Django backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python manage.py runserver"

# Give the backend some time to start up
Start-Sleep -Seconds 2

# Start frontend in a new PowerShell window
Write-Host "Starting Angular frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "`nServers are running in separate windows!" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:8000" -ForegroundColor White
Write-Host "- Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "`nPress Ctrl+C in each window to stop the servers when done." -ForegroundColor White 