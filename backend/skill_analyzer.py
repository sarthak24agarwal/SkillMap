# Dict containing high-quality, free learning resources for common developer skills.
# If a student is missing a skill, we use this dictionary to lookup where they can learn it.
RESOURCE_LIBRARY = {
    "python": {
        "resource": "Python for Beginners (Full Course)",
        "url": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        "platform": "YouTube (Programming with Mosh)"
    },
    "react": {
        "resource": "React Quick Start Guide",
        "url": "https://react.dev/learn",
        "platform": "Official Docs"
    },
    "sql": {
        "resource": "SQL Tutorial for Beginners",
        "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        "platform": "YouTube (freeCodeCamp)"
    },
    "docker": {
        "resource": "Docker Handbook for Beginners",
        "url": "https://www.freecodecamp.org/news/the-docker-handbook/",
        "platform": "freeCodeCamp"
    },
    "git": {
        "resource": "Git & GitHub Crash Course",
        "url": "https://www.youtube.com/watch?v=RGOj5yH7evk",
        "platform": "YouTube (Traversy Media)"
    },
    "fastapi": {
        "resource": "FastAPI Tutorial",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "platform": "Official Docs"
    },
    "javascript": {
        "resource": "Modern JavaScript Tutorial",
        "url": "https://javascript.info/",
        "platform": "JavaScript.info"
    },
    "typescript": {
        "resource": "TypeScript Handbook",
        "url": "https://www.typescriptlang.org/docs/",
        "platform": "Official Docs"
    },
    "aws": {
        "resource": "AWS Cloud Practitioner Certification Course",
        "url": "https://www.youtube.com/watch?v=SOTamWGuDKc",
        "platform": "YouTube (freeCodeCamp)"
    },
    "node.js": {
        "resource": "Node.js Complete Course",
        "url": "https://www.youtube.com/watch?v=Oe421EPjeBE",
        "platform": "YouTube (freeCodeCamp)"
    },
    "node": {
        "resource": "Node.js Complete Course",
        "url": "https://www.youtube.com/watch?v=Oe421EPjeBE",
        "platform": "YouTube (freeCodeCamp)"
    }
}

def calculate_skill_gaps(user_skills: list[str], job_postings: list[dict]) -> dict:
    """
    Compares the user's skills against all skills required by the retrieved job postings.
    Returns:
        - "you_have": Skills the user has that the jobs also request.
        - "you_need": Skills requested by jobs that the user is missing.
        - "match_score": A percentage representing the overlap (0 to 100).
    """
    # Convert user skills to lowercase for case-insensitive comparison
    user_skills_lower = {skill.lower() for skill in user_skills}
    
    # Track all unique skills required by all job postings
    all_job_skills = set()
    # Map lowercase versions of skills to their original formatting (e.g. "python" -> "Python")
    # This helps us display skills in their correct casing in the UI
    casing_map = {}
    
    for job in job_postings:
        for skill in job.get("required_skills", []):
            skill_lower = skill.lower()
            all_job_skills.add(skill_lower)
            casing_map[skill_lower] = skill
            
    # Also index casing of user skills in case they aren't in the job postings
    for skill in user_skills:
        skill_lower = skill.lower()
        if skill_lower not in casing_map:
            casing_map[skill_lower] = skill

    # Find the overlap (intersection) and the gaps (difference)
    you_have_lower = user_skills_lower.intersection(all_job_skills)
    you_need_lower = all_job_skills.difference(user_skills_lower)

    # Convert lowercase sets back to lists with their original styling
    you_have = [casing_map[s] for s in you_have_lower]
    you_need = [casing_map[s] for s in you_need_lower]

    # Calculate match score: what percentage of job-required skills does the user possess?
    if all_job_skills:
        match_score = round((len(you_have) / len(all_job_skills)) * 100)
    else:
        # If there are no jobs or the jobs require no skills, the score is 100%
        match_score = 100

    return {
        "you_have": you_have,
        "you_need": you_need,
        "match_score": match_score
    }

