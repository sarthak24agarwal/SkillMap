import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Retrieve the Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def fallback_extract_skills(text: str) -> list[str]:
    print("Using offline fallback skill extractor...")
    text_lower = text.lower()
    common_skills = [
        "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go",
        "react", "angular", "vue", "node.js", "express", "django", "flask", "fastapi", "spring",
        "docker", "kubernetes", "aws", "azure", "gcp", "sql", "mysql", "postgresql", "mongodb",
        "git", "github", "linux", "html", "css", "tailwind", "machine learning", "data analysis",
        "agile", "scrum", "communication", "leadership", "teamwork", "problem solving"
    ]
    found = []
    for skill in common_skills:
        if skill in text_lower:
            found.append(skill.title() if len(skill) > 3 else skill.upper())
    # If nothing matches, give them something to show UI
    return found if found else ["Python", "Git", "Communication"]

def extract_skills_from_resume(resume_text: str) -> list[str]:
    """
    Calls the Google Gemini API to extract technical and soft skills from the resume text.
    Returns a list of skill names (strings).
    """
    if not resume_text or not resume_text.strip():
        print("Warning: Received empty resume text for skill extraction.")
        return []

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_key_here":
        print("Warning: GEMINI_API_KEY is not set. Falling back to offline scanner.")
        return fallback_extract_skills(resume_text)

    try:
        # Initialize Gemini API
        genai.configure(api_key=GEMINI_API_KEY)
        # Using the extremely fast and free 1.5-flash model
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = (
            "Read this resume text and extract every skill mentioned. "
            "Include programming languages, frameworks, tools, certifications, and soft skills. "
            "Return only a comma-separated list of skill names, nothing else. "
            "Do not write any introductory or concluding text, and do not use bullet points.\n\n"
            f"Resume Text:\n{resume_text}"
        )

        print("Sending resume text to Gemini for skill extraction...")
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.0, # Zero temperature ensures it stays strictly to the formatting rules
            ),
        )
        
        response_text = response.text.strip()
        print("Successfully received response from Gemini API.")
        
        # Clean up the string representation of a Python list if it generated one
        if response_text.startswith("[") and response_text.endswith("]"):
            response_text = response_text[1:-1]
            
        skills = []
        for item in response_text.split(","):
            cleaned_skill = item.strip().strip("'\"`[]")
            if cleaned_skill:
                skills.append(cleaned_skill)
                
        return skills

    except Exception as e:
        print(f"Error calling Gemini API for skill extraction: {e}")
        print("Falling back to offline scanner due to API error...")
        return fallback_extract_skills(resume_text)

if __name__ == "__main__":
    print("=== Standalone Skill Extractor Test ===")
    mock_resume = "Software Engineering Student. Proficient in Python, Java, and JavaScript. Experienced with React, FastAPI, and Docker."
    extracted_skills = extract_skills_from_resume(mock_resume)
    
    print("\n--- Extraction Result ---")
    for skill in extracted_skills:
        print(f"- {skill}")
