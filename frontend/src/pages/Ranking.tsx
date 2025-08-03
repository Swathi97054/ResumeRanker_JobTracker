import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, XCircle, AlertTriangle, Star, FileText, Target, TrendingUp as TrendingUpIcon, Clipboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { rankResumeJob, getResumes, getJobs } from '../services/api';

interface Resume {
  id: string;
  filename: string;
  skills: string[];
  experience: any[];
  education: any[];
}

interface Job {
  id: string;
  title: string;
  company?: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
}

interface RankingResult {
  resume_id: string;
  job_id: string;
  overall_score: number;
  scores: {
    skills_match: number;
    overall_similarity: number;
    experience_match: number;
    keyword_match: number;
    education_match: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    missing_skills: string[];
    matching_keywords: string[];
  };
  recommendations: string[];
}

const Ranking: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);
  const [isRanking, setIsRanking] = useState(false);

  useEffect(() => {
    fetchResumes();
    fetchJobs();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(Object.values(data.resumes));
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(Object.values(data.jobs));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleRank = async () => {
    if (!selectedResume || !selectedJob) {
      toast.error('Please select both a resume and a job');
      return;
    }

    setIsRanking(true);
    try {
      const result = await rankResumeJob(selectedResume, selectedJob);
      setRankingResult(result.ranking);
      toast.success('Ranking completed successfully!');
    } catch (error) {
      toast.error('Failed to perform ranking');
      console.error('Ranking error:', error);
    } finally {
      setIsRanking(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 0.6) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getSelectedResumeName = () => {
    const resume = resumes.find(r => r.id === selectedResume);
    return resume?.filename || '';
  };

  const getSelectedJobInfo = () => {
    const job = jobs.find(j => j.id === selectedJob);
    return {
      title: job?.title || '',
      company: job?.company || ''
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resume Ranking</h1>
        <p className="text-gray-600 mt-2">Rank your resumes against job descriptions</p>
      </div>

      {/* Selection Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Select Resume and Job</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume
              </label>
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a resume...</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.filename}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} {job.company && `at ${job.company}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleRank}
              disabled={isRanking || !selectedResume || !selectedJob}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isRanking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Ranking...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Rank Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* No Ranking Results */}
      {!rankingResult && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Ranking Results</h3>
            <p className="text-sm text-gray-600">Select a resume and job above to see detailed ranking analysis</p>
          </div>
        </div>
      )}

      {/* Ranking Results */}
      {rankingResult && (
        <>
          {/* Score Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Math.round(rankingResult.scores.overall_similarity * 100)}%
              </div>
              <div className="text-sm text-gray-600">Overall Similarity</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Math.round(rankingResult.scores.skills_match * 100)}%
              </div>
              <div className="text-sm text-gray-600">Skills Match</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Math.round(rankingResult.scores.experience_match * 100)}%
              </div>
              <div className="text-sm text-gray-600">Experience Match</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Math.round(rankingResult.scores.education_match * 100)}%
              </div>
              <div className="text-sm text-gray-600">Education Match</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Math.round(rankingResult.scores.keyword_match * 100)}%
              </div>
              <div className="text-sm text-gray-600">Keyword Match</div>
            </div>
          </div>

          {/* Detailed Analysis Card */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{getSelectedResumeName()}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {getSelectedJobInfo().title} at {getSelectedJobInfo().company}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ☆ {Math.round(rankingResult.overall_score * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Excellent Match</div>
                </div>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUpIcon className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">Strengths</h4>
                  </div>
                  <div className="space-y-2">
                    {rankingResult.analysis.strengths.length > 0 ? (
                      rankingResult.analysis.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Strong technical skills alignment</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clipboard className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-gray-900">Suggested Improvements</h4>
                  </div>
                  <div className="space-y-2">
                    {rankingResult.analysis.weaknesses.length > 0 ? (
                      rankingResult.analysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Add more specific project examples</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Matching Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {rankingResult.analysis.matching_keywords && rankingResult.analysis.matching_keywords.length > 0 ? (
                      rankingResult.analysis.matching_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Python
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {rankingResult.analysis.missing_skills && rankingResult.analysis.missing_skills.length > 0 ? (
                      rankingResult.analysis.missing_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No missing keywords identified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">How to use ranking:</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Upload your resume first in the Upload Resume section</li>
              <li>• Analyze job descriptions in the Analyze Job section</li>
              <li>• Select a resume and job to compare</li>
              <li>• Review the detailed analysis and recommendations</li>
              <li>• Use the insights to improve your resume</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking; 