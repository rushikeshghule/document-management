Write-Host "Starting Document Management System..." -ForegroundColor Cyan

# Start the backend server
Write-Host "Starting Django backend server..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd $PWD/backend; python manage.py runserver"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 2

# Start the frontend application
Write-Host "Starting Angular frontend application..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd $PWD/frontend; npm start"

Write-Host "Services started! Access the application at http://localhost:4200" -ForegroundColor Yellow
Write-Host "Backend API is available at http://localhost:8000" -ForegroundColor Yellow 