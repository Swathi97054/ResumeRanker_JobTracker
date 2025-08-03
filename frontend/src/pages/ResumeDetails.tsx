import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, FileText, Settings, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResumeData {
  id: string;
  filename: string;
  upload_date: string;
  name: string;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
  };
  skills: string[];
  experience: any[];
  education: any[];
  summary: string;
  certifications: string[];
  projects: any[];
  hobbies: string[];
  awards: string[];
  personal_details: any;
}

const ResumeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchResumeDetails();
    }
  }, [id]);

  const fetchResumeDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/resumes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resume details');
      }
      const data = await response.json();
      setResume(data);
    } catch (error) {
      console.error('Error fetching resume details:', error);
      toast.error('Failed to load resume details');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume not found</h2>
          <p className="text-gray-600">The resume you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{resume.filename}</h1>
                <p className="text-sm text-gray-600">Uploaded on {formatDate(resume.upload_date)}</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-900">Name:</span>
                  <span className="ml-2 text-gray-700">{resume.name || 'Not specified'}</span>
                </div>
                {resume.contact_info.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{resume.contact_info.email}</span>
                  </div>
                )}
                {resume.contact_info.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{resume.contact_info.phone}</span>
                  </div>
                )}
                {resume.contact_info.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{resume.contact_info.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.skills && resume.skills.length > 0 ? (
                  resume.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills specified</span>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
              </div>
              <div className="space-y-2">
                {resume.certifications && resume.certifications.length > 0 ? (
                  resume.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{cert}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No certifications specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Professional Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">
                {resume.summary || 'No professional summary available.'}
              </p>
            </div>

            {/* Professional Experience */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Professional Experience</h2>
              </div>
              <div className="space-y-4">
                {resume.experience && resume.experience.length > 0 ? (
                  resume.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                      <div className="flex items-start space-x-2">
                        <Briefcase className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{exp.title || 'Unknown Position'}</h3>
                          {exp.company && (
                            <p className="text-blue-600 text-sm">{exp.company}</p>
                          )}
                          {exp.dates && (
                            <p className="text-gray-600 text-sm">{exp.dates}</p>
                          )}
                          {exp.description && (
                            <p className="text-gray-700 text-sm mt-1">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No experience specified</span>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              </div>
              <div className="space-y-3">
                {resume.education && resume.education.length > 0 ? (
                  resume.education.map((edu, index) => (
                    <div key={index}>
                      <h3 className="font-medium text-gray-900">{edu.degree || 'Unknown Degree'}</h3>
                      {edu.institution && (
                        <p className="text-green-600 text-sm">{edu.institution}</p>
                      )}
                      {edu.year && (
                        <p className="text-gray-600 text-sm">{edu.year}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No education specified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails; 