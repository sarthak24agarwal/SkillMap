// ==========================================
// EXPLAINING FORMDATA & FILE UPLOADS
// ==========================================
// What is FormData?
// FormData is a built-in browser API (a Web API) that lets us construct a set of key/value pairs 
// representing form fields and their values. Think of it as a programmatic way to recreate 
// a traditional HTML <form> submission.
//
// Why do we need it for file uploads?
// Normally, when we talk to a JSON API, we send data formatted as a JSON string using JSON.stringify().
// However, JSON is a text-only format. It cannot natively represent raw binary files (like a PDF resume).
//
// To upload files, we must use a encoding type called "multipart/form-data". 
// The FormData object automatically handles setting the correct headers (multipart/form-data boundary) 
// and packs the binary file data into the request body in a format the backend (FastAPI's UploadFile) 
// knows how to parse.
// Note: When using fetch with FormData, DO NOT set the 'Content-Type' header manually! 
// The browser will automatically set it along with the required boundary string.

/**
 * Sends a PDF resume to the FastAPI backend for skill mapping and analysis.
 * 
 * @param {File} file - The file object selected by the user from a file input.
 * @returns {Promise<Object>} - The JSON analysis response from the backend.
 */
export async function analyzeResume(file) {
  // 1. Create a new FormData instance
  const formData = new FormData();
  
  // 2. Append the file. The key 'file' must exactly match the parameter name 
  // expected by the FastAPI backend: async def analyze_skills(file: UploadFile = File(...))
  formData.append('file', file);

  try {
    // 3. Perform the POST request to the backend server
    const response = await fetch('https://skillmap-backend-gmvh.onrender.com/analyze', {
      method: 'POST',
      body: formData, // Passing the FormData object directly in the body
    });

    // 4. Handle cases where the server returns a bad status code (e.g. 400 or 500 errors)
    if (!response.ok) {
      // Try to parse the error message sent by FastAPI (e.g. detail field)
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (jsonErr) {
        // Fallback if response body is not JSON
      }
      throw new Error(errorMessage);
    }

    // 5. Return the parsed JSON response on success
    const result = await response.json();
    return result;

  } catch (error) {
    // 6. Provide a friendly message if the network request fails completely 
    // (e.g., if http://localhost:8000 is not running at all, fetch will throw a TypeError)
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error('Connection error:', error);
      throw new Error(
        'Friendly Error: Could not connect to the SkillMap backend server. ' +
        'Please make sure your FastAPI server is running on https://skillmap-backend-gmvh.onrender.com!'
      );
    }
    
    // Otherwise, pass along the specific error we threw or caught
    throw error;
  }
}
