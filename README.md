# DocVault - Document Management System

A comprehensive document management system built with Django backend and Angular frontend. This system allows users to securely upload, view, organize, and manage documents with a modern UI and role-based access control.

![DocVault](https://img.shields.io/badge/DocVault-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Features

- **User Authentication**: Secure JWT-based authentication system with login/register functionality
- **Role-Based Access Control**: Admin, Editor, and Viewer roles with appropriate permissions
- **Document Management**:
  - Upload documents (PDF, Word, TXT, etc.)
  - View documents directly in the browser
  - Extract and index document content
  - Track document access history
- **Dashboard**: Overview of recent documents and system activity
- **User Management**: Admin interface for user administration
- **Recent Files**: Quick access to recently viewed documents
- **Settings**: Customizable user profile and application settings
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Backend
- **Django 5.0+**: Modern Python web framework
- **Django REST Framework**: Powerful API toolkit
- **PostgreSQL** (configurable, SQLite for development)
- **JWT Authentication**: Secure token-based authentication
- **Document Processing**:
  - PyPDF2 for PDF processing
  - python-docx for Word documents
  - Text extraction and content indexing

### Frontend
- **Angular 19+**: Progressive JavaScript framework
- **Bootstrap 5**: Responsive UI components
- **TypeScript**: Type-safe JavaScript
- **RxJS**: Reactive programming
- **PDF.js**: PDF rendering in browser
- **NgBootstrap**: Angular components for Bootstrap

### DevOps
- **GitHub Actions**: CI/CD pipeline
- **Docker**: Containerization (optional)
- **Nginx**: Production web server (optional)

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+ with pip
- Node.js 14+ with npm
- Git

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/rushikeshghule/document-management.git
cd document-management

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

# Set up environment variables (copy .env.example to .env and edit)
# cp .env.example .env  # Uncomment and edit if .env.example exists

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
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

## 📁 Project Structure

```
document-management/
├── .github/           # GitHub Actions workflows
├── backend/           # Django backend
│   ├── authentication/  # JWT authentication
│   ├── documents/       # Document management app
│   ├── users/           # User management app
│   └── media/           # Uploaded files storage
├── frontend/          # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI components
│   │   │   │   ├── components/  # UI components
│   │   │   │   ├── services/    # API services
│   │   │   │   ├── guards/      # Route guards
│   │   │   │   ├── models/      # TypeScript interfaces
│   │   │   │   └── pages/       # Page components
│   │   │   └── assets/        # Static assets
│   │   └── package.json      # Frontend dependencies
│   └── README.md
```

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/token/` - Obtain JWT tokens
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/upload/` - Upload a document
- `GET /api/documents/{id}/` - Get document details
- `PATCH /api/documents/{id}/` - Update document metadata
- `DELETE /api/documents/{id}/` - Delete document
- `GET /api/documents/recent/` - Get recently accessed documents
- `POST /api/documents/{id}/trigger_ingestion/` - Process document

### Users
- `GET /api/users/` - List all users (admin only)
- `POST /api/users/` - Create a new user (admin only)
- `GET /api/users/{id}/` - Get user details
- `PATCH /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

## 🔄 CI/CD Pipeline

The project includes a GitHub Actions workflow for continuous integration and deployment:

- **Linting**: Code quality checks
- **Testing**: Automated tests for backend and frontend
- **Building**: Packaging the application
- **Deployment**: Automated deployment (configurable)

## 🎮 Development Tools

- PowerShell scripts for local development:
  - `start-app.ps1`: Starts both frontend and backend servers
  - `push-to-github.ps1`: Helps push code to GitHub

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 License

MIT

## 👥 Contributors

- Rushikesh Ghule

---

Made with ❤️ using Django and Angular 