# EXAMORA – Modern Online Examination Management System

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/chrisvjoseph07-rgb/OES-Hackathon)

**EXAMORA** (CampusTest) is a comprehensive, responsive, and robust academic examination management platform designed for modern universities and educational institutions. Built with a full-stack architecture (**React, Node.js, Express, MongoDB/Local-Persistent Storage, Tailwind CSS**), it provides complete role-based access control for **Administrators**, **Faculty members**, and **Students**.

---

## 🌐 Live Access Links

* **GitHub Repository**: [https://github.com/chrisvjoseph07-rgb/OES-Hackathon](https://github.com/chrisvjoseph07-rgb/OES-Hackathon)
* **Instant Live Demo**: [https://neat-seals-pick.loca.lt](https://neat-seals-pick.loca.lt) *(Tunnel password if prompted: `45.249.79.41`)*
* **1-Click Free Cloud Deployment**: Click the **Deploy to Render** button above to host permanently with 1 click.

---

## 🌟 Key Features

### 1. Three Distinct User Roles & Portals
- **Admin Superuser**: Full control over departments, courses, sections, subjects, faculty management, student enrollment (with CSV bulk import), institution-wide exam oversight, question banks, analytics, system announcements, and global configuration.
- **Faculty Portal**: Dedicated workspace for instructors to view assigned students, manage their assigned sections and subjects, create and schedule examinations, manage questions, evaluate student submissions (including descriptive answers), and publish results.
- **Student Portal**: Distraction-free candidate portal filtered strictly by the student's department, course, year, semester, and **section**. Provides real-time notifications, countdown timers for scheduled tests, a full-screen interactive exam console, and instant scorecards.

### 2. Strict Section-Wise Examination Assignment
- Every examination is bound strictly to a **Department**, **Course**, **Year**, **Semester**, **Subject**, and one or more **Sections** (e.g. `CSE-A`).
- Only students enrolled in the matching section can see and attend the examination.
- Backend access-control validates candidate section eligibility upon exam initialization and submission, preventing cross-section access.

### 3. Online Examination Interface
- **Distraction-Free Environment**: Focused interface with timer, subject information, question palette, and intuitive navigation.
- **Question Palette**: Live color-coded question tracker:
  - ⬜ Gray: Unanswered
  - 🟩 Green: Answered
  - 🟪 Purple: Marked for Review
  - 🟦 Blue: Answered & Marked for Review
- **Automatic & Manual Grading**: Instant automated evaluation for MCQs, Multiple-Select, and True/False questions (with configurable positive marks and negative penalty scoring). Descriptive questions support manual faculty grading and feedback.
- **Submission Safeguards**: Page refresh resilience with persistent time tracking, countdown warning at <5 minutes, confirmation dialog showing answered vs unanswered counts, and auto-submission on timer expiry.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Start Backend & Application Server
From the project root:
```bash
cd server
npm start
```
The server will start on `http://localhost:5000` and automatically serve both the **API** (`/api/*`) and the built **React Frontend** (`/*`).

### 2. Development Mode (Optional)
To run the Vite development server with hot module replacement:
```bash
# Terminal 1: Start Backend API
cd server
npm start

# Terminal 2: Start Vite Client
cd client
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Accounts

All accounts use the same standard password for straightforward evaluation:

| Role | Portal | Email | Password |
|---|---|---|---|
| **Admin** | Admin Portal | `admin@examora.com` | `password123` |
| **Faculty** | Faculty Portal | `faculty@examora.com` | `password123` |
| **Student** | Student Portal | `student@examora.com` | `password123` |

> **Tip:** The login screen includes **Quick Demo Fill** buttons at the top to populate any portal's credentials with a single click.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide React, Recharts, React Router v6
- **Backend**: Node.js, Express, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
- **Storage Layer**: Dual-mode engine: connects to MongoDB when `MONGO_URI` is supplied, or uses local JSON persistent storage (`server/data/db.json`) for zero-dependency development.

---

## 📂 Project Structure

```
CampusTest/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, Modal, Layouts
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── auth/         # LoginPage (3-role portal cards)
│   │   │   ├── admin/        # Dashboard, Faculty, Students, Academic, Exams, Results
│   │   │   ├── faculty/      # Dashboard, CreateExam, ManageExams, Submissions
│   │   │   ├── student/      # Dashboard, MyExams, TakeExam, StudentResults
│   │   │   └── common/       # ProfilePage
│   │   ├── services/         # API fetch client
│   │   └── index.css         # Tailwind styles & glassmorphic themes
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── config/               # db.js (Dual-mode persistent storage)
│   ├── controllers/          # auth, admin, faculty, student, question, notification
│   ├── middleware/           # auth (JWT verification & role authorization)
│   ├── routes/               # API route definitions
│   ├── utils/                # jwt helper
│   ├── seed.js               # Auto-seeding script with realistic demo data
│   ├── server.js             # Express entry point
│   └── package.json
└── README.md
```

---

© 2026 EXAMORA – Online Examination Management System.
