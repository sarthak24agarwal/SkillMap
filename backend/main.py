from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import custom modules we built earlier
from pdf_parser import extract_text_from_pdf
from skill_extractor import extract_skills_from_resume
from jobs_fetcher import fetch_jobs_for_skills
from skill_analyzer import calculate_skill_gaps, get_salary_impact, recommend_resources

# Initialize the FastAPI application
app = FastAPI(title="SkillMap API", version="1.0.0")

# ==========================================
# EXPLAINING CORS (Cross-Origin Resource Sharing)
# ==========================================
# What is CORS?
# Web browsers have a security feature called the "Same-Origin Policy." 
# This policy prevents a frontend application hosted on one origin (e.g., http://localhost:5173 for React)
# from making HTTP requests to a backend API running on a different origin (e.g., http://localhost:8000 for FastAPI).
#
# Why do we need it?
# Since our React frontend and FastAPI backend run on different ports during development,
# the browser will block React from fetching data from FastAPI by default.
# By adding CORSMiddleware and specifying which origins are allowed, we are explicitly telling 
# our backend server: "It's safe to accept requests from our React frontend."

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://skill-map-vert.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows requests from our frontend origins
    allow_credentials=True,           # Allows frontend to send cookies/headers if needed
    allow_methods=["*"],              # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],              # Allows all request headers
)

@app.get("/")
def root():
    """
    Friendly welcome message when someone visits the API in their browser.
    """
    return {
        "message": "Welcome to the SkillMap API!", 
        "status": "Online",
        "tip": "The frontend React app talks to the /analyze endpoint here."
    }

@app.get("/health")
def health_check():
    """
    Simple health check route to verify that the backend server is running correctly.
    """
    print("Health check endpoint was called!")  # Simple print for debugging
    return {"status": "ok"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Simpler route to upload a file and verify that the parser works before running 
    the full Claude API and Job Search API pipeline.
    """
    if not file.filename.endswith(".pdf"):
        print(f"Error: Uploaded file '{file.filename}' is not a PDF.")
        raise HTTPException(
            status_code=400, 
            detail="Friendly Error: Please upload a PDF file. Other formats are not supported."
        )
    
    print(f"=== Standalone Upload Test for '{file.filename}' ===")
    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)
    
    return {
        "filename": file.filename,
        "character_count": len(text),
        "preview": text[:200] if text else "[No text found]"
    }

@app.post("/analyze")
async def analyze_skills(file: UploadFile = File(...)):
    """
    Main endpoint for SkillMap. 
    Accepts a PDF resume, parses it, extracts skills using Claude, fetches matching jobs, 
    calculates gaps, ranks missing skills, and recommends learning resources.
    """
    # 1. Check if the file is a PDF
    if not file.filename.endswith(".pdf"):
        print(f"Error: Uploaded file '{file.filename}' is not a PDF.")
        raise HTTPException(
            status_code=400, 
            detail="Friendly Error: The file must be a PDF. Please try uploading a PDF resume."
        )

    try:
        print(f"\n================ STARTING ANALYSIS FOR '{file.filename}' ================")
        
        # Step 1: Read the uploaded file bytes
        file_bytes = await file.read()
        print(f"Step 1: Read {len(file_bytes)} bytes from uploaded file.")
        
        # Step 2: Extract text from PDF
        resume_text = extract_text_from_pdf(file_bytes)
        print(f"Step 2: Extracted {len(resume_text)} characters of text from PDF.")
        
        if not resume_text or not resume_text.strip():
            print("Step 2 Error: Extracted text is empty.")
            raise HTTPException(
                status_code=400,
                detail="Friendly Error: Could not extract any text from this PDF. "
                       "Please make sure it's a text-based (digital) PDF, not a scanned image."
            )
            
        # Step 3: Use Gemini to extract skills from the resume
        user_skills = extract_skills_from_resume(resume_text)
        print(f"Step 3: Extracted {len(user_skills)} skills using Gemini API: {user_skills}")
        
        if not user_skills:
            print("Step 3 Warning: Gemini did not extract any skills.")
            raise HTTPException(
                status_code=500,
                detail="Friendly Error: We couldn't extract any skills from your resume. "
                       "Make sure your Gemini API Key is configured in the Environment Variables on Render."
            )

        # Step 4: Fetch matching job data from JSearch API
        job_postings = fetch_jobs_for_skills(user_skills)
        print(f"Step 4: Fetched {len(job_postings)} matching job postings from JSearch.")
        
        # Step 5: Calculate skill gaps and match score
        gaps = calculate_skill_gaps(user_skills, job_postings)
        print(f"Step 5: Analyzed skill gaps. Match Score: {gaps['match_score']}%")
        
        # Step 6: Rank missing skills by demand/salary impact
        salary_impact = get_salary_impact(gaps["you_need"], job_postings)
        print(f"Step 6: Calculated market/salary impact for {len(gaps['you_need'])} missing skills.")
        
        # Step 7: Recommend free learning resources for missing skills
        resources = recommend_resources(gaps["you_need"])
        print("Step 7: Found educational learning resources for missing skills.")

        # Step 8: Return compiled analysis JSON
        print("Step 8: Compiling final analysis response and returning data.")
        print("================== ANALYSIS SUCCESSFUL ==================\n")
        
        return {
            "user_skills": user_skills,
            "skill_gaps": gaps,
            "salary_impact": salary_impact,
            "resources": resources,
            "job_count_analyzed": len(job_postings)
        }

    except HTTPException as http_exc:
        # Re-raise HTTP exceptions so FastAPI handles them properly
        raise http_exc
    except Exception as e:
        # Catch-all for unexpected backend crashes
        print(f"CRITICAL ERROR during analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Friendly Error: Something unexpected went wrong on the server while analyzing your resume. "
                   f"Details: {str(e)}"
        )

if __name__ == "__main__":
    print("Starting SkillMap backend on http://127.0.0.1:8000...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
