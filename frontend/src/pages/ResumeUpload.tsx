import React, { useState, useEffect } from 'react';
import { Upload, FileText, User, Mail, Phone, GraduationCap, Briefcase, Award, Globe, BookOpen, Heart, Trophy, UserCheck } from 'lucide-react';

interface ParsedData {
  name?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  summary?: string;
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    cgpa: string;
    percentage: string;
    status: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  languages?: string[];
  certifications?: string[];
  projects?: Array<{
    title: string;
    description: string;
  }>;
  hobbies?: string[];
  awards?: string[];
  personal_details?: {
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
  };
}

const ResumeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('unknown');

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus('connected');
        setError(null);
      } else {
        setBackendStatus('error');
        setError('Backend server is not responding correctly');
      }
    } catch (err) {
      setBackendStatus('error');
      setError('Cannot connect to backend server. Please ensure the backend is running on port 8000.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const fileType = selectedFile.name.toLowerCase();
      if (!fileType.endsWith('.pdf') && !fileType.endsWith('.docx')) {
        setError('Please select a PDF or DOCX file');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  // Test backend connection on component mount
  useEffect(() => {
    testBackendConnection();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file:', file.name);
      
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Parsed data:', data);
      
      if (data.parsed_data) {
        setParsedData(data.parsed_data);
        setError(null);
        setSuccess('Resume parsed successfully!');
      } else {
        throw new Error('No parsed data received from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the resume');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Parser</h1>
          <p className="text-gray-600">Upload your resume to extract structured information</p>
          
          {/* Backend Status */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              backendStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : backendStatus === 'error' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-500' : 
                backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span>
                {backendStatus === 'connected' ? 'Backend Connected' : 
                 backendStatus === 'error' ? 'Backend Error' : 'Backend Unknown'}
              </span>
            </div>
            <button
              onClick={testBackendConnection}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Parse Resume'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
        </div>

        {/* Parsed Data Display */}
        {parsedData && (
          <div className="space-y-6">
            {/* Name Section */}
            {parsedData.name && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-blue-900">Name</h2>
                </div>
                <p className="text-lg text-blue-800 font-medium">{parsedData.name}</p>
              </div>
            )}

            {/* Contact Information */}
            {parsedData.contact_info && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Mail className="w-5 h-5 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                </div>
                <div className="space-y-2">
                  {parsedData.contact_info.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{parsedData.contact_info.email}</span>
                    </div>
                  )}
                  {parsedData.contact_info.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{parsedData.contact_info.phone}</span>
                    </div>
                  )}
                  {parsedData.contact_info.address && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">{parsedData.contact_info.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal Details */}
            {parsedData.personal_details && Object.keys(parsedData.personal_details).length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <UserCheck className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-indigo-900">Personal Details</h2>
                </div>
                <div className="space-y-2">
                  {parsedData.personal_details.date_of_birth && (
                    <div className="flex items-center">
                      <span className="text-indigo-700 font-medium">Date of Birth:</span>
                      <span className="text-indigo-600 ml-2">{parsedData.personal_details.date_of_birth}</span>
                    </div>
                  )}
                  {parsedData.personal_details.gender && (
                    <div className="flex items-center">
                      <span className="text-indigo-700 font-medium">Gender:</span>
                      <span className="text-indigo-600 ml-2">{parsedData.personal_details.gender}</span>
                    </div>
                  )}
                  {parsedData.personal_details.marital_status && (
                    <div className="flex items-center">
                      <span className="text-indigo-700 font-medium">Marital Status:</span>
                      <span className="text-indigo-600 ml-2">{parsedData.personal_details.marital_status}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary Section */}
            {parsedData.summary && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-indigo-900">Summary</h2>
                </div>
                <p className="text-indigo-800 leading-relaxed">{parsedData.summary}</p>
              </div>
            )}

            {/* Skills Section */}
            {parsedData.skills && parsedData.skills.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Award className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-green-900">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {parsedData.education && parsedData.education.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="text-xl font-semibold text-purple-900">Education</h2>
                </div>
                <div className="space-y-4">
                  {parsedData.education.map((edu, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="font-semibold text-purple-900 mb-2">{edu.degree}</div>
                      {edu.institution && (
                        <div className="text-purple-700 mb-1">{edu.institution}</div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {edu.year && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {edu.year}
                          </span>
                        )}
                        {edu.cgpa && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            CGPA: {edu.cgpa}
                          </span>
                        )}
                        {edu.percentage && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {edu.percentage}%
                          </span>
                        )}
                        {edu.status && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            edu.status === 'pursuing' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {edu.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {parsedData.experience && parsedData.experience.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Briefcase className="w-5 h-5 text-orange-600 mr-2" />
                  <h2 className="text-xl font-semibold text-orange-900">Experience</h2>
                </div>
                <div className="space-y-4">
                  {parsedData.experience.map((exp, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="font-semibold text-orange-900">{exp.title}</div>
                      <div className="text-orange-700">{exp.company}</div>
                      <div className="text-orange-600 text-sm">{exp.duration}</div>
                      {exp.description && (
                        <div className="text-gray-700 mt-2">{exp.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {parsedData.languages && parsedData.languages.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Globe className="w-5 h-5 text-teal-600 mr-2" />
                  <h2 className="text-xl font-semibold text-teal-900">Languages</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {parsedData.certifications && parsedData.certifications.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Award className="w-5 h-5 text-yellow-600 mr-2" />
                  <h2 className="text-xl font-semibold text-yellow-900">Certifications</h2>
                </div>
                <div className="space-y-2">
                  {parsedData.certifications.map((cert, index) => (
                    <div key={index} className="text-yellow-800">• {cert}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {parsedData.projects && parsedData.projects.length > 0 && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-5 h-5 text-cyan-600 mr-2" />
                  <h2 className="text-xl font-semibold text-cyan-900">Projects</h2>
                </div>
                <div className="space-y-4">
                  {parsedData.projects.map((project, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-cyan-200">
                      <div className="font-semibold text-cyan-900">{project.title}</div>
                      {project.description && (
                        <div className="text-cyan-700 mt-1">{project.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies Section */}
            {parsedData.hobbies && parsedData.hobbies.length > 0 && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Heart className="w-5 h-5 text-pink-600 mr-2" />
                  <h2 className="text-xl font-semibold text-pink-900">Hobbies</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedData.hobbies.map((hobby, index) => (
                    <span
                      key={index}
                      className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Awards Section */}
            {parsedData.awards && parsedData.awards.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Trophy className="w-5 h-5 text-amber-600 mr-2" />
                  <h2 className="text-xl font-semibold text-amber-900">Awards & Achievements</h2>
                </div>
                <div className="space-y-2">
                  {parsedData.awards.map((award, index) => (
                    <div key={index} className="text-amber-800">• {award}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for Better Parsing</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Use clear section headers (Education, Experience, Skills, etc.)</li>
            <li>• Place your name prominently at the top of the resume</li>
            <li>• Include contact information in a structured format</li>
            <li>• List education with degree, institution, year, and grades clearly</li>
            <li>• Separate different sections with clear headings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload; 