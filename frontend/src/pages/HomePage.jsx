import React, { useState, useRef } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';

export default function HomePage() {
  // State for handling the drag-and-drop file
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Bring in the custom hook we created earlier
  const { isLoading, result, error, analyzeResume } = useAnalysis();

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault(); // Prevents the browser from opening the file in a new tab
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      checkAndSetFile(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      checkAndSetFile(e.target.files[0]);
    }
  };

  const checkAndSetFile = (file) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setSelectedFile(file);
    } else {
      alert("Friendly Error: Please upload a PDF file. Other formats aren't supported yet.");
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile) {
      analyzeResume(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-2">
          {/* Simple logo styling */}
          <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SkillMap</span>
        </div>
        <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
          How it Works
        </a>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Find your skill gaps <br/>
          <span className="text-emerald-600">before the recruiter does.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
          Upload your resume and see exactly which skills to learn next to land the jobs you want.
        </p>

        {/* Drag and Drop Upload Box */}
        <div 
          className={`max-w-xl mx-auto mb-8 p-12 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
            ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
            ${selectedFile ? 'border-emerald-500 bg-emerald-50/50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            accept=".pdf" 
            className="hidden" 
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Upload Icon */}
            <div className={`p-4 rounded-full ${selectedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 shadow-sm'}`}>
              {selectedFile ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
            </div>
            
            <div>
              {selectedFile ? (
                <p className="text-lg font-medium text-slate-900">{selectedFile.name}</p>
              ) : (
                <p className="text-lg font-medium text-slate-700">
                  Drop your resume here <span className="text-slate-500 text-sm block mt-1">(PDF only)</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAnalyzeClick}
          disabled={!selectedFile || isLoading}
          className={`px-8 py-4 rounded-xl text-lg font-bold shadow-sm transition-all duration-200 flex items-center justify-center mx-auto space-x-2
            ${!selectedFile 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'}
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Analyze My Resume</span>
          )}
        </button>

        {/* Error message display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl max-w-xl mx-auto border border-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Three Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto text-left">
          
          {/* Card 1 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-emerald-600 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Skill Gap Chart</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instantly see the exact percentage of skills you match for your target roles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-emerald-600 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Salary Insights</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Find out which missing skills will give you the biggest boost in your starting salary.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-emerald-600 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Learning Roadmap</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Get free, curated YouTube videos and tutorials tailored exactly to what you're missing.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
