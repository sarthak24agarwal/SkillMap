import React from 'react';
import HomePage from './pages/HomePage';
import LoadingScreen from './components/LoadingScreen';
import ResultsDashboard from './pages/ResultsDashboard';
import { useAnalysis } from './hooks/useAnalysis';

export default function App() {
  const { isLoading, result, error, analyzeResume } = useAnalysis();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (result) {
    return <ResultsDashboard result={result} />;
  }

  return <HomePage analyzeResume={analyzeResume} error={error} />;
}
