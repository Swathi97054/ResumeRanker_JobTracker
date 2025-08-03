import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Edit, Building, Calendar, FileText, Target, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  resume_id: string;
  job_id: string;
  status: string;
  notes?: string;
  date_applied: string;
  created_date: string;
  updated_date?: string;
}

interface Resume {
  id: string;
  filename: string;
}

interface Job {
  id: string;
  title: string;
  company?: string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [editingApplication, setEditingApplication] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    fetchResumes();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:8000/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(Object.values(data.applications));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch('http://localhost:8000/resumes');
      if (response.ok) {
        const data = await response.json();
        setResumes(Object.values(data.resumes));
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(Object.values(data.jobs));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateApplication = async () => {
    if (!selectedResume || !jobTitle.trim()) {
      toast.error('Please select a resume and enter a job title');
      return;
    }

    try {
      // Create a new job first if it doesn't exist
      let jobId = selectedJob;
      if (!selectedJob && jobTitle.trim()) {
        const jobResponse = await fetch('http://localhost:8000/analyze-job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: jobTitle,
            description: `Job application for ${jobTitle} at ${company || 'Unknown Company'}`,
            company: company || undefined,
          }),
        });
        
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          jobId = jobData.id;
        }
      }

      const response = await fetch('http://localhost:8000/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_id: selectedResume,
          job_id: jobId,
          status: {
            status,
            notes: notes || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      const result = await response.json();
      setApplications(prev => [result, ...prev]);
      toast.success('Application created successfully!');
      
      // Reset form and close modal
      setSelectedResume('');
      setSelectedJob('');
      setJobTitle('');
      setCompany('');
      setStatus('Applied');
      setNotes('');
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to create application');
      console.error('Create application error:', error);
    }
  };

  const handleUpdateApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      const updatedApplication = await response.json();
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? updatedApplication : app)
      );
      toast.success('Application updated successfully!');
      
      // Reset form
      setEditingApplication(null);
      setStatus('Applied');
      setNotes('');
    } catch (error) {
      toast.error('Failed to update application');
      console.error('Update application error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';
      case 'Interviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offered':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied':
        return <FileText className="w-4 h-4" />;
      case 'Interviewing':
        return <Target className="w-4 h-4" />;
      case 'Offered':
        return <PartyPopper className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getResumeName = (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    return resume?.filename || 'Unknown Resume';
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  const getJobCompany = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.company || '';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  // Calculate statistics
  const stats = {
    applied: applications.filter(app => app.status === 'Applied').length,
    interviewing: applications.filter(app => app.status === 'Interviewing').length,
    offered: applications.filter(app => app.status === 'Offered').length,
    rejected: applications.filter(app => app.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Applications</h1>
          <p className="text-gray-600 mt-2">Track and manage your job applications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.applied}</div>
          <div className="text-sm text-gray-600">📝 Applied</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 mb-2">
            <Target className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.interviewing}</div>
          <div className="text-sm text-gray-600">🎯 Interviews</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mb-2">
            <PartyPopper className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.offered}</div>
          <div className="text-sm text-gray-600">🎉 Offers</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.rejected}</div>
          <div className="text-sm text-gray-600">❌ Rejected</div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          {applications.length === 0 ? (
            <div className="text-center py-6">
              <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet. Add your first application above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((application) => (
                <div key={application.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base">{getJobTitle(application.job_id)}</h3>
                      <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>{getJobCompany(application.job_id)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Applied {formatDate(application.date_applied)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>{getResumeName(application.resume_id)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Add New Application</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Developer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Used
                </label>
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.filename}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateApplication}
                  disabled={!selectedResume || !jobTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications; 