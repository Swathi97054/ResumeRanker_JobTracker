# Resume Ranker & Job Tracker

A comprehensive web application for managing resumes, analyzing job descriptions, and tracking job applications with intelligent matching and ranking capabilities.

## Features

### 🏠 Dashboard
- **Recent Activity Feed**: View all recent activities including resume uploads, job analyses, and applications with timestamps
- **Statistics Overview**: Track total resumes, jobs analyzed, applications, and average scores
- **Quick Actions**: Easy access to upload resumes, analyze jobs, view rankings, and manage applications
- **Activity Management**: Delete resumes and jobs directly from the activity feed

### 📄 Resume Analysis
- **Multi-format Support**: Upload and parse PDF and DOCX resume files
- **Intelligent Parsing**: Extract contact information, skills, experience, education, and more
- **Structured Data**: Get organized resume data for better matching

### 🔍 Job Analysis
- **Job Details Form**: Input job title, company, description, and key requirements
- **Quick Start Templates**: Pre-filled templates for common job roles (Frontend Developer, Data Scientist, Backend Engineer, DevOps Engineer)
- **Intelligent Extraction**: Automatically extract required skills, preferred skills, experience level, and education requirements
- **Comprehensive Analysis**: Get detailed breakdown of job requirements and responsibilities

### 📊 Applications Tracking
- **Application Dashboard**: Overview of application status with statistics (Applied, Interviews, Offers, Rejected)
- **Recent Activity**: View all applications with job details, company, application date, and resume used
- **Add Application Modal**: Easy-to-use modal for adding new applications with job title, company, status, and resume selection
- **Status Management**: Track application progress from Applied to Interviewing, Offered, or Rejected

### 🎯 Resume-Job Matching
- **Intelligent Ranking**: Match resumes against job descriptions using advanced algorithms
- **Score-based Results**: Get percentage-based matching scores
- **Skill Analysis**: Compare required vs. available skills

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **spaCy**: Natural language processing for text analysis
- **PyPDF2 & python-docx**: Document parsing
- **scikit-learn**: Machine learning for matching algorithms

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
- `GET /resumes/{id}` - Get specific resume
- `DELETE /resumes/{id}` - Delete resume

### Jobs
- `POST /analyze-job` - Analyze job description
- `GET /jobs` - List all jobs
- `DELETE /jobs/{id}` - Delete job analysis

### Applications
- `POST /applications` - Create new application
- `GET /applications` - List all applications
- `PUT /applications/{id}` - Update application status

### Ranking
- `POST /rank` - Rank resume against job

## Usage

1. **Upload Resumes**: Go to the Upload page and drag & drop or select PDF/DOCX files
2. **Analyze Jobs**: Use the Job Analysis page to input job details or use quick start templates
3. **Track Applications**: Manage your job applications with the Applications page
4. **View Rankings**: Compare resumes against job descriptions for optimal matching
5. **Monitor Activity**: Check the Dashboard for recent activities and statistics

## Data Storage

The application uses JSON files for data storage:
- `data/resumes.json` - Stored resume data
- `data/jobs.json` - Analyzed job data
- `data/applications.json` - Application tracking data
- `data/resumes/` - Uploaded resume files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 