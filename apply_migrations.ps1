# apply_migrations.ps1
# Script to apply Django migrations

Write-Host "Applying database migrations..." -ForegroundColor Green
cd backend
python manage.py migrate

Write-Host "Creating a superuser for testing..." -ForegroundColor Green
Write-Host "When prompted, enter email: admin@example.com and password: adminpassword"
python manage.py createsuperuser

Write-Host "Migrations applied successfully!" -ForegroundColor Cyan 