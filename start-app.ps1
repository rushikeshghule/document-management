# Start-App.ps1 - Script to start both frontend and backend
# Usage: .\start-app.ps1

# Setup Python environment first
Write-Host "Setting up Python environment..." -ForegroundColor Cyan

# Check if Python is installed
$pythonExists = $null
try {
    $pythonExists = Get-Command python -ErrorAction SilentlyContinue
} catch {
    $pythonExists = $null
}

if (-not $pythonExists) {
    Write-Host "Python not found. Please install Python from https://www.python.org/downloads/" -ForegroundColor Red
    Write-Host "Ensure Python is added to PATH during installation." -ForegroundColor Yellow
    exit 1
}

# Start Backend server
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\backend"
    python manage.py runserver
}

Write-Host "Starting backend server at http://127.0.0.1:8000..." -ForegroundColor Green

# Start Frontend server
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\frontend"
    npm start
}

Write-Host "Starting frontend server at http://localhost:4200..." -ForegroundColor Green

# Display job output
Write-Host "`nBackend logs:" -ForegroundColor Cyan
Receive-Job -Job $backendJob -Wait -AutoRemoveJob

Write-Host "`nFrontend logs:" -ForegroundColor Cyan
Receive-Job -Job $frontendJob -Wait -AutoRemoveJob

# Keep script running
try {
    Write-Host "Press Ctrl+C to stop servers..." -ForegroundColor Yellow
    Wait-Event -Timeout ([int]::MaxValue)
} 
finally {
    # Clean up jobs
    if ($backendJob) { Remove-Job -Job $backendJob -Force }
    if ($frontendJob) { Remove-Job -Job $frontendJob -Force }
    Write-Host "Servers stopped" -ForegroundColor Red
} 