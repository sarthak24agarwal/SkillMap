import { useState } from 'react';
import { analyzeResume as apiAnalyzeResume } from '../services/api';

/**
 * A custom React hook to manage state and logic for resume analysis.
 * 
 * Custom hooks in React are just functions that let us share stateful logic 
 * between different components. Here, we encapsulate loading, errors, and the 
 * response result so we don't have to rewrite this boilerplate in our UI files.
 */
export function useAnalysis() {
  // Clear, standard React state hooks
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Triggers the resume analysis API call and updates loading, error, and result states.
   * 
   * @param {File} file - The file to upload.
   */
  async function analyzeResume(file) {
    // Reset state before we start a new upload
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call our API service function (api.js) to upload and get results
      const data = await apiAnalyzeResume(file);
      
      // Update state with the parsed response on success
      setResult(data);
    } catch (err) {
      // Capture any errors (from the backend or network failures) and store the friendly message
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      // Set loading to false whether the request succeeded or failed
      setIsLoading(false);
    }
  }

  // Return the states and function so components (like our Dashboard or Upload Form) can use them
  return {
    isLoading,
    result,
    error,
    analyzeResume
  };
}
