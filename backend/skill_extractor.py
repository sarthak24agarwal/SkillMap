import os
from dotenv import load_dotenv
import anthropic

# Load environment variables from the .env file
load_dotenv()

# Retrieve the Claude API key from our environment variables
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

def extract_skills_from_resume(resume_text: str) -> list[str]:
    """
    Calls the Claude API to extract technical and soft skills from the resume text.
    Returns a list of skill names (strings).
    """
    # Defensive check: if no resume text is provided, return an empty list immediately
    if not resume_text or not resume_text.strip():
        print("Warning: Received empty resume text for skill extraction.")
        return []

    # Check if the API key is set and isn't the placeholder from .env.example
    if not CLAUDE_API_KEY or CLAUDE_API_KEY == "your_key_here":
        print("Error: CLAUDE_API_KEY is not set or is still the placeholder. Please set it in your .env file.")
        return []

    try:
        # Initialize the Anthropic client using the API key from our env
        client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
        
        # PROMPT ENGINEERING COMMENT:
        # What is Prompt Engineering?
        # It is the practice of structured phrasing and instructing an LLM (like Claude) 
        # to get the exact output format we want. LLMs are conversational by nature and tend to 
        # generate extra conversational text (like "Sure! Here is the list of skills you requested:").
        # If the LLM returns extra text, our backend program would fail to parse it programmatically.
        # By adding strict constraints in the prompt ("Return only a comma-separated list of skill names, nothing else"),
        # we force Claude to output raw structured text that our Python code can easily parse using split().
        
        prompt = (
            "Read this resume text and extract every skill mentioned. "
            "Include programming languages, frameworks, tools, certifications, and soft skills. "
            "Return only a comma-separated list of skill names, nothing else. "
            "Do not write any introductory or concluding text, and do not use bullet points.\n\n"
            f"Resume Text:\n{resume_text}"
        )

        print("Sending resume text to Claude for skill extraction...")
        
        # Call the Claude API
        # We use the standard claude-3-5-sonnet model as specified in the project stack.
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.0,  # Lower temperature makes the output more deterministic and focused
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the text content from the API response object
        response_text = response.content[0].text.strip()
        print("Successfully received response from Claude API.")
        
        # Parsing:
        # The prompt asked for a comma-separated list. We clean up the result in case Claude 
        # includes brackets (like a python list format) or quotes around items.
        
        # Remove brackets if Claude returned a string representation of a Python list (e.g. "[Python, React]")
        if response_text.startswith("[") and response_text.endswith("]"):
            response_text = response_text[1:-1]
            
        skills = []
        for item in response_text.split(","):
            # Strip whitespace, quotes, and newlines from each skill name
            cleaned_skill = item.strip().strip("'\"`[]")
            if cleaned_skill:
                skills.append(cleaned_skill)
                
        return skills

    except Exception as e:
        # Friendly error handling so a failed API call does not crash our backend server
        print(f"Error calling Claude API for skill extraction: {e}")
        return []

if __name__ == "__main__":
    print("=== Standalone Skill Extractor Test ===")
    
    # Simple mockup test resume to verify extraction logic without running the backend server
    mock_resume = """
    John Doe
    Software Engineering Student at State University
    
    Technical Skills:
    Proficient in Python, Java, and JavaScript. Experienced with React, FastAPI, and Docker.
    Used Git/GitHub for team collaboration.
    
    Certifications:
    AWS Certified Cloud Practitioner.
    
    Soft Skills:
    Strong communication skills, leadership, and agile teamwork.
    """
    
    print("\nExtracting skills from a mock resume...")
    print("-----------------------------------------")
    print(mock_resume.strip())
    print("-----------------------------------------")
    
    # Note: This test will only succeed if you have a valid CLAUDE_API_KEY set in your .env file
    # and have run 'pip install anthropic python-dotenv'
    extracted_skills = extract_skills_from_resume(mock_resume)
    
    print("\n--- Extraction Result ---")
    if extracted_skills:
        print(f"Skills Found ({len(extracted_skills)}):")
        for skill in extracted_skills:
            print(f"- {skill}")
    else:
        print("No skills were extracted. (Make sure you set a valid CLAUDE_API_KEY in .env to test the live API call)")
