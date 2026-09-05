# SkillMap 🚀

## What does this do?
It takes your resume and shows exactly which skills you're missing for the jobs you want.

## Why I built this
As a CSE student applying for software engineering roles, I was tired of blindly guessing what skills I needed to stand out in today's competitive market. I realized most job descriptions ask for the same core technologies, but it takes hours to manually cross-reference them with your own resume. I built SkillMap to automate this process and give students a clear, data-driven learning roadmap.

## How to run it locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SkillMap.git
   cd SkillMap
   ```

2. **Start the FastAPI Backend:**
   ```bash
   cd backend
   # Install dependencies
   pip install -r requirements.txt
   
   # Setup your API keys
   cp .env.example .env
   # Open .env and add your Claude and RapidAPI keys
   
   # Run the server
   uvicorn main:app --reload
   ```

3. **Start the React Frontend:**
   ```bash
   # Open a new terminal tab
   cd ../frontend
   
   # Install dependencies
   npm install chart.js react-chartjs-2
   
   # Run the app
   npm run dev
   ```
4. Open your browser to `http://localhost:5173` and start analyzing!

## Tech I used and why
- **React** — for the interactive UI and seamless drag-and-drop experience.
- **FastAPI** — fast to set up, incredibly efficient, and great for Python AI work.
- **Claude API** — for intelligently reading resumes and extracting exact skills.
- **Chart.js** — simple, beautiful charts without complex setup.
- **JSearch API** — for fetching real-time, accurate job market data.

## What I learned
- How to correctly handle `multipart/form-data` to stream file uploads from a React frontend directly into a Python backend.
- The importance of strict prompt engineering: forcing an LLM (Claude) to return only comma-separated values so my code could reliably parse it without crashing.
- How to merge and analyze data from two completely different third-party APIs (Claude and RapidAPI) into one cohesive user experience.

## What I'd add next
- Connect a SQLite database so users can create accounts and track their match score improving over time.
- Allow users to upload multiple resumes tailored to different job titles (e.g. "Data Scientist" vs "Backend Engineer") and compare their scores.
- Add an export feature to let users download their "Learning Roadmap" as a customized PDF checklist.
