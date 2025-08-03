import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobAnalysis from './pages/JobAnalysis';
import Ranking from './pages/Ranking';
import Applications from './pages/Applications';
import ResumeDetails from './pages/ResumeDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/analyze" element={<JobAnalysis />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/resumes/:id" element={<ResumeDetails />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App; 