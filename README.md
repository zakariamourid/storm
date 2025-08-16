# Storm Clone - Collaborative Ideation Application

This project is a clone of the Hypermind Storm concept, a collaborative ideation platform, with specific modifications for an improved token system and structured phase management.

## Features

- **Storm Creation**: Moderators can launch ideation sessions with customizable parameters (title, description, tokens, time limits ).
- **Anonymous Participation**: Users join Storms with a simple username, no registration required.
- **Structured Phases**: The process is divided into three distinct phases: Ideation, Voting, and Results.
- **Token System**: Participants use blue (positive) and red (negative) tokens to evaluate ideas.
- **Intuitive Interface**: A modern and responsive user interface, built with React and Tailwind CSS.
- **RESTful API**: A robust backend developed with Flask to manage business logic and data persistence.

## Project Structure

storm-clone/          # Main project root
├── storm-clone/      # Frontend React project
│   ├── public/
│   ├── src/
│   │   ├── components/   # React Components (HomePage, StormCreation, StormJoin, StormInterface, IdeationPhase, VotingPhase, ResultsPhase)
│   │   ├── services/     # API Service to interact with the backend (api.js)
│   │   └── App.jsx       # Main application component
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── storm-backend/    # Backend Flask project
│   ├── src/
│   │   ├── database/     # Folder for SQLite database (app.db)
│   │   ├── models/       # Data Models (storm.py, user.py)
│   │   ├── routes/       # API Routes (storm.py, user.py)
│   │   ├── static/       # Frontend static files (after build)
│   │   └── main.py       # Flask application entry point
│   ├── venv/             # Python virtual environment
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Dockerfile for the backend
│
├── Dockerfile.frontend   # Dockerfile for the frontend
└── docker-compose.yml    # Docker Compose file for both services

## Local Setup

### Prerequisites

- Node.js (version 18 or higher) and npm/pnpm
- Python (version 3.9 or higher) and pip
- Git

### 1. Clone the repository (if applicable)

If you are getting these files individually, you won't clone. Just ensure your `storm-clone` folder is set up as described above.

### 2. Backend Setup (Flask)

Navigate to the `storm-clone/storm-backend` directory:

```bash
cd storm-clone/storm-backend
