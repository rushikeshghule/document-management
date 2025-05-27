# restart-app.ps1 - Script to restart the document management application

# Set the current directory
$projectRoot = $PSScriptRoot

# Stop any running processes (add more specific process names if needed)
Write-Host "Stopping any running processes..." -ForegroundColor Yellow
# Add Stop-Process commands here if needed

# Apply migrations to the backend
Write-Host "Applying database migrations..." -ForegroundColor Green
Set-Location "$projectRoot\backend"
python manage.py migrate

# Start the backend server in a new PowerShell window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; python manage.py runserver"

# Start the frontend server in a new PowerShell window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\frontend'; npm start -- --port 4200"

Write-Host "Application started successfully!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:4200" -ForegroundColor White