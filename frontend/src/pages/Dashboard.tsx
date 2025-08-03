import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, FileText, Briefcase, TrendingUp, Users, Clock, CheckCircle, RefreshCw, Trash2, Edit, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalResumes: number;
  totalJobs: number;
  totalApplications: number;
  averageScore: number;
}

interface Activity {
  id: string;
  type: 'resume_upload' | 'job_analysis' | 'application';
  message: string;
  time: string;
  data: any;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    totalJobs: 0,
    totalApplications: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats and activity
    fetchStats();
    fetchActivity();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchActivity();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      setStats({
        totalResumes: data.totalResumes || 0,
        totalJobs: data.totalJobs || 0,
        totalApplications: data.totalApplications || 0,
        averageScore: data.averageScore || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard stats');
      // Fallback to default values
      setStats({
        totalResumes: 0,
        totalJobs: 0,
        totalApplications: 0,
        averageScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      setActivityLoading(true);
      const response = await fetch('http://localhost:8000/dashboard/activity');
      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load recent activity');
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchActivity();
    toast.success('Dashboard refreshed');
  };

  const handleDelete = async (type: 'resume' | 'job' | 'application', id: string) => {
    const confirmMessage = `Are you sure you want to delete this ${type}? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      let endpoint = '';
      if (type === 'resume') {
        endpoint = `/resumes/${id}`;
      } else if (type === 'job') {
        endpoint = `/jobs/${id}`;
      } else if (type === 'application') {
        endpoint = `/applications/${id}`;
      }
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      
      // Refresh data
      fetchStats();
      fetchActivity();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return 'Unknown time';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume_upload':
        return Upload;
      case 'job_analysis':
        return Search;
      case 'application':
        return Briefcase;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'resume_upload':
        return 'bg-blue-500';
      case 'job_analysis':
        return 'bg-purple-500';
      case 'application':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Upload and parse your resume',
      icon: Upload,
      path: '/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'Analyze Job',
      description: 'Analyze a job description',
      icon: Search,
      path: '/analyze',
      color: 'bg-green-500',
    },
    {
      title: 'View Rankings',
      description: 'See resume-job rankings',
      icon: FileText,
      path: '/ranking',
      color: 'bg-purple-500',
    },
    {
      title: 'Track Applications',
      description: 'Manage your applications',
      icon: Briefcase,
      path: '/applications',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your Resume Ranker dashboard</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Resumes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalResumes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jobs Analyzed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activityLoading ? (
              <p className="text-center py-4">Loading activity...</p>
            ) : activities.length === 0 ? (
              <p className="text-center py-4">No recent activity yet.</p>
            ) : (
              activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{formatTime(activity.time)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.type === 'resume_upload' && (
                        <>
                          <button
                            onClick={() => window.location.href = `/resumes/${activity.data.id}`}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete('resume', activity.data.id)}
                            className="text-xs text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {activity.type === 'job_analysis' && (
                        <button
                          onClick={() => handleDelete('job', activity.data.id)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                      {activity.type === 'application' && (
                        <button
                          onClick={() => handleDelete('application', activity.data.id)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 