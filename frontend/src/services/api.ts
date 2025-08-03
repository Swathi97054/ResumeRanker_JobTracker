import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API
export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumes = async () => {
  const response = await api.get('/resumes');
  return response.data;
};

// Job API
export const analyzeJob = async (jobData: {
  title: string;
  description: string;
  company?: string;
  location?: string;
}) => {
  const response = await api.post('/analyze-job', jobData);
  return response.data;
};

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

// Ranking API
export const rankResumeJob = async (resumeId: string, jobId: string) => {
  const response = await api.post(`/rank?resume_id=${resumeId}&job_id=${jobId}`);
  return response.data;
};

// Applications API
export const createApplication = async (
  resumeId: string,
  jobId: string,
  status: {
    status: string;
    notes?: string;
    date_applied?: string;
  }
) => {
  const response = await api.post('/applications', null, {
    params: { resume_id: resumeId, job_id: jobId },
    data: status,
  });
  return response.data;
};

export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const updateApplication = async (
  applicationId: string,
  status: {
    status: string;
    notes?: string;
  }
) => {
  const response = await api.put(`/applications/${applicationId}`, status);
  return response.data;
};

export default api; 