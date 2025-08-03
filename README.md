# Resume Ranker & Job Tracker

A comprehensive web application for managing resumes, analyzing job descriptions, and tracking job applications with intelligent matching and ranking capabilities.

## ✨ Features

### 🏠 Dashboard
- **Recent Activity Feed**: View all recent activities including resume uploads, job analyses, and applications with timestamps
- **Statistics Overview**: Track total resumes, jobs analyzed, applications, and average scores
- **Quick Actions**: Easy access to upload resumes, analyze jobs, view rankings, and manage applications
- **Activity Management**: Delete resumes and jobs directly from the activity feed
- **View Details**: Click on any resume activity to view detailed parsed information

### 📄 Resume Analysis & Management
- **Multi-format Support**: Upload and parse PDF and DOCX resume files
- **Intelligent Parsing**: Extract contact information, skills, experience, education, projects, and more
- **Enhanced Resume Details**: 
  - **Personal Information**: Name, email, phone, address
  - **Skills**: Comprehensive skill extraction and display
  - **Professional Experience**: Company, position, dates, descriptions
  - **Education**: Degree, institution, year, CGPA, percentage, completion status
  - **Projects**: Technologies, duration, accuracy, links, descriptions, tags
  - **Certifications**: Professional certifications and achievements
- **Download Functionality**: Download original resume files directly from the application
- **Structured Data**: Get organized resume data for better matching

### 🔍 Job Analysis
- **Job Details Form**: Input job title, company, description, and key requirements
- **Quick Start Templates**: Pre-filled templates for common job roles (Frontend Developer, Data Scientist, Backend Engineer, DevOps Engineer)
- **Intelligent Extraction**: Automatically extract required skills, preferred skills, experience level, and education requirements
- **Comprehensive Analysis**: Get detailed breakdown of job requirements and responsibilities

### 📊 Applications Tracking
- **Application Dashboard**: Overview of application status with statistics (Applied, Interviews, Offers, Rejected)
- **Enhanced Application Management**:
  - **Add Applications**: Create new applications with job title, company, status, resume selection, and optional notes
  - **Delete Applications**: Remove applications with confirmation dialog
  - **Application Notes**: Add and view notes for each application
  - **View Resume Details**: Quick access to resume details from application list
- **Status Management**: Track application progress from Applied to Interviewing, Offered, or Rejected
- **Application Statistics**: Real-time statistics showing application status distribution

### 🎯 Resume-Job Matching
- **Intelligent Ranking**: Match resumes against job descriptions using advanced algorithms
- **Score-based Results**: Get percentage-based matching scores
- **Skill Analysis**: Compare required vs. available skills

### 🔧 Enhanced Resume Parser
- **Dynamic Parsing**: No hardcoded values - works with different resume formats
- **Improved Section Separation**: Better logic to separate education, experience, and projects
- **Enhanced Education Parsing**: Recognizes various degree types and institutions
- **Project Detection**: Advanced project identification with technology and accuracy details
- **Experience Extraction**: Improved work experience parsing with company and date information

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **spaCy**: Natural language processing for text analysis
- **PyPDF2 & python-docx**: Document parsing
- **scikit-learn**: Machine learning for matching algorithms
- **FileResponse**: File download functionality

### Frontend
- **React 18**: Modern React with TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **React Router**: Client-side routing
- **React Hot Toast**: Toast notifications

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Install spaCy model:
```bash
python -m spacy download en_core_web_sm
```

5. Start the backend server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend application will be available at `http://localhost:3000`

## API Endpoints

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/activity` - Get recent activity

### Resumes
- `POST /upload-resume` - Upload and parse resume
- `GET /resumes` - List all resumes
- `GET /resumes/{id}` - Get specific resume details
- `GET /resumes/{id}/download` - Download original resume file
- `DELETE /resumes/{id}` - Delete resume

### Jobs
- `POST /analyze-job` - Analyze job description
- `GET /jobs` - List all jobs
- `DELETE /jobs/{id}` - Delete job analysis

### Applications
- `POST /applications` - Create new application
- `GET /applications` - List all applications
- `PUT /applications/{id}` - Update application status
- `DELETE /applications/{id}` - Delete application

### Ranking
- `POST /rank` - Rank resume against job

## Usage

### 📄 Resume Management
1. **Upload Resumes**: Go to the Upload page and drag & drop or select PDF/DOCX files
2. **View Details**: Click "View Details" on any resume to see parsed information
3. **Download**: Use the download button to get the original resume file
4. **Enhanced Display**: View detailed education, experience, projects, and skills

### 📊 Application Tracking
1. **Add Applications**: Use the "Add Application" button to create new applications
2. **Track Status**: Monitor application progress with status indicators
3. **Add Notes**: Include notes for each application for better tracking
4. **Delete Applications**: Remove applications when needed with confirmation
5. **View Resume Details**: Quick access to resume information from application list

### 🔍 Job Analysis
1. **Analyze Jobs**: Use the Job Analysis page to input job details or use quick start templates
2. **View Rankings**: Compare resumes against job descriptions for optimal matching
3. **Monitor Activity**: Check the Dashboard for recent activities and statistics

## Data Storage

The application uses JSON files for data storage:
- `data/resumes.json` - Stored resume data with file paths
- `data/jobs.json` - Analyzed job data
- `data/applications.json` - Application tracking data with notes
- `data/resumes/` - Uploaded resume files

## Recent Improvements

### ✅ Enhanced Resume Details
- **Detailed Education Section**: Shows degree, institution, year, CGPA, percentage, and completion status
- **Enhanced Projects Section**: Displays technologies, duration, accuracy, links, descriptions, and tags
- **Improved Experience Display**: Better formatting with company and date information
- **Download Functionality**: Direct download of original resume files

### ✅ Applications Management
- **Delete Applications**: Remove applications with confirmation dialog
- **Application Notes**: Add and view notes for each application
- **View Resume Details**: Quick access to resume information from application list
- **Enhanced UI**: Better visual design with status indicators and statistics

### ✅ Improved Resume Parser
- **Dynamic Parsing**: No hardcoded values - works with various resume formats
- **Better Section Separation**: Improved logic to separate education, experience, and projects
- **Enhanced Education Recognition**: Supports various degree types and institutions
- **Advanced Project Detection**: Better project identification with technology details

### ✅ Backend Enhancements
- **Download Endpoint**: New `/resumes/{id}/download` endpoint for file downloads
- **File Path Storage**: Resume upload now stores file paths for download functionality
- **Application Management**: Enhanced CRUD operations for applications with notes support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 