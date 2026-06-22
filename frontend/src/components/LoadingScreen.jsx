import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  // We use a simple state integer to track which step we are currently on.
  // 0 = Reading, 1 = Finding skills, 2 = Searching market, 3 = Building roadmap
  const [currentStep, setCurrentStep] = useState(0);

  // This useEffect simulates the progression of steps while the actual API request
  // runs in the background. In a real app with WebSockets, the server could send 
  // live updates, but for a standard HTTP POST request, a timed simulation provides 
  // excellent UX and keeps the user informed.
  useEffect(() => {
    // Transition from Step 1 -> Step 2 after 2 seconds
    const timer1 = setTimeout(() => setCurrentStep(1), 2000);
    
    // Transition from Step 2 -> Step 3 after 6 seconds (Claude API usually takes a few seconds)
    const timer2 = setTimeout(() => setCurrentStep(2), 6000);
    
    // Transition from Step 3 -> Step 4 after 10 seconds (JSearch API call)
    const timer3 = setTimeout(() => setCurrentStep(3), 10000);

    // Cleanup timers if the component unmounts early (e.g. if the backend responds faster than 10 seconds)
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const steps = [
    "Reading your resume",
    "Finding your skills",
    "Searching job market",
    "Building your roadmap"
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full px-6">
        
        {/* Top Pulsing Circle / Spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-75"></div>
            {/* Inner solid circle */}
            <div className="relative w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
          Analyzing your resume...
        </h2>

        {/* Step-by-step progress list */}
        <div className="space-y-6">
          {steps.map((stepText, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isWaiting = index > currentStep;

            return (
               <div key={index} className="flex items-center space-x-4">
                 
                 {/* Status Icon */}
                 <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                   {isCompleted && (
                     <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                   )}
                   
                   {isActive && (
                     <svg className="animate-spin w-5 h-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                   )}
                   
                   {isWaiting && (
                     <div className="w-2.5 h-2.5 bg-slate-200 rounded-full"></div>
                   )}
                 </div>

                 {/* Step Text */}
                 <span className={`text-base font-medium transition-colors duration-300
                    ${isCompleted ? 'text-slate-900' : ''}
                    ${isActive ? 'text-emerald-700 font-bold' : ''}
                    ${isWaiting ? 'text-slate-400' : ''}
                 `}>
                   {stepText}
                 </span>

               </div>
            );
          })}
        </div>

        {/* Friendly footer note */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium text-slate-500">
            This takes about 10-15 seconds. Hang tight!
          </p>
        </div>
        
      </div>
    </div>
  );
}
