# Document Management System

A comprehensive document management system with Django backend and Angular frontend.

## Features

- **User Authentication**: Secure login and registration system
- **Document Upload**: Support for various file types (PDF, Word, TXT, etc.)
- **Document Viewing**: View documents directly in the browser
- **Dashboard**: Overview of recent documents and activity
- **User Management**: Admin interface for user administration
- **Recent Files**: Quick access to recently viewed documents
- **Settings**: User profile and application settings

## Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL (configurable)
- Python PDF/Document processing libraries

### Frontend
- Angular
- Bootstrap 5
- TypeScript
- RxJS

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm 6+

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Usage

1. Access the backend API at: `http://localhost:8000/api/`
2. Access the frontend application at: `http://localhost:4200/`

## API Endpoints

- `/api/documents/` - Document CRUD operations
- `/api/documents/recent/` - Recently accessed documents
- `/api/users/` - User management (admin only)
- `/api/auth/` - Authentication endpoints

## Screenshots

*Screenshots coming soon*

## License

MIT

## Contributors

- Rushikesh Ghule 