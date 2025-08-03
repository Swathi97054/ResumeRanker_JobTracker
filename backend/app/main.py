from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
import uuid

# Import our modules (we'll create these next)
from app.parsers.resume_parser import ResumeParser
from app.parsers.job_parser import JobParser
from app.ranking.matcher import ResumeJobMatcher

app = FastAPI(title="Resume Ranker & Job Tracker", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize parsers and matcher
resume_parser = ResumeParser()
job_parser = JobParser()
matcher = ResumeJobMatcher()

# Data models
class JobDescription(BaseModel):
    title: str
    description: str
    company: Optional[str] = None
    location: Optional[str] = None

class ApplicationStatus(BaseModel):
    status: str  # Applied, Interviewing, Offered, Rejected
    notes: Optional[str] = None
    date_applied: Optional[str] = None

# Data storage (simple JSON files)
DATA_DIR = "data"
RESUMES_FILE = os.path.join(DATA_DIR, "resumes.json")
JOBS_FILE = os.path.join(DATA_DIR, "jobs.json")
APPLICATIONS_FILE = os.path.join(DATA_DIR, "applications.json")

def load_json_data(filename: str) -> dict:
    """Load data from JSON file"""
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return {}

def save_json_data(filename: str, data: dict):
    """Save data to JSON file"""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

@app.get("/dashboard/activity")
async def get_recent_activity():
    """Get recent activity for dashboard"""
    try:
        # Load data from JSON files
        resumes = load_json_data(RESUMES_FILE)
        jobs = load_json_data(JOBS_FILE)
        applications = load_json_data(APPLICATIONS_FILE)
        
        activities = []
        
        # Add resume upload activities
        for resume_id, resume_data in resumes.items():
            if 'upload_date' in resume_data:
                activities.append({
                    "id": resume_id,
                    "type": "resume_upload",
                    "message": f"Resume '{resume_data.get('filename', 'Unknown')}' uploaded",
                    "time": resume_data['upload_date'],
                    "data": resume_data
                })
        
        # Add job analysis activities
        for job_id, job_data in jobs.items():
            if 'analysis_date' in job_data:
                activities.append({
                    "id": job_id,
                    "type": "job_analysis",
                    "message": f"Job '{job_data.get('title', 'Unknown')}' analyzed",
                    "time": job_data['analysis_date'],
                    "data": job_data
                })
        
        # Add application activities
        for app_id, app_data in applications.items():
            if 'created_date' in app_data:
                activities.append({
                    "id": app_id,
                    "type": "application",
                    "message": f"Application status: {app_data.get('status', 'Unknown')}",
                    "time": app_data['created_date'],
                    "data": app_data
                })
        
        # Sort by time (most recent first) and take last 10
        activities.sort(key=lambda x: x['time'], reverse=True)
        return activities[:10]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent activity: {str(e)}")

@app.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Load data from JSON files
        resumes = load_json_data(RESUMES_FILE)
        jobs = load_json_data(JOBS_FILE)
        applications = load_json_data(APPLICATIONS_FILE)
        
        # Calculate statistics
        total_resumes = len(resumes)
        total_jobs = len(jobs)
        total_applications = len(applications)
        
        # Calculate average score from applications
        scores = []
        for app_id, app_data in applications.items():
            if 'score' in app_data:
                scores.append(app_data['score'])
            else:
                # Calculate score based on status if no explicit score
                status = app_data.get('status', '').lower()
                if status == 'offered':
                    scores.append(95.0)
                elif status == 'interviewing':
                    scores.append(75.0)
                elif status == 'applied':
                    scores.append(60.0)
                elif status == 'rejected':
                    scores.append(30.0)
                else:
                    scores.append(50.0)  # Default score
        
        average_score = 0
        if scores:
            average_score = sum(scores) / len(scores)
        
        return {
            "totalResumes": total_resumes,
            "totalJobs": total_jobs,
            "totalApplications": total_applications,
            "averageScore": round(average_score, 1)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard stats: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Resume Ranker & Job Tracker API"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse a resume"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
        
        # Save file
        file_id = str(uuid.uuid4())
        file_path = os.path.join(DATA_DIR, "resumes", f"{file_id}_{file.filename}")
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Parse resume
        resume_data = resume_parser.parse(file_path)
        resume_data["id"] = file_id
        resume_data["filename"] = file.filename
        resume_data["file_path"] = file_path
        resume_data["upload_date"] = datetime.now().isoformat()
        
        # Save to JSON
        resumes = load_json_data(RESUMES_FILE)
        resumes[file_id] = resume_data
        save_json_data(RESUMES_FILE, resumes)
        
        return {
            "id": file_id,
            "filename": file.filename,
            "parsed_data": resume_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str):
    """Delete a resume"""
    try:
        resumes = load_json_data(RESUMES_FILE)
        if resume_id not in resumes:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Get resume data to delete the file
        resume_data = resumes[resume_id]
        if 'filename' in resume_data:
            file_path = os.path.join(DATA_DIR, "resumes", f"{resume_id}_{resume_data['filename']}")
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Remove from JSON data
        del resumes[resume_id]
        save_json_data(RESUMES_FILE, resumes)
        
        return {"message": "Resume deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete resume: {str(e)}")

@app.get("/resumes")
async def list_resumes():
    """List all uploaded resumes"""
    resumes = load_json_data(RESUMES_FILE)
    return {"resumes": resumes}

@app.get("/resumes/{resume_id}")
async def get_resume(resume_id: str):
    """Get specific resume details"""
    resumes = load_json_data(RESUMES_FILE)
    if resume_id not in resumes:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resumes[resume_id]

@app.get("/resumes/{resume_id}/download")
async def download_resume(resume_id: str):
    """Download resume file"""
    resumes = load_json_data(RESUMES_FILE)
    if resume_id not in resumes:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume_data = resumes[resume_id]
    file_path = resume_data.get('file_path')
    
    # If file_path is not stored, construct it
    if not file_path:
        file_path = os.path.join(DATA_DIR, "resumes", f"{resume_id}_{resume_data['filename']}")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    return FileResponse(
        path=file_path,
        filename=resume_data['filename'],
        media_type='application/octet-stream'
    )

@app.post("/analyze-job")
async def analyze_job(job: JobDescription):
    """Analyze a job description"""
    try:
        job_id = str(uuid.uuid4())
        job_data = job_parser.parse(job.description)
        job_data.update({
            "id": job_id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "original_description": job.description,
            "analysis_date": datetime.now().isoformat()
        })
        
        # Save to JSON
        jobs = load_json_data(JOBS_FILE)
        jobs[job_id] = job_data
        save_json_data(JOBS_FILE, jobs)
        
        return job_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job analysis"""
    try:
        jobs = load_json_data(JOBS_FILE)
        if job_id not in jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Remove from JSON data
        del jobs[job_id]
        save_json_data(JOBS_FILE, jobs)
        
        return {"message": "Job analysis deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")

@app.get("/jobs")
async def list_jobs():
    """List all analyzed jobs"""
    jobs = load_json_data(JOBS_FILE)
    return {"jobs": jobs}

@app.post("/rank")
async def rank_resume_job(resume_id: str, job_id: str):
    """Rank a resume against a job description"""
    try:
        resumes = load_json_data(RESUMES_FILE)
        jobs = load_json_data(JOBS_FILE)
        
        if resume_id not in resumes:
            raise HTTPException(status_code=404, detail="Resume not found")
        if job_id not in jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        resume_data = resumes[resume_id]
        job_data = jobs[job_id]
        
        # Perform ranking
        ranking_result = matcher.rank(resume_data, job_data)
        
        return {
            "resume_id": resume_id,
            "job_id": job_id,
            "ranking": ranking_result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/applications")
async def create_application(resume_id: str, job_id: str, status: ApplicationStatus):
    """Create a new job application"""
    try:
        applications = load_json_data(APPLICATIONS_FILE)
        application_id = str(uuid.uuid4())
        
        application_data = {
            "id": application_id,
            "resume_id": resume_id,
            "job_id": job_id,
            "status": status.status,
            "notes": status.notes,
            "date_applied": status.date_applied or datetime.now().isoformat(),
            "created_date": datetime.now().isoformat()
        }
        
        applications[application_id] = application_data
        save_json_data(APPLICATIONS_FILE, applications)
        
        return application_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/applications")
async def list_applications():
    """List all job applications"""
    applications = load_json_data(APPLICATIONS_FILE)
    return {"applications": applications}

@app.put("/applications/{application_id}")
async def update_application(application_id: str, status: ApplicationStatus):
    """Update application status"""
    try:
        applications = load_json_data(APPLICATIONS_FILE)
        if application_id not in applications:
            raise HTTPException(status_code=404, detail="Application not found")
        
        applications[application_id].update({
            "status": status.status,
            "notes": status.notes,
            "updated_date": datetime.now().isoformat()
        })
        
        save_json_data(APPLICATIONS_FILE, applications)
        return applications[application_id]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/applications/{application_id}")
async def delete_application(application_id: str):
    """Delete an application"""
    try:
        applications = load_json_data(APPLICATIONS_FILE)
        if application_id not in applications:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Remove from JSON data
        del applications[application_id]
        save_json_data(APPLICATIONS_FILE, applications)
        
        return {"message": "Application deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 