def get_salary_impact(missing_skills: list[str], job_postings: list[dict]) -> list[dict]:
    """
    Estimates the importance of each missing skill by counting how many job postings 
    require it, and estimating the 'salary boost' based on frequency and/or pay.
    """
    impacts = []
    total_jobs = len(job_postings)
    
    if total_jobs == 0:
        return []

    for skill in missing_skills:
        skill_lower = skill.lower()
        
        # Count how many jobs mention this specific missing skill
        jobs_count = 0
        for job in job_postings:
            job_skills_lower = [s.lower() for s in job.get("required_skills", [])]
            if skill_lower in job_skills_lower:
                jobs_count += 1
                
        # Determine the salary/demand boost level.
        # Since RapidAPI free tier doesn't always return salary numbers, we use demand as a proxy:
        # - High: Required by 50% or more of jobs
        # - Medium: Required by 20% to 49% of jobs
        # - Low: Required by less than 20% of jobs
        ratio = jobs_count / total_jobs
        if ratio >= 0.5:
            salary_boost = "High"
        elif ratio >= 0.2:
            salary_boost = "Medium"
        else:
            salary_boost = "Low"

        impacts.append({
            "skill": skill,
            "jobs_count": jobs_count,
            "salary_boost": salary_boost
        })
        
    # Sort the results by jobs_count in descending order,
    # so the user sees the most impactful skills they are missing first.
    impacts.sort(key=lambda x: x["jobs_count"], reverse=True)
    return impacts

def recommend_resources(missing_skills: list[str]) -> list[dict]:
    """
    Looks up free learning resources for missing skills.
    If a skill is not in our library, it dynamically generates a useful fallback link.
    """
    recommendations = []
    
    for skill in missing_skills:
        skill_lower = skill.lower()
        
        if skill_lower in RESOURCE_LIBRARY:
            # Found in library
            info = RESOURCE_LIBRARY[skill_lower]
            recommendations.append({
                "skill": skill,
                "resource": info["resource"],
                "url": info["url"],
                "platform": info["platform"]
            })
        else:
            # Fallback: if we don't have a curated link, provide a general freeCodeCamp/YouTube search
            recommendations.append({
                "skill": skill,
                "resource": f"{skill} Beginner Guide / Tutorial",
                "url": f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+tutorial",
                "platform": "YouTube Search"
            })
            
    return recommendations

if __name__ == "__main__":
    print("=== Standalone Skill Analyzer Test ===")
    
    # Mock user skills
    user_skills = ["Python", "Git", "SQL"]
    
    # Mock job postings from jobs_fetcher
    mock_jobs = [
        {"title": "Backend Dev", "company": "A", "required_skills": ["Python", "Docker", "SQL"]},
        {"title": "React Dev", "company": "B", "required_skills": ["React", "JavaScript", "CSS"]},
        {"title": "Fullstack Dev", "company": "C", "required_skills": ["Python", "React", "Docker", "SQL"]},
        {"title": "Python Dev", "company": "D", "required_skills": ["Python", "Git", "FastAPI"]}
    ]
    
    print(f"User Skills: {user_skills}")
    print(f"Total mock jobs: {len(mock_jobs)}")
    
    # Test Gap Calculation
    gaps = calculate_skill_gaps(user_skills, mock_jobs)
    print("\n--- Skill Gaps ---")
    print(f"Match Score: {gaps['match_score']}%")
    print(f"You Have: {gaps['you_have']}")
    print(f"You Need (Gaps): {gaps['you_need']}")
    
    # Test Salary Impact
    impacts = get_salary_impact(gaps["you_need"], mock_jobs)
    print("\n--- Salary/Demand Impact ---")
    for imp in impacts:
        print(f"Skill: {imp['skill']} | Mentioned in {imp['jobs_count']} jobs | Boost: {imp['salary_boost']}")
        
    # Test Recommendations
    recs = recommend_resources(gaps["you_need"])
    print("\n--- Recommended Learning Resources ---")
    for rec in recs:
        print(f"Skill: {rec['skill']} -> Resource: '{rec['resource']}' ({rec['platform']})")
        print(f"  Link: {rec['url']}")
