# DocVault - Document Management System

A comprehensive document management system built with Django backend and Angular frontend. This system allows users to securely upload, view, organize, and manage documents with a modern UI and role-based access control.

![DocVault](https://img.shields.io/badge/DocVault-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Angular](https://img.shields.io/badge/Angular-19.0.0-dd0031)
![Django](https://img.shields.io/badge/Django-5.0-092e20)

## 📋 Features

- **User Authentication**: Secure JWT-based authentication system with login/register functionality and role selection
- **Role-Based Access Control**: Admin, Editor, and Viewer roles with appropriate permissions
- **Document Management**:
  - Upload documents (PDF, Word, TXT, etc.) with modern drag & drop interface
  - View documents directly in the browser
  - Extract and index document content
  - Track document access history
- **Dashboard**: Overview of recent documents and system activity with visual cards
- **User Management**: Admin interface for user administration
- **Recent Files**: Quick access to recently viewed documents with intuitive UI
- **Settings**: Customizable user profile and application settings
- **Responsive Design**: Fully responsive design that works flawlessly on desktop, tablet, and mobile devices

## 🎨 UI Features

- **Modern Interface**: Clean, intuitive user interface with consistent design language
- **Dashboard**: Visual dashboard with gradient cards and interactive elements
- **Document Cards**: Stylish document cards with appropriate file type icons and hover effects
- **Upload Interface**: Enhanced upload form with drag & drop functionality and visual step indicators
- **Navigation**: Collapsible sidebar for better space utilization
- **Dark Blue Top Navbar**: Professional navigation with user profile and dropdown menu
- **File Type Indicators**: Custom badges and icons for different file types
- **Responsive Layout**: Adapts seamlessly to different screen sizes
- **Loading States**: Visual feedback during loading and processing operations
- **Empty States**: User-friendly empty state displays with helpful messages

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
- **Bootstrap Icons**: Comprehensive icon library

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

### Using PowerShell Scripts (Windows)
For Windows users, we've provided helpful PowerShell scripts:
```
# Start both frontend and backend services
.\start-app.ps1

# Restart the application
.\restart-app.ps1

# Apply database migrations
.\apply_migrations.ps1

# Push code to GitHub
.\push-to-github.ps1
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
│   │   │   │   ├── dashboard/    # Dashboard components
│   │   │   │   ├── documents/    # Document management components
│   │   │   │   ├── shared/       # Shared UI components
│   │   │   │   └── auth/         # Authentication components
│   │   │   ├── pages/       # Page components
│   │   │   ├── services/    # API services
│   │   │   ├── guards/      # Route guards
│   │   │   ├── interceptors/ # HTTP interceptors
│   │   │   └── models/      # TypeScript interfaces
│   │   ├── assets/        # Static assets
│   │   └── environments/  # Environment configurations
│   └── package.json      # Frontend dependencies
└── PowerShell Scripts    # Helper scripts for development
```

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user with role selection
- `POST /api/auth/token/` - Obtain JWT tokens
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Documents
- `GET /api/documents/` - List documents (filtered by permissions)
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

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adaptive layout with collapsible sidebar
- **Mobile**: Mobile-optimized view with hamburger menu and stacked components

## 🔐 User Roles

- **Admin**: Full access to all features, user management, and system configuration
- **Editor**: Can upload, edit, and delete their own documents
- **Viewer**: Can view documents shared with them but cannot modify content

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

## 🛠️ Recent Improvements

- Enhanced UI with consistent design language and color scheme
- Added user role selection during registration
- Fixed permissions to allow viewers to access all documents
- Improved document upload interface with drag & drop functionality
- Modernized dashboard with interactive cards and better visualization
- Optimized mobile experience with responsive design
- Added custom file type indicators and badges
- Implemented dark blue navigation bar for better contrast
- Created PowerShell scripts for easier development workflow

## 📝 License

MIT

## 👥 Contributors

- Rushikesh Ghule

---

Made with ❤️ using Django and Angular 