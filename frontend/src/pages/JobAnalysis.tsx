import React, { useState } from 'react';
import { Search, Building, MapPin, Clock, DollarSign, CheckCircle, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface JobAnalysis {
  id: string;
  title: string;
  company?: string;
  location?: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  education_requirements: string[];
  location_type: string;
  salary_range: { min?: string; max?: string };
  analysis_date: string;
}

const JobAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [keyRequirements, setKeyRequirements] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedJobs, setAnalyzedJobs] = useState<JobAnalysis[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast.error('Please provide both job title and description');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription,
          company: company || undefined,
          location: location || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalyzedJobs(prev => [result, ...prev]);
      toast.success('Job analyzed successfully!');
      
      // Show success screen
      setShowSuccess(true);
      
      // Reset form
      setJobTitle('');
      setCompany('');
      setLocation('');
      setJobDescription('');
      setKeyRequirements('');
      
      // Hide success screen after 3 seconds and redirect to rankings
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/ranking');
      }, 3000);
    } catch (error) {
      toast.error('Failed to analyze job description');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTemplateClick = (template: { title: string; company: string; location: string; description: string; requirements: string }) => {
    setJobTitle(template.title);
    setCompany(template.company);
    setLocation(template.location);
    setJobDescription(template.description);
    setKeyRequirements(template.requirements);
  };

  const quickStartTemplates = [
    {
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      location: 'chennai',
      description: 'We are looking for a passionate Frontend Developer to join our team. You will be responsible for building user-friendly web applications using modern technologies.',
      requirements: 'React.js\nJavaScript\nHTML/CSS\n3+ years experience\nBachelor\'s degree'
    },
    {
      title: 'Data Scientist',
      company: 'DataCorp',
      location: 'hyderabad',
      description: 'Join our data science team to develop machine learning models and analyze large datasets to drive business decisions.',
      requirements: 'Python\nMachine Learning\nStatistics\nSQL\nMaster\'s degree'
    },
    {
      title: 'Backend Engineer',
      company: 'TechCorp',
      location:' chennai',
      description: 'Build scalable backend services and APIs that power our applications. Experience with cloud platforms and microservices architecture.',
      requirements: 'Node.js\nPython\nAWS\nDocker\n5+ years experience'
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'pan india',
      description: 'Manage our infrastructure and deployment pipelines. Ensure high availability and performance of our systems.',
      requirements: 'Kubernetes\nDocker\nAWS/GCP\nCI/CD\nLinux administration'
    }
  ];

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry_level':
        return 'bg-green-100 text-green-800';
      case 'mid_level':
        return 'bg-blue-100 text-blue-800';
      case 'senior_level':
        return 'bg-purple-100 text-purple-800';
      case 'executive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'remote':
        return 'bg-green-100 text-green-800';
      case 'hybrid':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-site':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Screen */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
            <p className="text-gray-600 mb-4">Job has been analyzed and matched with your resumes.</p>
            <p className="text-sm text-gray-500">Redirecting to rankings...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Analysis</h1>
        <p className="text-gray-600 mt-2">Analyze job descriptions to extract requirements and skills</p>
      </div>

      {/* Job Details Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
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
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste the full job description here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Requirements (one per line)
            </label>
            <textarea
              value={keyRequirements}
              onChange={(e) => setKeyRequirements(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="React.js&#10;Node.js&#10;5+ years experience&#10;Bachelor's degree"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobTitle.trim() || !jobDescription.trim()}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze Job</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Start Templates Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Start Templates</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickStartTemplates.map((template, index) => (
              <div
                key={index}
                onClick={() => handleTemplateClick(template)}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
              >
                <h3 className="font-medium text-gray-900 mb-1">{template.title}</h3>
                <p className="text-sm text-gray-600">{template.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analyzed Jobs */}
      {analyzedJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Analyzed Jobs</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {analyzedJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        {job.company && (
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(job.experience_level)}`}>
                        {job.experience_level.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLocationTypeColor(job.location_type)}`}>
                        {job.location_type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Required Skills */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.length > 0 ? (
                          job.required_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No required skills specified</span>
                        )}
                      </div>
                    </div>

                    {/* Preferred Skills */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Preferred Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.preferred_skills.length > 0 ? (
                          job.preferred_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-green-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No preferred skills specified</span>
                        )}
                      </div>
                    </div>

                    {/* Education Requirements */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Education Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.education_requirements.length > 0 ? (
                          job.education_requirements.map((req, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                              {req}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No education requirements specified</span>
                        )}
                      </div>
                    </div>

                    {/* Salary Range */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        {job.salary_range.min && job.salary_range.max ? (
                          <span className="text-sm text-gray-700">
                            ${job.salary_range.min} - ${job.salary_range.max}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Analyzed on {new Date(job.analysis_date).toLocaleDateString()}</span>
                      <span>ID: {job.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAnalysis; 