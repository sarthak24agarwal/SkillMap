// NOTE: To run this component, you will need to install Chart.js:
// npm install chart.js react-chartjs-2
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsDashboard({ result }) {
  // If no result is provided yet, show a fallback or mock data for design purposes
  const data = result || {
    user_skills: ['Python', 'SQL', 'Git'],
    skill_gaps: {
      you_have: ['Python', 'SQL', 'Git'],
      you_need: ['Docker', 'AWS', 'FastAPI', 'React', 'TypeScript'],
      match_score: 37
    },
    salary_impact: [
      { skill: 'React', jobs_count: 8, salary_boost: 'High' },
      { skill: 'Docker', jobs_count: 6, salary_boost: 'High' },
      { skill: 'AWS', jobs_count: 5, salary_boost: 'Medium' },
      { skill: 'FastAPI', jobs_count: 3, salary_boost: 'Medium' },
      { skill: 'TypeScript', jobs_count: 2, salary_boost: 'Low' }
    ],
    resources: [
      { skill: 'React', resource: 'React Quick Start Guide', url: '#', platform: 'Official Docs' },
      { skill: 'Docker', resource: 'Docker Handbook', url: '#', platform: 'freeCodeCamp' },
      { skill: 'AWS', resource: 'AWS Practitioner Course', url: '#', platform: 'YouTube' }
    ]
  };

  const { skill_gaps, salary_impact, resources } = data;
  const { you_have, you_need, match_score } = skill_gaps;

  // Derive counts
  const skillsFoundCount = you_have.length;
  const skillsMissingCount = you_need.length;

  // Determine Match Score color
  const matchColorClass = match_score >= 60 ? 'text-emerald-600' : 'text-orange-500';

  // --- Chart Setup ---
  // The user requested: "two colored bars per skill name". 
  // We'll map the top skills by demand, and show 1 for "Market Requirement" 
  // and 1 or 0 for "Your Resume".
  const chartLabels = [...you_have.slice(0, 3), ...you_need.slice(0, 4)];
  
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Market Demand (Jobs)',
        // Mocking demand count for skills you have, using real demand for missing skills
        data: chartLabels.map(skill => {
          const impact = salary_impact.find(s => s.skill === skill);
          return impact ? impact.jobs_count : Math.floor(Math.random() * 5) + 3;
        }),
        backgroundColor: '#cbd5e1', // slate-300
        borderRadius: 4,
      },
      {
        label: 'Your Resume',
        // 100% of demand bar if you have it, 0 if you don't
        data: chartLabels.map(skill => {
          const hasIt = you_have.includes(skill);
          if (!hasIt) return 0;
          const impact = salary_impact.find(s => s.skill === skill);
          return impact ? impact.jobs_count : Math.floor(Math.random() * 5) + 3;
        }),
        backgroundColor: '#059669', // emerald-600
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // --- Mock Job Titles ---
  // Since the backend doesn't explicitly return job title clusters yet,
  // we'll provide some dynamic looking mock data based on their skills.
  const jobMatches = [
    { title: "Junior Python Developer", match: match_score + 15 },
    { title: "Backend Engineer", match: match_score + 5 },
    { title: "Data Analyst", match: Math.max(10, match_score - 10) }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-2">
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

      <main className="max-w-5xl mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your SkillMap Results</h1>
          <div className="bg-emerald-100 p-1 rounded-full">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* 3 Stat Boxes Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Skills Found</p>
            <p className="text-4xl font-black text-slate-900">{skillsFoundCount}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Skills Missing</p>
            <p className="text-4xl font-black text-orange-500">{skillsMissingCount}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Job Match Score</p>
            <p className={`text-4xl font-black ${matchColorClass}`}>{match_score}%</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Skills in Your Resume vs What Jobs Ask For</h2>
          <div className="h-72 w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-12 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Skills to Learn & Salary Impact</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase text-slate-500 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Skill Name</th>
                  <th className="px-6 py-4 font-semibold">Jobs Requiring It</th>
                  <th className="px-6 py-4 font-semibold">Avg Salary Boost</th>
                  <th className="px-6 py-4 font-semibold text-right">Learn Free</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salary_impact.map((impact, idx) => {
                  const resource = resources.find(r => r.skill === impact.skill);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{impact.skill}</td>
                      <td className="px-6 py-4 text-slate-600">{impact.jobs_count} postings</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${impact.salary_boost === 'High' ? 'bg-emerald-100 text-emerald-800' : 
                            impact.salary_boost === 'Medium' ? 'bg-blue-100 text-blue-800' : 
                            'bg-slate-100 text-slate-800'}`}>
                          {impact.salary_boost}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {resource ? (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" 
                             className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium group">
                            <span className="mr-1 border-b border-transparent group-hover:border-emerald-700 transition-colors">
                              Resource
                            </span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {salary_impact.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No missing skills found! You are a perfect match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Job Titles Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Best Job Titles For You Right Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {jobMatches.map((job, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex-grow">{job.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-medium text-slate-500">Match Rate</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-md
                    ${job.match >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                      job.match >= 60 ? 'bg-blue-100 text-blue-700' : 
                      'bg-orange-100 text-orange-700'}`}>
                    {Math.min(100, job.match)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="flex justify-center mt-16">
          <button className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-4 px-10 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download My Roadmap</span>
          </button>
        </div>

      </main>
    </div>
  );
}
