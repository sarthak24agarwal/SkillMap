import os
import requests
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# ==========================================
# EXPLAINING API KEYS AND ENVIRONMENT VARIABLES
# ==========================================
# What is an API key?
# Think of an API key like a password. It is a unique secret string that verifies our application 
# to a third-party service (like RapidAPI). It prevents unauthorized people from using our account, 
# and service providers use it to track usage and charge us if we exceed limits.
#
# Why put API keys in .env instead of writing them directly in the code?
# Hardcoding API keys (writing them directly in code like RAPIDAPI_KEY = "xyz123") is a critical security risk.
# If you push your code to a public platform like GitHub, anyone can see your key, steal it, use your quotas,
# or run up expensive bills under your name. Bots constantly scan public repositories for leaked API keys.
# Storing keys in a local '.env' file keeps them hidden, and since we add '.env' to '.gitignore', 
# the key stays safely on our local machine while our code can still read it dynamically at runtime.

# Retrieve the RapidAPI key from our environment variables
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "jsearch.p.rapidapi.com"

def fallback_fetch_jobs(skills: list[str]) -> list[dict]:
    print("Using offline mock data fallback for jobs...")
    main_skill = skills[0] if skills else "Software"
    return [
        {
            "title": f"Junior {main_skill} Developer",
            "company": "Tech Innovations Inc.",
            "required_skills": skills[:3] + ["Docker", "AWS"],
            "salary_min": 70000,
            "salary_max": 90000
        },
        {
            "title": f"{main_skill} Engineer",
            "company": "Global Startup Co.",
            "required_skills": skills[:2] + ["Kubernetes", "SQL"],
            "salary_min": 80000,
            "salary_max": 110000
        },
        {
            "title": "Backend Systems Engineer",
            "company": "Enterprise Solutions",
            "required_skills": skills[:4] + ["FastAPI"],
            "salary_min": None,
            "salary_max": None
        }
    ]

def fetch_jobs_for_skills(skills: list[str]) -> list[dict]:
    """
    Searches for jobs matching the user's top skills using the JSearch API from RapidAPI.
    Returns a list of simplified job dictionaries.
    """
    # Defensive check: if no skills are provided, we can't search
    if not skills:
        print("Warning: No skills provided. Cannot search for jobs.")
        return []

    # Verify the API key is configured
    if not RAPIDAPI_KEY or RAPIDAPI_KEY == "your_key_here":
        print("Warning: RAPIDAPI_KEY is not set. Falling back to mock jobs.")
        return fallback_fetch_jobs(skills)

    # To keep API usage low and focused, we'll build a search query using the top 3 skills.
    # E.g., if skills are ['Python', 'React', 'FastAPI', 'Docker'], the query becomes "Python React FastAPI Developer"
    search_skills = skills[:3]
    search_query = f"{' '.join(search_skills)} Developer"
    
    print(f"Searching JSearch API for jobs matching: '{search_query}'...")
    
    url = "https://jsearch.p.rapidapi.com/search"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    params = {
        "query": search_query,
        "num_pages": 1,  # Only fetch 1 page of results to respect API limits
        "page": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        # Check if the HTTP request was successful (status code 200)
        if response.status_code != 200:
            print(f"Error calling JSearch API: HTTP {response.status_code}")
            print(response.text)
            return fallback_fetch_jobs(skills)

        # Parse the JSON response
        data = response.json()
        
        # JSearch API returns jobs under the "data" key in a list
        jobs_list = data.get("data", [])
        
        # Limit results to 10 jobs to stay within limits and keep it fast
        raw_jobs = jobs_list[:10]
        
        processed_jobs = []
        for job in raw_jobs:
            # Get job title and employer name
            title = job.get("job_title", "Unknown Title")
            company = job.get("employer_name", "Unknown Company")
            description = job.get("job_description", "")
            
            # Extract salary if provided (sometimes they are None or null in JSearch)
            salary_min = job.get("job_min_salary")
            salary_max = job.get("job_max_salary")
            
            # JSearch does not always have a clean list of 'required_skills'.
            # Instead, we will scan the job title and description case-insensitively 
            # to see which of the user's skills are mentioned in this job posting.
            matched_skills = []
            desc_lower = description.lower()
            title_lower = title.lower()
            
            for skill in skills:
                skill_lower = skill.lower()
                # Check if the skill string exists in either the title or the body of the job description
                if skill_lower in desc_lower or skill_lower in title_lower:
                    matched_skills.append(skill)
            
            # Build the clean, simplified job object
            processed_job = {
                "title": title,
                "company": company,
                "required_skills": matched_skills,
                "salary_min": salary_min,
                "salary_max": salary_max
            }
            
            processed_jobs.append(processed_job)
            
        print(f"Successfully processed {len(processed_jobs)} jobs from JSearch.")
        return processed_jobs

    except Exception as e:
        # Friendly error handling so a failed API call does not crash our backend
        print(f"Error fetching jobs from JSearch: {e}")
        return fallback_fetch_jobs(skills)

if __name__ == "__main__":
    print("=== Standalone Jobs Fetcher Test ===")
    
    # Example skills list to test the API call
    test_skills = ["Python", "React", "SQL", "Docker", "Git"]
    
    print(f"Testing job search with skills: {test_skills}")
    print("-----------------------------------------")
    
    # Note: This will only succeed if you have a valid RAPIDAPI_KEY in your .env file
    # and have run 'pip install requests python-dotenv'
    jobs = fetch_jobs_for_skills(test_skills)
    
    print("\n--- Search Results ---")
    if jobs:
        for idx, job in enumerate(jobs, 1):
            print(f"\nJob #{idx}:")
            print(f"  Title: {job['title']}")
            print(f"  Company: {job['company']}")
            print(f"  Required Skills Found: {job['required_skills']}")
            print(f"  Salary Range: Min: {job['salary_min']} | Max: {job['salary_max']}")
    else:
        print("No jobs found or API call failed. (Make sure you set a valid RAPIDAPI_KEY in .env to test)")
