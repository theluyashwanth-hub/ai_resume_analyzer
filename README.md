# 🎯 SIGNAL / GAP — AI Resume Analyzer & Mock Interview Engine

> An intelligent full-stack career tool that analyzes your resume against any job description and prepares you for interviews using AI-generated, role-specific questions with real-time voice evaluation.

![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js)
![Stack](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat-square&logo=mongodb)
![Stack](https://img.shields.io/badge/AI-NVIDIA%20NIM%20API-76B900?style=flat-square&logo=nvidia)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-000000?style=flat-square&logo=vercel)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Security Notes](#-security-notes)

---

## ✨ Features

### 🔍 Resume Gap Analyzer
- Upload your resume as a **PDF** file
- Paste any **job description**
- Instantly receive:
  - **Match Score** (% skill alignment)
  - **Matched Skills** — skills you already have
  - **Missing Skills** — gaps to bridge before applying
  - **Strategic Improvement Tips** — actionable advice to strengthen your application

### 🎤 AI Mock Interview Engine
- **Role-aware question generation** — questions dynamically tailored to your specific job title (Data Scientist, DevOps Engineer, Frontend Developer, etc.)
- **Voice-based answering** — uses Web Speech API for hands-free responses
- **AI answer evaluation** — each answer is scored (1–10) with detailed constructive feedback
- **Session summary** — overall performance score and personalized learning takeaways at the end

### 📊 Personal Dashboard
- View your complete **interview history**
- Track your scores and improvement over time
- Review past questions and feedback

### 🔐 Authentication
- Secure **JWT-based** user authentication
- Password hashing with **bcrypt**
- Protected routes — all AI tools accessible only after sign-in

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI Engine** | NVIDIA NIM API (nvidia/nemotron-3.5-lightning-30b-a3b) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **File Parsing** | multer, pdf-parse |
| **Deployment** | Vercel (frontend + serverless API), Render (backend) |

---

## 📁 Project Structure

```
ai_resume/
├── api/
│   └── index.js              # Vercel serverless function entry point
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx        # Login / Register modal
│   │   │   ├── Dashboard.jsx        # Interview history dashboard
│   │   │   ├── Header.jsx           # Navigation header
│   │   │   ├── LandingPage.jsx      # Public landing page
│   │   │   ├── MockInterview.jsx    # Voice interview engine
│   │   │   ├── ResumeAnalyzer.jsx   # Resume upload & gap analysis
│   │   │   └── ScoreDisplay.jsx     # Score visualization component
│   │   ├── services/
│   │   │   └── api.js               # Axios/fetch API wrapper
│   │   ├── App.jsx                  # Root app with routing logic
│   │   ├── index.css                # Global design system & styles
│   │   └── main.jsx                 # React entry point
│   ├── package.json
│   └── vite.config.js
├── middleware/
│   └── auth.js               # JWT verification middleware
├── models/
│   └── User.js               # Mongoose User schema + token generator
├── routes/
│   ├── auth.js               # POST /api/auth/register, /api/auth/login
│   ├── resume.js             # POST /api/resume/analyze
│   └── interview.js          # POST /api/interview/generate, /evaluate, /save
├── services/
│   └── aiService.js          # NVIDIA NIM AI integration + fallback logic
├── .env                      # Local environment variables (never commit!)
├── .gitignore
├── package.json              # Root scripts (start, dev, build)
├── server.js                 # Express server + MongoDB connection
└── vercel.json               # Vercel deployment configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A [MongoDB Atlas](https://cloud.mongodb.com) account (free tier works)
- An [NVIDIA NIM API](https://build.nvidia.com) key (optional — fallback questions work without it)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai_resume.git
cd ai_resume
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root and fill in your values (see Environment Variables section below).

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm --prefix client install
```

### 4. Run in Development Mode

```bash
# Start backend (port 5000)
npm run dev

# In a separate terminal — start frontend (port 5173)
npm --prefix client run dev
```

Open http://localhost:5173 in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the **project root** with these variables:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/resumeai?retryWrites=true&w=majority

# JWT secret — use a long random string
JWT_SECRET=your_super_secret_jwt_key_here

# NVIDIA NIM API key (optional — fallback questions used if not set)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx

# Port (optional, defaults to 5000)
PORT=5000
```

> Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

---

### Resume Analysis

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/resume/analyze` | Analyze resume against job description | Yes |

**Request:** `multipart/form-data`
- `resume` — PDF file
- `jobDescription` — plain text job description

**Response:**
```json
{
  "matchScore": 72,
  "matchedSkills": ["React", "Node.js", "MongoDB"],
  "missingSkills": ["TypeScript", "Docker", "AWS"],
  "improvements": [
    "Add Docker containerization projects to your portfolio",
    "Earn an AWS Cloud Practitioner certification",
    "Contribute to TypeScript open-source projects"
  ]
}
```

---

### Mock Interview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/interview/generate` | Generate role-specific questions | Yes |
| `POST` | `/api/interview/evaluate` | Evaluate a candidate answer | Yes |
| `POST` | `/api/interview/save` | Save completed session to dashboard | Yes |
| `GET`  | `/api/interview/history` | Retrieve past interview sessions | Yes |

**Generate Questions Body:**
```json
{
  "jobDescription": "We are looking for a Data Scientist...",
  "roleTitle": "Data Scientist"
}
```

**Evaluate Answer Body:**
```json
{
  "question": "Explain the bias-variance tradeoff.",
  "answer": "The bias-variance tradeoff is...",
  "roleTitle": "Data Scientist"
}
```

**Evaluation Response:**
```json
{
  "score": 8,
  "feedback": "Strong conceptual understanding demonstrated...",
  "summary": "Focus on providing real-world examples next time."
}
```

---

## 🌐 Deployment

### Vercel (Frontend + Serverless API)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Set the following **Environment Variables** in Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NVIDIA_API_KEY`
4. Vercel will automatically run `npm run build` and deploy

The `vercel.json` configuration handles:
- Serverless API routes via `api/index.js`
- Static frontend from the `dist/` build output
- SPA client-side routing fallback

### Render (Backend Only)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add the same environment variables in Render dashboard

---

## 🔒 Security Notes

- All passwords are hashed with **bcrypt** (salt rounds: 10) before storage
- API routes are protected by **JWT Bearer token** verification middleware
- MongoDB credentials are **strictly loaded from environment variables** — never hardcoded
- File uploads are processed **in-memory** via multer (no files written to disk)
- CORS is configured to allow requests from the frontend origin only

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Yashwanth Thelu**
- GitHub: [@theluyashwanth](https://github.com/theluyashwanth-hub)
- Institution: Sreenidhi Institute of Science and Technology

---

> Built with love as part of an Infosys internship project.
