# Online Hospital Appointment and Patient Management System (CarePoint)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-orange)](https://alembic.sqlalchemy.org)
[![Tests](https://img.shields.io/badge/Pytest-100%25_Passing-brightgreen)](https://docs.pytest.org)

An enterprise-grade, full-stack hospital clinical management, appointment scheduling, and electronic medical records (EMR) system. Built with **FastAPI**, **SQLAlchemy**, **PostgreSQL**, **Alembic**, **React.js**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Key System Features

### 1. Four Role-Based Portals & RBAC
* **Admin Portal**: Doctor management, availability schedules, receptionist registrations, patient oversight, hospital appointment audit logs, and regulatory reports.
* **Doctor Portal**: Daily consultation schedule queue, real-time status transitions (Complete, No-show, Cancel), electronic medical records (symptoms, diagnosis, Rx prescriptions, notes, follow-up dates), and patient visit history.
* **Patient Portal**: Doctor search & profile inspection (specialization, experience, qualifications, fees), real-time slot booking engine, appointment rescheduling, self-service cancellation with reason, and digital prescription history.
* **Receptionist Portal**: Front desk admission, patient directory & registration, walk-in appointment booking, schedule management, and daily check-ins.

### 2. Concurrency-Safe Appointment Booking Engine
* **Automated Slot Generation**: Generates 15/30/45/60-minute consultation slots based on physician working schedules.
* **Collision & Double-Booking Prevention**: Database transactions and strict uniqueness validation prevent simultaneous double-booking.
* **Temporal & Absence Validation**: Automatic exclusion of past dates, past time slots, and doctor scheduled leaves.
* **Appointment Statuses**: `Scheduled`, `Confirmed`, `Completed`, `Cancelled`, `No-show`.

### 3. Four Mandatory Regulatory Reports (with Real-time CSV Export)
1. **Report 1: Daily Appointment Report**: Displays Appointment ID, Patient Name, Doctor Name, Date, Time, Status. Filterable by date, doctor, status. Includes instant CSV export.
2. **Report 2: Doctor-Wise Appointment Report**: Aggregates total, completed, cancelled, and upcoming appointments per doctor and department. Includes instant CSV export.
3. **Report 3: Patient Registration Report**: Displays Patient ID, Name, Gender, Age, Phone, Registration Date. Filterable by date range and gender. Includes instant CSV export.
4. **Report 4: Appointment Cancellation Report**: Audits cancelled bookings with Appointment ID, Patient, Doctor, Date, Cancellation Date, and Reason. Includes instant CSV export.

---

## 🔑 Pre-Seeded Demo User Accounts

The database comes pre-seeded with realistic hospital staff, doctors across specialties, patients, appointments, and medical records. All test accounts use the password: `Password@123`

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hospital.com` | `Password@123` | Hospital Administrator |
| **Doctor** | `dr.smith@hospital.com` | `Password@123` | Dr. Sarah Smith (Cardiology) |
| **Doctor** | `dr.johnson@hospital.com` | `Password@123` | Dr. Michael Johnson (Pediatrics) |
| **Doctor** | `dr.chen@hospital.com` | `Password@123` | Dr. Emily Chen (Dermatology) |
| **Doctor** | `dr.williams@hospital.com` | `Password@123` | Dr. David Williams (Orthopedics) |
| **Receptionist** | `reception@hospital.com` | `Password@123` | Rachel Adams (Front Desk) |
| **Patient** | `john.doe@patient.com` | `Password@123` | John Doe (Blood Group: O+) |
| **Patient** | `jane.miller@patient.com` | `Password@123` | Jane Miller (Blood Group: A+) |

*(Tip: The login page also features a **One-Click Quick Switcher** to instantly test any role without typing!)*

---

## 🛠️ Technology Stack

* **Frontend**:
  * React 18 & Vite
  * Tailwind CSS (Medical Blue & Slate palette)
  * React Router DOM (Role-guarded routes)
  * Axios (JWT bearer interceptors)
  * Lucide React Icons
  * Recharts (Clinical activity & department analytics)
* **Backend**:
  * Python 3.11+ / 3.14
  * FastAPI (Async REST APIs, Swagger / ReDoc)
  * SQLAlchemy 2.0 (ORM & Transaction Management)
  * PostgreSQL (Production database) / SQLite (Zero-config local test fallback)
  * Alembic (Database version migrations)
  * PyJWT + bcrypt (Argon2 / bcrypt password security)
  * Pytest + HTTPX (Automated test suite)

---

## 📂 Project Architecture

```
hospital-management-system/
├── backend/
│   ├── alembic/                 # Alembic migration environment & versions
│   │   └── versions/            # Version migration scripts
│   ├── app/
│   │   ├── dependencies/        # JWT auth & RBAC dependency guards
│   │   ├── models/              # SQLAlchemy relational models
│   │   ├── routers/             # FastAPI REST endpoints
│   │   ├── schemas/             # Pydantic schemas & DTOs
│   │   ├── services/            # Business logic, reports, slots engine
│   │   ├── utils/               # Password hashing & JWT helpers
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLAlchemy engine & session factory
│   │   ├── main.py              # Application factory & CORS
│   │   └── seed.py              # Initial dataset seeder
│   ├── tests/                   # Pytest automated test suite
│   ├── alembic.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI (Modals, Badges, Charts, StatCards)
│   │   ├── context/             # AuthContext & Session management
│   │   ├── layouts/             # DashboardLayout with dynamic Sidebar & Navbar
│   │   ├── pages/               # 24 Functional screens (Admin, Doctor, Patient, Reception)
│   │   └── services/            # Axios API client
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── documentation/
│   ├── SRS.md                   # Software Requirements Specification
│   ├── ER_DIAGRAM.md            # Mermaid ER diagram & database schemas
│   ├── API_DOCUMENTATION.md     # Complete REST API reference
│   └── TEST_CASES.md            # Test matrix and Pytest results
├── render.yaml                  # Render deployment configuration
├── vercel.json                  # Vercel SPA deployment configuration
└── README.md
```

---

## 🏃 Quick Start Guide

### 1. Prerequisites
* **Node.js** v18+ and **npm**
* **Python** 3.10+

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# (Optional) Configure PostgreSQL in .env
# DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/hospital_db
# Defaults to SQLite (sqlite:///./hospital.db) for instant zero-configuration local execution.

# Run database migrations
alembic upgrade head

# Start FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000`
Interactive Swagger Docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend Web Application will be running at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

A comprehensive Pytest test suite is included in `backend/tests/`:
```bash
cd backend
python -m pytest tests -v
```
All 14 comprehensive test cases validate authentication, role permissions, slot generation, collision prevention, medical records, all 4 mandatory reports, CSV exports, and telemetry statistics.

---

## 🌐 Production Deployment

### Frontend on Vercel
1. Push project to your GitHub repository.
2. In Vercel, import the repository and select `frontend` as Root Directory.
3. Build Command: `npm run build`, Output Directory: `dist`.
4. Configure Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.
5. Deploy! (SPA routing rewrites are pre-configured in `frontend/vercel.json`).

### Backend & PostgreSQL on Render
1. Create a **PostgreSQL** instance on Render.
2. Create a **Web Service** on Render connected to `backend/`.
3. Set Build Command: `pip install -r requirements.txt`.
4. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add Environment Variables:
   - `DATABASE_URL`: Your Render PostgreSQL Internal Connection String.
   - `SECRET_KEY`: High-entropy random secret key.
   - `ENV`: `production`
6. Deploy!

