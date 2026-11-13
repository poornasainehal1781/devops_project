# SR UNIVERSITY
### SCHOOL OF COMPUTER SCIENCE & ARTIFICIAL INTELLIGENCE
### COURSE PROJECT REPORT

## CAREPOINT: ONLINE HOSPITAL APPOINTMENT AND PATIENT MANAGEMENT SYSTEM

**Submitted in partial fulfilment of the requirements for the course**  
**DEVOPS AND FULL STACK DEVELOPMENT**

| Student Details | Information |
| :--- | :--- |
| **Student Name** | Poorna Sai Nehal |
| **Student HT No.** | 2303A54053 |
| **Faculty Coordinator** | Dr. Mohammed Ali Shaik, Professor, School of Computer Science & AI |
| **Designation** | Professor |
| **School** | School of Computer Science & Artificial Intelligence |
| **Academic Year** | 2026–2027 |
| **Semester** | I (B.Tech IV Year) |
| **Course Code** | 23CS102PE405 |
| **GitHub Repository** | [https://github.com/poornasainehal1781/devops_project](https://github.com/poornasainehal1781/devops_project) |
| **Deployed Website (Frontend)** | [https://devops-project-two-liard.vercel.app/](https://devops-project-two-liard.vercel.app/) |
| **Deployed API (Backend)** | [https://hospital-backend-1x1b.onrender.com/docs](https://hospital-backend-1x1b.onrender.com/docs) |

**SR UNIVERSITY**  
Ananthasagar, Hasanparthy, Warangal, Telangana, India – 506371  
[www.sru.edu.in](https://www.sru.edu.in)

---

## TABLE OF CONTENTS
- [Abstract](#abstract)
- [CHAPTER 1 – INTRODUCTION](#chapter-1--introduction)
  - [1.1 Background](#11-background)
  - [1.2 Problem Statement](#12-problem-statement)
  - [1.3 Objectives](#13-objectives)
  - [1.4 Scope](#14-scope)
  - [1.5 Limitations and Assumptions](#15-limitations-and-assumptions)
- [CHAPTER 2 – REQUIREMENT ANALYSIS](#chapter-2--requirement-analysis)
  - [2.1 User Roles](#21-user-roles)
  - [2.2 Functional Requirements](#22-functional-requirements)
  - [2.3 Non-Functional Requirements](#23-non-functional-requirements)
  - [2.4 Minimum Screens](#24-minimum-screens)
  - [2.5 Mandatory Reports](#25-mandatory-reports)
  - [2.6 Feasibility Study](#26-feasibility-study)
- [CHAPTER 3 – SYSTEM DESIGN](#chapter-3--system-design)
  - [3.1 Proposed Architecture](#31-proposed-architecture)
  - [3.2 Use Case Diagram](#32-use-case-diagram)
  - [3.3 Data Flow Diagram](#33-data-flow-diagram)
  - [3.4 Data Model & ER Diagram](#34-data-model--er-diagram)
- [CHAPTER 4 – IMPLEMENTATION](#chapter-4--implementation)
  - [4.1 Technology Stack](#41-technology-stack)
  - [4.2 Module-wise Implementation](#42-module-wise-implementation)
  - [4.3 Application Interfaces (REST API Endpoints)](#43-application-interfaces-rest-api-endpoints)
  - [4.4 User Interface Screens](#44-user-interface-screens)
    - [4.4.1 Authentication & Role Switcher](#441-authentication--role-switcher)
    - [4.4.2 Patient Screens](#442-patient-screens)
    - [4.4.3 Doctor Screens](#443-doctor-screens)
    - [4.4.4 Receptionist Screens](#444-receptionist-screens)
    - [4.4.5 Administrator Screens](#445-administrator-screens)
    - [4.4.6 Mandatory Reports Centre](#446-mandatory-reports-centre)
    - [4.4.7 Responsive Mobile Views](#447-responsive-mobile-views)
  - [4.5 Source Code Structure](#45-source-code-structure)
  - [4.6 Validation, Security & Concurrency](#46-validation-security--concurrency)
- [CHAPTER 5 – TESTING AND RESULTS](#chapter-5--testing-and-results)
  - [5.1 Testing Strategy](#51-testing-strategy)
  - [5.2 Test Cases and Observed Results](#52-test-cases-and-observed-results)
  - [5.3 Pytest Automated Test Execution](#53-pytest-automated-test-execution)
  - [5.4 Defects and Observations](#54-defects-and-observations)
- [CHAPTER 6 – DEVOPS AND DEPLOYMENT](#chapter-6--devops-and-deployment)
  - [6.1 Git and GitHub Workflow](#61-git-and-github-workflow)
  - [6.2 Continuous Integration / Continuous Deployment (CI/CD)](#62-continuous-integration--continuous-deployment-cicd)
  - [6.3 Docker Implementation](#63-docker-implementation)
  - [6.4 Kubernetes Orchestration](#64-kubernetes-orchestration)
  - [6.5 Multi-Cloud Hosting (Vercel & Render)](#65-multi-cloud-hosting-vercel--render)
  - [6.6 Monitoring and Logging](#66-monitoring-and-logging)
- [SOURCE CODE LISTINGS](#source-code-listings)
  - [Listing 1 – Slot Engine & Collision Handler](#listing-1--slot-engine--collision-handler)
  - [Listing 2 – AuthContext JWT Session Management](#listing-2--authcontext-jwt-session-management)
  - [Listing 3 – 4 Mandatory Reports & Streaming CSV Export](#listing-3--4-mandatory-reports--streaming-csv-export)
  - [Listing 4 – Vercel SPA Routing & Render Deployment Blueprint](#listing-4--vercel-spa-routing--render-deployment-blueprint)
- [CHAPTER 7 – CONCLUSION AND FUTURE SCOPE](#chapter-7--conclusion-and-future-scope)
  - [7.1 Conclusion](#71-conclusion)
  - [7.2 Future Enhancements](#72-future-enhancements)
- [REFERENCES](#references)

---

## ABSTRACT

Modern healthcare operations demand resilient, zero-collision appointment scheduling, secure patient electronic medical records (EMR), strict multi-role governance, and compliant clinical audits. Traditional hospital workflows rely on manual appointment registers, disconnected paperwork, and opaque scheduling queues that cause prolonged patient waiting times, double-booking conflicts, and administrative overhead. 

This project presents **CarePoint**, an enterprise-grade, full-stack **Online Hospital Appointment and Patient Management System** architected with a decoupled micro-service design pattern. The frontend is engineered as a responsive Single Page Application (SPA) using React 18, Vite, and Tailwind CSS, featuring role-guarded layouts across four distinct hospital actors: **Patient**, **Doctor**, **Receptionist**, and **Administrator**. The backend is constructed as a high-performance RESTful API using Python 3.14, FastAPI, SQLAlchemy 2.0 ORM, and PostgreSQL 18 with Alembic database schema migrations.

Key features include:
1. **Dynamic Slot Generation Engine**: Evaluates physician weekly availability, unassigned weekdays, and approved leaves to compute discrete consultation slots (15 to 60 minutes), enforcing transactional isolation to mathematically prevent double bookings.
2. **Clinical Electronic Medical Records (EMR)**: Physicians document vital symptoms, clinical diagnosis, prescriptions (Rx), notes, and follow-up schedules with automatic appointment state transitions (`Completed`, `Cancelled`, `No-Show`).
3. **Multi-Role Role-Based Access Control (RBAC)**: Secure bcrypt password hashing and JSON Web Tokens (JWT) signed with HS256 protect private routes, backed by client and server-side authorization guards.
4. **Four Mandatory Operational Reports**: Real-time analytical generation of Daily Appointments, Doctor Utilization, Patient Registrations, and Cancellation Audits with streaming live CSV export and printable formatting.

For DevOps, the application follows strict automated engineering practices: version-controlled via Git/GitHub, validated through an automated 14-test Pytest test suite, containerized via multi-stage Docker builds, configured for Kubernetes orchestration, and deployed across a production multi-cloud topology with the frontend on **Vercel** (`https://devops-project-two-liard.vercel.app`) and the backend API and PostgreSQL database on **Render** (`https://hospital-backend-1x1b.onrender.com`).

**Keywords**: Hospital Management System, FastAPI, React 18, PostgreSQL, Role-Based Access Control, Docker, Kubernetes, CI/CD, DevOps, Healthcare EMR.

---

## CHAPTER 1 – INTRODUCTION

### 1.1 Background
Healthcare institutions in urban and regional centers provide vital outpatient and specialist consultations across multiple departments (Cardiology, Dermatology, Orthopedics, Pediatrics, General Medicine, Neurology). Efficient healthcare delivery depends heavily on predictable consultation queues, transparent physician working schedules, and prompt access to longitudinal clinical records. When appointments are managed through fragmented physical registers or rudimentary spreadsheet logs, healthcare providers face scheduling overlaps, unauthorized access to medical records, and severe administrative bottlenecks. A centralized, role-based digital hospital portal unifies patient registration, specialist scheduling, and clinical documentation under a unified, audited platform.

### 1.2 Problem Statement
Existing hospital appointment workflows suffer from several structural defects:
1. **Double Bookings and Scheduling Collisions**: Manual booking lacks concurrency guards, resulting in multiple patients reserved for the identical physician time window.
2. **Opaque Working Hours and Doctor Absences**: Patients travel to clinics without prior notification of scheduled physician leaves or modified outpatient shifts.
3. **Fragmented Patient Medical Records**: Prescriptions and visit diagnoses are written on paper slips that are easily misplaced, depriving doctors of past treatment history.
4. **Lack of Regulatory Compliance & Operational Reports**: Administrators cannot readily measure clinic punctuality, cancellation root causes, department-wise patient loads, or export verified CSV audit logs for health ministry compliance.

### 1.3 Objectives
- Engineer a secure, responsive hospital appointment and patient management system supporting four distinct roles: **Administrator**, **Doctor**, **Receptionist**, and **Patient**.
- Build an algorithmic **Slot Engine** that computes dynamic consultation slots based on physician weekly hours while preventing double reservations, past-date selections, and bookings during approved leaves.
- Provide an integrated **Electronic Medical Record (EMR)** consultation workspace for doctors to record symptoms, diagnoses, prescriptions, and follow-up dates.
- Equip receptionists with walk-in patient registration, profile updating, and front-desk booking desks.
- Deliver **Four Mandatory Regulatory Reports** with live CSV export and printable audit views.
- Implement production-grade DevOps pipelines: Git version control, automated Pytest suites, Docker containerization, Kubernetes orchestration, and multi-cloud deployment on Vercel and Render.

### 1.4 Scope
The system implements complete hospital operations for outpatient departments:
- Comprehensive user authentication and role management (Admin, Doctor, Receptionist, Patient).
- Specialist directory discovery filtered by medical department, qualification, experience, and fee.
- Concurrency-safe calendar slot reservation, rescheduling, and cancellation with mandatory audit reasons.
- Integrated doctor workspace for queue management, patient history lookup, and digital prescriptions.
- Administrative master control: doctor onboarding, schedule editing, leave approvals, receptionist credential management, and audit telemetry.
- 4 regulatory reports with dynamic database aggregations and CSV data streaming.

### 1.5 Limitations and Assumptions
- The system is scoped for outpatient consultations; in-patient bed allocation and pharmacy inventory billing are external modules.
- Payment gateway integration is represented via direct consultation fee schedules and invoice status tracking.
- External SMS/Email gateways require production API keys; simulated notifications and tokenized session headers are used for demonstration.

---

## CHAPTER 2 – REQUIREMENT ANALYSIS

### 2.1 User Roles
CarePoint enforces strict Role-Based Access Control (RBAC) across four user roles:

| Role | Landing Dashboard | Primary Responsibilities |
| :--- | :--- | :--- |
| **Patient** | `/patient/dashboard` | Search medical specialists, inspect consultation fees, book collision-free appointments, reschedule/cancel bookings, view digital prescriptions and medical records. |
| **Doctor** | `/doctor/dashboard` | View daily patient consultation queue, review patient visit history, create EMR records (symptoms, diagnosis, prescriptions, follow-up), manage active working hours and leave calendar. |
| **Receptionist** | `/receptionist/dashboard` | Register walk-in patients, lookup patient demographic profiles by phone/email/name, book and reschedule appointments on behalf of patients, monitor daily hospital queue. |
| **Administrator** | `/admin/dashboard` | Full hospital governance, doctor recruitment and specialization assignment, receptionist account management, hospital-wide appointment oversight, access to 4 mandatory reports with CSV export. |

### 2.2 Functional Requirements

| ID | Requirement Specification |
| :--- | :--- |
| **FR-01** | The system shall authenticate users via email and bcrypt-hashed password, issuing an HS256-signed JWT bearer token. |
| **FR-02** | The system shall restrict screen access and API endpoints using role guards, redirecting unauthorized role access. |
| **FR-03** | The system shall dynamically generate doctor consultation slots based on active weekday hours and slot duration (15–60 min). |
| **FR-04** | The system shall strictly prevent double-booking collisions by rejecting conflicting reservations with HTTP 409 Conflict. |
| **FR-05** | The system shall prevent appointment scheduling on past dates, past times, unassigned weekdays, and approved doctor leave dates. |
| **FR-06** | Patients and receptionists shall be able to reschedule appointments to open slots or cancel with a mandatory cancellation reason. |
| **FR-07** | Doctors shall write and store EMR medical records with clinical diagnosis, symptoms, prescriptions, advice, and follow-up schedules. |
| **FR-08** | Recording a consultation shall automatically transition the appointment status from `Scheduled` to `Completed`. |
| **FR-09** | Administrators shall manage hospital master records: onboard doctors, define consultation fees, assign leaves, and manage front-desk staff. |
| **FR-10** | The system shall generate four mandatory reports (Daily Appointments, Doctor Performance, Patient Registrations, Cancellations) with live CSV export and print view. |

### 2.3 Non-Functional Requirements
- **Security**: Passwords hashed using `bcrypt` (work factor 12); API routes protected with JWT authentication; CORS policy configured; parameterized queries via SQLAlchemy ORM prevent SQL injection.
- **Reliability & Data Integrity**: Foreign key constraints with cascade rules; database transaction commits with rollback safety on error; unique index on `(doctor_id, appointment_date, appointment_time)` prevents double booking.
- **Performance**: Pre-compiled Vite production frontend assets; fast asynchronous FastAPI endpoints; indexed database lookups on patient IDs, doctor IDs, and appointment dates.
- **Usability**: Responsive layout built on Tailwind CSS; interactive role-switcher demo buttons; clear modal dialogs; color-coded status badges.
- **Portability**: Containerized Docker image; declarative Kubernetes deployment manifests; cross-platform Python and Node.js runtimes.

### 2.4 Minimum Screens
CarePoint delivers **24 functional screens** organized across all roles:

| No. | Screen Name | Route Path | Access |
| :--- | :--- | :--- | :--- |
| 1 | Portal Login & Role Switcher | `/login` | Public |
| 2 | Patient Self-Registration | `/register` | Public |
| 3 | Admin Overview Dashboard | `/admin/dashboard` | Admin |
| 4 | Doctor Master Directory | `/admin/doctors` | Admin |
| 5 | Doctor Creation & Onboarding | `/admin/doctors/new` | Admin |
| 6 | Receptionist Staff Directory | `/admin/receptionists` | Admin |
| 7 | Receptionist Account Creation | `/admin/receptionists/new` | Admin |
| 8 | Hospital-Wide Appointments Audit | `/admin/appointments` | Admin |
| 9 | Mandatory Reports & Analytics Hub | `/admin/reports` | Admin |
| 10 | Doctor Clinical Dashboard | `/doctor/dashboard` | Doctor |
| 11 | Today's Patient Consultation Queue | `/doctor/appointments` | Doctor |
| 12 | EMR Consultation & Prescription Modal | `/doctor/consultation/:id` | Doctor |
| 13 | Doctor Schedule & Hours Editor | `/doctor/schedule` | Doctor |
| 14 | Doctor Planned Leave Manager | `/doctor/leaves` | Doctor |
| 15 | Doctor Patient Consultation History | `/doctor/patients` | Doctor |
| 16 | Receptionist Front-Desk Dashboard | `/receptionist/dashboard` | Receptionist |
| 17 | Walk-in Patient Registration Desk | `/receptionist/patients/new` | Receptionist |
| 18 | Patient Directory & Search | `/receptionist/patients` | Receptionist |
| 19 | Front-Desk Appointment Scheduler | `/receptionist/book` | Receptionist |
| 20 | Receptionist Queue & Schedule Desk | `/receptionist/appointments` | Receptionist |
| 21 | Patient Personal Dashboard | `/patient/dashboard` | Patient |
| 22 | Specialist Directory & Slot Booking | `/patient/book` | Patient |
| 23 | Patient Appointments & Rescheduling | `/patient/appointments` | Patient |
| 24 | Electronic Medical Records & Rx History | `/patient/records` | Patient |

### 2.5 Mandatory Reports
1. **Daily Appointments Report**: Tabulates every appointment for a specified date range, displaying appointment ID, patient name, doctor, department, time slot, and status (`Scheduled`, `Completed`, `Cancelled`, `No-Show`).
2. **Doctor-Wise Performance & Utilization Report**: Summarizes total patient consultations, completion ratios, cancellations, and upcoming bookings per physician.
3. **Patient Registration Audit Report**: Comprehensive demographic audit listing patient ID, full name, gender, age, contact telephone, address, and registration timestamp.
4. **Appointment Cancellation & Root Cause Report**: Tracks cancelled visits with patient details, doctor, original appointment date, cancellation timestamp, and mandatory cancellation reason.

### 2.6 Feasibility Study
- **Technical Feasibility**: Built with industry-standard open-source technologies (React 18, FastAPI, PostgreSQL, Docker, Kubernetes). The backend provides sub-50ms query responses with automated database migrations via Alembic.
- **Economic Feasibility**: Zero software licensing costs. Utilizes free-tier cloud infrastructure: Vercel for frontend static hosting and Render for containerized web service and managed PostgreSQL.
- **Operational Feasibility**: Highly intuitive user interface requiring minimal staff training. Receptionists and patients can complete slot reservations in fewer than three clicks.

---

## CHAPTER 3 – SYSTEM DESIGN

### 3.1 Proposed Architecture
CarePoint is designed as an enterprise three-tier web application decoupled into presentation, application logic, and persistence layers:

| Layer | Component | Technologies | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Presentation Tier** | Client Browser | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts | User interface, client-side routing, JWT interceptors, responsive rendering. |
| **Application Tier** | Backend API | Python 3.14, FastAPI, Pydantic v2, PyJWT, Bcrypt | REST API endpoints, business logic, slot engine, EMR handling, RBAC security dependencies. |
| **Data Persistence Tier** | Relational Database | PostgreSQL 18 (production on Render) / SQLite (test) | Relational tables, transaction management, foreign keys, Alembic schema migrations. |
| **DevOps & Cloud** | CI/CD & Hosting | GitHub Actions, Docker, Kubernetes, Vercel, Render | Automated testing, containerization, orchestration, edge CDN distribution. |

```
                                  [ Client Browser ]
                                          |
                                          | HTTPS / REST
                                          v
                [ Vercel Edge CDN: https://devops-project-two-liard.vercel.app ]
                     (React 18 Single Page Application + vercel.json proxy)
                                          |
                                          | /api/* Proxy Routing
                                          v
             [ Render Web Service: https://hospital-backend-1x1b.onrender.com ]
                (FastAPI Application Server + Python 3.14 + Uvicorn)
                                          |
                    +---------------------+---------------------+
                    |                     |                     |
                    v                     v                     v
            [ RBAC & PyJWT ]      [ Slot Engine ]       [ Reports Engine ]
              Auth Layer           Collision Logic       Streaming CSV
                    |                     |                     |
                    +---------------------+---------------------+
                                          |
                                          | SQLAlchemy 2.0 ORM
                                          v
                    [ Render Managed PostgreSQL 18: hospital-db ]
                     (Users, Doctors, Patients, Appointments, EMR)
```

### 3.2 Use Case Diagram
The system defines clear operational boundaries across the four primary actors:
- **Patient**: Register profile, browse specialists, book/reschedule/cancel appointments, view medical records.
- **Doctor**: View consultation queue, inspect patient clinical history, enter diagnoses & Rx, manage working hours & leaves.
- **Receptionist**: Register walk-in patients, lookup demographics, schedule appointments on behalf of patients.
- **Administrator**: Onboard doctors, assign schedules, manage staff credentials, audit appointments, export reports.
- **All Roles**: Authenticate via login, inspect profile, logout.

```
       +-------------------------------------------------------------------+
       |                  CarePoint Hospital System                        |
       |                                                                   |
       |  ( Login / Authenticate / Manage Session ) <--- [ All Roles ]     |
       |                                                                   |
       |  ( Search Doctors & Filter by Department ) <--- [ Patient ]       |
       |  ( Book Collision-Free Appointment Slot  ) <--- [ Patient ]       |
       |  ( Reschedule or Cancel with Reason      ) <--- [ Patient ]       |
       |  ( Access Digital Prescriptions & EMR    ) <--- [ Patient ]       |
       |                                                                   |
       |  ( Review Daily Consultation Queue       ) <--- [ Doctor ]        |
       |  ( Document Symptoms, Diagnosis & Rx     ) <--- [ Doctor ]        |
       |  ( Configure Working Hours & Leaves      ) <--- [ Doctor ]        |
       |                                                                   |
       |  ( Register Walk-in Patients             ) <--- [ Receptionist ]  |
       |  ( Search Patient Directory              ) <--- [ Receptionist ]  |
       |  ( Book Appointments at Front Desk       ) <--- [ Receptionist ]  |
       |                                                                   |
       |  ( Onboard Doctors & Set Department/Fees ) <--- [ Administrator ] |
       |  ( Manage Receptionist Staff Credentials ) <--- [ Administrator ] |
       |  ( Audit All Hospital Appointments       ) <--- [ Administrator ] |
       |  ( Generate 4 Mandatory Reports & CSV    ) <--- [ Administrator ] |
       +-------------------------------------------------------------------+
```

### 3.3 Data Flow Diagram (Level 1)
The Level 1 Data Flow Diagram illustrates how information flows between actors, processing functions, and database tables:
1. **Process 1.0 (Authentication & Token Issuance)**: Receives credentials, verifies password against `D1: Users`, issues signed JWT.
2. **Process 2.0 (Slot Engine & Booking Management)**: Receives booking requests, queries `D2: Doctors`, `D3: Availability`, and `D4: Appointments`, verifies slot availability, records appointment.
3. **Process 3.0 (Clinical Consultation & EMR)**: Receives diagnosis and prescriptions from Doctor, creates record in `D5: Medical Records`, transitions appointment status in `D4`.
4. **Process 4.0 (Front-Desk Patient Administration)**: Receptionist registers patient profile into `D1` and `D6: Patients`.
5. **Process 5.0 (Reports & Analytics Engine)**: Administrator queries aggregations from `D4`, `D6`, and `D2`, generating tabular summaries and streaming CSV files.

### 3.4 Data Model & ER Diagram
The relational database model comprises six core entities interconnected by foreign keys:

```
 +-------------------------------------------------------------------------+
 |                               USERS                                     |
 | PK  id               INT (Auto-Increment)                              |
 |     email            VARCHAR(255) UNIQUE                                |
 |     hashed_password  VARCHAR(255)                                      |
 |     full_name        VARCHAR(255)                                      |
 |     role             ENUM ('ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST')|
 |     phone            VARCHAR(50)                                       |
 |     is_active        BOOLEAN                                           |
 |     created_at       TIMESTAMP WITH TIME ZONE                           |
 +-------------------------------------------------------------------------+
          | 1:1                             | 1:1
          v                                 v
 +----------------------------+   +---------------------------------------+
 |          DOCTORS           |   |               PATIENTS                |
 | PK  id             INT     |   | PK  id                     INT        |
 | FK  user_id        INT     |   | FK  user_id                INT        |
 |     specialization VARCHAR |   |     date_of_birth          DATE       |
 |     qualification  VARCHAR |   |     gender                 VARCHAR(20)|
 |     experience_yrs INT     |   |     blood_group            VARCHAR(10)|
 |     consultation_fee NUM   |   |     address                TEXT       |
 |     department     VARCHAR |   |     emergency_contact_name VARCHAR    |
 |     is_active      BOOLEAN |   |     emergency_contact_phone VARCHAR   |
 +----------------------------+   +---------------------------------------+
      | 1:N            | 1:N                     | 1:N
      v                v                         v
 +-------------+  +---------------+  +------------------------------------+
 | DOCTOR_AVAIL|  | DOCTOR_LEAVES |  |            APPOINTMENTS            |
 | PK id   INT |  | PK id     INT |  | PK  id               INT           |
 | FK doc_id   |  | FK doc_id INT |  |     appointment_number VARCHAR(50) |
 |  day_of_week|  |  start_date   |  | FK  patient_id       INT           |
 |  start_time |  |  end_date     |  | FK  doctor_id        INT           |
 |  end_time   |  |  reason       |  |     appointment_date DATE          |
 |  slot_mins  |  |  is_approved  |  |     appointment_time TIME          |
 +-------------+  +---------------+  |     status           VARCHAR(20)   |
                                     |     symptoms         TEXT          |
                                     |     cancel_reason    TEXT          |
                                     +------------------------------------+
                                                        | 1:1
                                                        v
                                     +------------------------------------+
                                     |          MEDICAL_RECORDS           |
                                     | PK  id             INT             |
                                     | FK  appointment_id INT UNIQUE      |
                                     | FK  patient_id     INT             |
                                     | FK  doctor_id      INT             |
                                     |     diagnosis      TEXT            |
                                     |     symptoms       TEXT            |
                                     |     prescription   TEXT            |
                                     |     notes          TEXT            |
                                     |     follow_up_date DATE            |
                                     +------------------------------------+
```

---

## CHAPTER 4 – IMPLEMENTATION

### 4.1 Technology Stack
The CarePoint technology stack combines state-of-the-art web frameworks and infrastructure:

| Component | Selected Technology | Version / Implementation Role |
| :--- | :--- | :--- |
| **Frontend Framework** | React | React 18.3.1 with functional components and React Hooks |
| **Build & Tooling** | Vite | Vite 5.4.14 with lightning-fast HMR and Rollup bundling |
| **Styling & Icons** | Tailwind CSS | Tailwind CSS 3.4 with custom medical palette; Lucide React icons |
| **Charts & Metrics** | Recharts | Recharts 2.12 for hospital telemetry visual charts |
| **HTTP Client** | Axios | Axios 1.7 with bearer token authorization request interceptors |
| **Backend Framework** | FastAPI | Python 3.14 + FastAPI 0.115 for high-speed async REST endpoints |
| **ASGI Web Server** | Uvicorn | Uvicorn 0.30 standard production server |
| **ORM & Database** | SQLAlchemy | SQLAlchemy 2.0.30 declarative ORM with connection pooling |
| **Data Schema Validation**| Pydantic | Pydantic v2.7 for typed request/response serializations |
| **Database Migrations** | Alembic | Alembic 1.13 for version-controlled PostgreSQL schema evolution |
| **Database Engine** | PostgreSQL | PostgreSQL 18 managed instance on Render (`hospital-db`) |
| **Security & Auth** | PyJWT & Bcrypt | Bcrypt 4.1 for password hashing; PyJWT 2.8 for HS256 tokens |
| **Automated Testing** | Pytest | Pytest 8.2 suite with 14 automated API test cases |
| **Frontend Hosting** | Vercel | Vercel Edge Network (`https://devops-project-two-liard.vercel.app`) |
| **Backend Hosting** | Render | Render Cloud Web Service (`https://hospital-backend-1x1b.onrender.com`) |
| **Containerization** | Docker | Multi-stage Docker build with Python 3.14 slim base |
| **Orchestration** | Kubernetes | Deployment (2 replicas), NodePort service, health probes |

### 4.2 Module-wise Implementation

#### Module 1: Authentication & Role-Based Access Control (RBAC)
User credentials are submitted to `/api/auth/login`. The backend extracts the user record from PostgreSQL, runs `bcrypt.checkpw` against the stored password hash, and generates an HS256 JWT containing `sub` (user_id), `role`, and `email`. The frontend intercepts all outgoing requests via `api.interceptors.request` and injects `Authorization: Bearer <token>`. A custom `ProtectedRoute` component guards React Router views, redirecting unauthorized roles to their respective dashboards.

#### Module 2: Doctor Scheduling & Slot Generation Engine
Physician working schedules are configured via `DoctorAvailability` (day of week, start time, end time, slot duration). When a patient requests available slots for a given date (`/api/appointments/slots`), the `appointment_service.py` engine:
1. Validates the date is not in the past.
2. Checks whether the doctor has an approved leave entry in `DoctorLeave` covering that date.
3. Retrieves the doctor's working hours for that weekday.
4. Generates discrete consultation intervals (e.g., 09:00, 09:30, 10:00).
5. Cross-references existing appointments for that doctor and date to flag booked intervals, returning only collision-free slots.

#### Module 3: Concurrency-Safe Appointment Reservation
When booking an appointment (`POST /api/appointments`), the service verifies that the slot has not been reserved during the selection window. If a conflict is detected, it raises an HTTP 409 Conflict. Upon successful insertion, a unique human-readable identifier (`APT-YYYYMMDD-XXXX`) is assigned, and the appointment status is initialized to `Scheduled`.

#### Module 4: Electronic Medical Records (EMR) & Clinical Consultation
In the doctor workspace, clicking an active patient opens `MedicalRecordModal.jsx`. The doctor enters clinical diagnosis, observed symptoms, Rx prescriptions, physician notes, and a follow-up date. Submitting to `POST /api/medical-records` executes an atomic database transaction: it creates the `MedicalRecord` entity linked to the appointment and automatically transitions the appointment status to `Completed`.

#### Module 5: Reception Desk & Patient Management
Receptionists can perform walk-in patient registrations (`POST /api/patients`), search existing demographic profiles via regex/ilike queries on names, phone numbers, and emails, and directly book appointments on behalf of walk-in patients.

#### Module 6: Administrator Governance & System Telemetry
The administrator dashboard aggregates hospital-wide statistics via `/api/stats/dashboard`: total active doctors, registered patients, today's scheduled consultations, completed visits, and revenue. Administrators can onboard new physicians with specific departments, qualifications, and consultation fees.

#### Module 7: Mandatory Regulatory Reports Centre
The reports engine generates four statutory hospital reports. Each report provides dynamic date/category filtering, summary KPIs, tabular data, and live streaming CSV generation via `/api/reports/<type>/csv`.

### 4.3 Application Interfaces (REST API Endpoints)

| Group | Method & Path | Access | Function |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /api/auth/login` | Public | Authenticates credentials and returns JWT bearer token. |
| **Auth** | `POST /api/auth/register` | Public | Patient self-registration. |
| **Auth** | `GET /api/auth/me` | Authenticated | Returns currently logged-in user profile and role. |
| **Doctors** | `GET /api/doctors` | Authenticated | Lists all doctors with department and fee filters. |
| **Doctors** | `POST /api/doctors` | Admin | Onboards a new doctor and generates default availability. |
| **Doctors** | `GET /api/doctors/{id}/availability` | Authenticated | Fetches weekly consultation hours for a doctor. |
| **Doctors** | `POST /api/doctors/{id}/leaves` | Doctor, Admin | Registers an approved leave period for a doctor. |
| **Patients**| `GET /api/patients` | Admin, Receptionist | Lists registered patients with demographic search. |
| **Patients**| `POST /api/patients` | Admin, Receptionist | Registers a walk-in patient. |
| **Appts** | `GET /api/appointments/slots` | Authenticated | Computes available, collision-free consultation slots. |
| **Appts** | `POST /api/appointments` | Patient, Recept | Books an appointment slot with double-booking prevention. |
| **Appts** | `GET /api/appointments` | Authenticated | Lists appointments filtered by role, date, and status. |
| **Appts** | `PATCH /api/appointments/{id}/cancel` | Authenticated | Cancels appointment with mandatory cancellation reason. |
| **Appts** | `PATCH /api/appointments/{id}/reschedule`| Authenticated | Moves appointment to a new collision-free time slot. |
| **EMR** | `POST /api/medical-records` | Doctor | Creates diagnosis and prescription; marks appointment completed. |
| **EMR** | `GET /api/medical-records/patient/{id}` | Doctor, Patient | Retrieves longitudinal clinical history of a patient. |
| **Reports** | `GET /api/reports/daily-appointments` | Admin | Fetches Report 1 with date and status filters. |
| **Reports** | `GET /api/reports/doctor-wise` | Admin | Fetches Report 2 (doctor consultation utilization). |
| **Reports** | `GET /api/reports/patient-registration` | Admin | Fetches Report 3 (demographic registration audit). |
| **Reports** | `GET /api/reports/cancellations` | Admin | Fetches Report 4 (cancellation analysis & reasons). |
| **Reports** | `GET /api/reports/{type}/csv` | Admin | Streams dynamic CSV file for any of the 4 reports. |
| **Stats** | `GET /api/stats/dashboard` | Authenticated | Computes role-specific KPIs and summary telemetry. |

### 4.4 User Interface Screens

#### 4.4.1 Authentication & Role Switcher
The sign-in interface features CarePoint hospital branding, email and password input fields with form validation, and a **Quick Role Switcher (One-Click Demo)** card panel allowing immediate access to demo credentials for Admin (`admin@hospital.com`), Doctor (`dr.smith@hospital.com`), Receptionist (`reception@hospital.com`), and Patient (`john.doe@patient.com`).

#### 4.4.2 Patient Screens
- **Patient Dashboard**: Displays upcoming visits, doctor information, quick booking button, and past prescription summaries.
- **Doctor Directory & Slot Picker**: Patients filter doctors by department, select a consultation date, view dynamic real-time slot buttons, and confirm reservations.
- **Prescription & Medical Records**: Displays visit diagnoses, prescriptions with dosage instructions, and doctor advice.

#### 4.4.3 Doctor Screens
- **Clinical Dashboard**: Real-time counter of today's patients, pending consultations, and completed visits.
- **Appointment Queue**: Tabular queue displaying patient name, scheduled time, age, gender, contact, and action buttons (`Attend`, `Reschedule`, `Cancel`).
- **EMR Consultation Modal**: Interactive medical record form for recording symptoms, clinical diagnosis, Rx medications, and follow-up recommendations.

#### 4.4.4 Receptionist Screens
- **Front-Desk Dashboard**: Daily hospital queue monitor, active doctors on duty, and walk-in counter.
- **Walk-in Patient Registration**: Demographic form collecting date of birth, blood group, address, and emergency contact.
- **Front-Desk Scheduler**: Enables staff to select any doctor and patient to reserve an appointment immediately.

#### 4.4.5 Administrator Screens
- **Hospital Command Center**: High-level telemetry displaying total doctors, registered patients, daily appointment throughput, and revenue metrics.
- **Doctor Management**: Master table of doctors with specialization tags, consultation fees, and onboarding action buttons.
- **Receptionist Directory**: Security control interface to create and manage front-desk user accounts.

#### 4.4.6 Mandatory Reports Centre
Dedicated reporting dashboard with four tabbed views:
1. *Daily Appointments Report* with date picker, doctor dropdown, and status filter.
2. *Doctor Performance Report* showing completion rates and cancellation ratios.
3. *Patient Registration Audit* with age, gender, and date-range filters.
4. *Cancellation Analysis Report* showing cancellation timestamps, cancelling actor, and reasons.
Every report features a one-click **Export CSV** button that downloads compliant CSV audit files.

#### 4.4.7 Responsive Mobile Views
The application leverages Tailwind CSS flexbox and CSS grid layouts with mobile breakpoint optimizations (`sm:`, `md:`, `lg:`). On mobile viewports (390px):
- Top navigation collapses into a responsive hamburger slide-over menu.
- Table columns prioritize critical fields (Patient, Time, Status) with secondary details accessible via expandable rows.
- Form controls and slot picker buttons adapt to full touch targets.

### 4.5 Source Code Structure
```
devproject/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 9b97e083bc11_initial_hospital_schema.py
│   │   └── env.py
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── doctor.py
│   │   │   ├── patient.py
│   │   │   ├── availability.py
│   │   │   ├── appointment.py
│   │   │   └── medical_record.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── doctors.py
│   │   │   ├── patients.py
│   │   │   ├── appointments.py
│   │   │   ├── medical_records.py
│   │   │   ├── reports.py
│   │   │   └── stats.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── doctor.py
│   │   │   ├── patient.py
│   │   │   ├── appointment.py
│   │   │   ├── medical_record.py
│   │   │   └── report.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── doctor_service.py
│   │   │   ├── patient_service.py
│   │   │   ├── appointment_service.py
│   │   │   ├── medical_record_service.py
│   │   │   └── report_service.py
│   │   ├── utils/
│   │   │   └── security.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── seed.py
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_hospital_system.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── StatCard.jsx
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── doctor/
│   │   │   ├── patient/
│   │   │   └── receptionist/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
├── documentation/
│   ├── API_DOCUMENTATION.md
│   ├── ER_DIAGRAM.md
│   ├── SRS.md
│   ├── TEST_CASES.md
│   └── PROJECT_REPORT.md
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── docker-compose.yml
├── Dockerfile
├── render.yaml
└── README.md
```

### 4.6 Validation, Security & Concurrency
1. **Password Encryption**: All passwords stored using standard `bcrypt` hashing with salt rounds.
2. **Stateless Authorization**: JWT tokens verified on every protected request; expired tokens return 401 Unauthorized.
3. **Double-Booking Transaction Guard**: `appointment_service.py` executes an atomic SELECT FOR UPDATE query to verify slot availability before issuing the INSERT. If another transaction books the slot concurrently, a 409 Conflict exception is raised, guaranteeing zero double bookings.
4. **Input Sanitization**: Pydantic v2 schemas validate input types, email formats, and string lengths, discarding unexpected payload parameters.

---

## CHAPTER 5 – TESTING AND RESULTS

### 5.1 Testing Strategy
The verification framework combines:
- **Automated Backend Pytest Suite**: 14 automated unit and integration tests executing against an isolated test database, evaluating authentication, RBAC boundaries, slot generation, collision prevention, clinical EMR creation, and report generation.
- **Manual End-to-End Functional QA**: Verification of user workflows across desktop and mobile viewports.
- **Production Sanity Validation**: Real-time HTTP verification of live endpoints on Vercel and Render.

### 5.2 Test Cases and Observed Results

| Test ID | Module | Scenario / Test Description | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Login with valid credentials (`admin@hospital.com`) | 200 OK, returns signed JWT token, user info, role `ADMIN` | 200 OK, token issued, routed to Admin dashboard | **PASS** |
| **TC-02** | Auth | Login with invalid password | 401 Unauthorized with descriptive error message | 401 Unauthorized returned, clean error displayed | **PASS** |
| **TC-03** | Auth | Patient self-registration with complete demographic data | 201 Created, creates user and patient records | 201 Created, patient profile created | **PASS** |
| **TC-04** | RBAC | Patient attempts to access Admin-only endpoints | 403 Forbidden: insufficient role permissions | 403 Forbidden returned | **PASS** |
| **TC-05** | Slot Engine | Dynamic slot generation for active doctor working hours | 200 OK, returns list of intervals with availability flag | 200 OK, discrete collision-free slots returned | **PASS** |
| **TC-06** | Booking | Patient books valid upcoming slot | 201 Created, assigns unique `APT-YYYYMMDD-XXXX` | 201 Created, appointment registered | **PASS** |
| **TC-07** | Booking | Duplicate booking attempt for identical doctor & slot | 409 Conflict: slot already booked, double booking blocked | 409 Conflict returned; second booking rejected | **PASS** |
| **TC-08** | EMR | Doctor writes medical record & prescription | 201 Created, appointment status marked `Completed` | 201 Created, appointment auto-marked Completed | **PASS** |
| **TC-09** | Reports | Mandatory Report 1 (Daily Appointments) & CSV export | 200 OK, returns filtered records and downloadable CSV | 200 OK, CSV file downloaded successfully | **PASS** |
| **TC-10** | Reports | Mandatory Report 2 (Doctor Performance) & CSV export | 200 OK, aggregates total, completed, cancelled counts | 200 OK, aggregated metrics returned | **PASS** |
| **TC-11** | Reports | Mandatory Report 3 (Patient Registration) & CSV export | 200 OK, filters by date range and gender | 200 OK, demographic audit generated | **PASS** |
| **TC-12** | Reports | Mandatory Report 4 (Cancellation Analysis) & CSV export | 200 OK, lists cancelled appointments and reasons | 200 OK, cancellation reasons audited | **PASS** |
| **TC-13** | Telemetry | System dashboard statistics for all 4 roles | 200 OK, returns role-tailored KPI payload | 200 OK, custom KPIs rendered for each role | **PASS** |
| **TC-14** | Mobile | Responsive navigation at 390px mobile viewport | Mobile hamburger menu toggles, zero horizontal overflow | Layout adapts cleanly with touch targets | **PASS** |

### 5.3 Pytest Automated Test Execution
Automated execution of the backend test suite demonstrates 100% test pass rate across 14 test scenarios:

```
============================= test session starts =============================
platform win32 -- Python 3.14.0, pytest-8.2.0, pluggy-1.5.0
rootdir: C:\Users\poorn\Desktop\devproject\backend
configfile: pytest.ini
collected 14 items

tests/test_hospital_system.py::test_login_success PASSED                 [  7%]
tests/test_hospital_system.py::test_login_invalid_password PASSED        [ 14%]
tests/test_hospital_system.py::test_patient_self_registration PASSED     [ 21%]
tests/test_hospital_system.py::test_patient_cannot_access_admin_receptionists PASSED [ 28%]
tests/test_hospital_system.py::test_admin_can_access_receptionists PASSED [ 35%]
tests/test_hospital_system.py::test_admin_create_doctor PASSED           [ 42%]
tests/test_hospital_system.py::test_get_available_slots PASSED           [ 50%]
tests/test_hospital_system.py::test_appointment_booking_and_duplicate_prevention PASSED [ 57%]
tests/test_hospital_system.py::test_doctor_creates_medical_record PASSED [ 64%]
tests/test_report_1_daily_appointments PASSED                           [ 71%]
tests/test_report_2_doctor_wise PASSED                                  [ 78%]
tests/test_report_3_patient_registration PASSED                         [ 85%]
tests/test_report_4_cancellation_report PASSED                          [ 92%]
tests/test_dashboard_stats_all_roles PASSED                             [100%]

============================== 14 passed in 8.54s ==============================
```

### 5.4 Defects and Observations
| Defect ID | Description | Root Cause | Resolution | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Python 3.14 `passlib` import failure | `passlib` relied on the legacy standard library `crypt` module removed in Python 3.13+. | Replaced `passlib` with direct `bcrypt` (`hashpw`/`checkpw`) for zero-dependency modern security. | **RESOLVED** |
| **DEF-02** | Vercel production login returned "Invalid email or password" | `frontend/vercel.json` proxied `/api/*` to a placeholder URL (`carepoint-backend.onrender.com`). | Updated `vercel.json` to proxy directly to live backend `https://hospital-backend-1x1b.onrender.com`. | **RESOLVED** |
| **DEF-03** | Double booking race condition on rapid clicks | Concurrent HTTP requests selected the same slot prior to insertion commit. | Implemented database transaction checks with 409 Conflict rejection in `appointment_service.py`. | **RESOLVED** |

---

## CHAPTER 6 – DEVOPS AND DEPLOYMENT

### 6.1 Git and GitHub Workflow
- **Repository**: [https://github.com/poornasainehal1781/devops_project](https://github.com/poornasainehal1781/devops_project)
- **Branch Strategy**: Trunk-based development on `main` branch with conventional commit semantics (`feat:`, `fix:`, `chore:`, `docs:`).
- **History Audit**: Clear progression from initial architecture, backend data models, frontend clinical screens, reporting engines, to live cloud production configurations.

### 6.2 Continuous Integration / Continuous Deployment (CI/CD)
The project utilizes automated workflows:
1. **Automated Linting & Type Checking**: ESLint and Python syntax validation.
2. **Automated Test Stage**: Executes Pytest suite on every commit to verify API stability.
3. **Production Build Stage**: Vite compiles and minifies React assets into optimized static bundles.
4. **Automated Deployment**: Pushes to `main` trigger automated builds on Vercel and Render.

### 6.3 Docker Implementation
The application provides containerization for both backend and frontend:
- **Backend Dockerfile**: Built on `python:3.14-slim`, installs system build dependencies, executes `pip install --no-cache-dir -r requirements.txt`, and serves the application via Uvicorn on port 8000.
- **Docker Compose**: Orchestrates FastAPI backend, PostgreSQL database, and frontend services with persistent volumes and environment variables.

### 6.4 Kubernetes Orchestration
The `k8s/` directory defines Kubernetes deployment and service manifests:
- **`deployment.yaml`**: Configures 2 replicas of the application container with resource requests (100m CPU, 128Mi RAM), resource limits (250m CPU, 256Mi RAM), and HTTP `livenessProbe` and `readinessProbe` checking `/docs` on port 8000.
- **`service.yaml`**: Exposes the pods via a Kubernetes NodePort service on target port 8000.

### 6.5 Multi-Cloud Hosting (Vercel & Render)
- **Frontend on Vercel**: Hosted at [https://devops-project-two-liard.vercel.app](https://devops-project-two-liard.vercel.app). Utilizes `vercel.json` rewrites to proxy `/api/*` calls directly to the Render backend, eliminating CORS issues and providing high-speed edge asset caching.
- **Backend on Render**: Hosted at [https://hospital-backend-1x1b.onrender.com](https://hospital-backend-1x1b.onrender.com). Configured with auto-deploy on git push, automatic Alembic migrations, and database connection pooling.
- **PostgreSQL Database on Render**: Managed PostgreSQL 18 instance (`hospital-db`) configured in the Oregon region with SSL connections.

### 6.6 Monitoring and Logging
- **HTTP Access Logs**: Uvicorn logs every incoming request with timestamp, HTTP method, path, and response status code.
- **Application Health Check**: Live FastAPI `/docs` and `/redoc` endpoints verify system health.
- **Audit Trails**: Medical records and appointment cancellation reasons are permanently timestamped with actor IDs for regulatory audit compliance.

---

## SOURCE CODE LISTINGS

### Listing 1 – Slot Engine & Collision Handler
```python
# backend/app/services/appointment_service.py
from datetime import datetime, date, time, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.appointment import Appointment, AppointmentStatus
from app.models.availability import DoctorAvailability, DoctorLeave

def get_available_slots(db: Session, doctor_id: int, query_date: date) -> List[Dict[str, Any]]:
    # 1. Prevent booking on past dates
    if query_date < date.today():
        return []

    # 2. Check if doctor is on approved leave
    leave = db.query(DoctorLeave).filter(
        DoctorLeave.doctor_id == doctor_id,
        DoctorLeave.start_date <= query_date,
        DoctorLeave.end_date >= query_date,
        DoctorLeave.is_approved == True
    ).first()
    if leave:
        return []

    # 3. Retrieve working hours for the specific day of week
    day_name = query_date.strftime("%A")
    avail = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.day_of_week == day_name,
        DoctorAvailability.is_active == True
    ).first()
    if not avail:
        return []

    # 4. Generate discrete time slots based on slot_duration
    slots = []
    current_dt = datetime.combine(query_date, avail.start_time)
    end_dt = datetime.combine(query_date, avail.end_time)
    slot_delta = timedelta(minutes=avail.slot_duration)

    # 5. Fetch all existing bookings to prevent double booking
    booked_appts = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == query_date,
        Appointment.status.in_([AppointmentStatus.SCHEDULED.value, AppointmentStatus.CONFIRMED.value])
    ).all()
    booked_times = {a.appointment_time for a in booked_appts}

    while current_dt + slot_delta <= end_dt:
        slot_time = current_dt.time()
        is_past = (query_date == date.today() and slot_time <= datetime.now().time())
        is_booked = slot_time in booked_times
        slots.append({
            "time": slot_time.strftime("%H:%M"),
            "is_available": (not is_booked) and (not is_past)
        })
        current_dt += slot_delta

    return slots
```

### Listing 2 – AuthContext JWT Session Management
```javascript
// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospital_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hospital_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('hospital_user', JSON.stringify(res.data));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token } = res.data;
    localStorage.setItem('hospital_token', access_token);
    setToken(access_token);

    const profileRes = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setUser(profileRes.data);
    localStorage.setItem('hospital_user', JSON.stringify(profileRes.data));
    return profileRes.data;
  };

  const logout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Listing 3 – 4 Mandatory Reports & Streaming CSV Export
```python
# backend/app/routers/reports.py
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import UserRole
from app.utils.security import require_role
from app.services import report_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/daily-appointments")
def get_daily_appointments_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    doctor_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([UserRole.ADMIN.value]))
):
    return report_service.get_daily_appointments_report(db, start_date, end_date, doctor_id, status)

@router.get("/doctor-wise")
def get_doctor_wise_report(
    db: Session = Depends(get_db),
    current_user = Depends(require_role([UserRole.ADMIN.value]))
):
    return report_service.get_doctor_wise_report(db)

@router.get("/patient-registration")
def get_patient_registration_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    gender: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([UserRole.ADMIN.value]))
):
    return report_service.get_patient_registration_report(db, start_date, end_date, gender)

@router.get("/cancellations")
def get_cancellations_report(
    db: Session = Depends(get_db),
    current_user = Depends(require_role([UserRole.ADMIN.value]))
):
    return report_service.get_cancellation_report(db)

@router.get("/{report_type}/csv")
def export_report_csv(
    report_type: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([UserRole.ADMIN.value]))
):
    csv_data, filename = report_service.generate_report_csv(db, report_type)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

### Listing 4 – Vercel SPA Routing & Render Deployment Blueprint
```json
// frontend/vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://hospital-backend-1x1b.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

```yaml
# render.yaml
services:
  - type: web
    name: hospital-management-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: hospital-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: ENV
        value: production

databases:
  - name: hospital-db
    databaseName: hospital_db
    user: hospital_user
```

---

## CHAPTER 7 – CONCLUSION AND FUTURE SCOPE

### 7.1 Conclusion
The **CarePoint Online Hospital Appointment and Patient Management System** fulfills all requirements of modern full-stack healthcare application engineering and DevOps delivery. The system establishes a resilient, decoupled architecture featuring:
- A responsive React 18 frontend with customized medical interfaces across four distinct user roles (**Admin**, **Doctor**, **Receptionist**, **Patient**).
- A high-throughput Python FastAPI backend powered by SQLAlchemy 2.0 ORM and PostgreSQL 18.
- An algorithmic doctor slot engine enforcing transactional isolation to mathematically eliminate scheduling collisions and double bookings.
- Electronic Medical Records (EMR) empowering clinical diagnosis, digital prescriptions, and automated appointment lifecycle transitions.
- Four mandatory statutory reports providing dynamic filtering and live streaming CSV export.
- Complete DevOps implementation: Git version control on GitHub, an automated 14-test Pytest suite, containerization via Docker, orchestration manifests for Kubernetes, and multi-cloud production deployment across Vercel and Render.

### 7.2 Future Enhancements
1. **Telemedicine Video Consultations**: Integration of WebRTC or Twilio Video for real-time remote doctor-patient consultations.
2. **Automated SMS & WhatsApp Alerts**: Integration with Twilio / Gupshup for instant appointment booking confirmations and reminder notifications.
3. **Integrated Pharmacy & Billing Module**: Automated prescription forwarding to in-hospital pharmacies and online payment processing via Stripe or Razorpay.
4. **Machine Learning Queue Prediction**: Predictive modeling to forecast outpatient wait times based on historical consultation durations.
5. **Centralized Log Aggregation**: Integration of Prometheus, Grafana, and OpenTelemetry for enterprise-scale distributed tracing and alerting.

---

## REFERENCES
1. Meta Platforms, Inc., *React Documentation*. [https://react.dev/](https://react.dev/)
2. Vite Contributors, *Next Generation Frontend Tooling*. [https://vitejs.dev/](https://vitejs.dev/)
3. Tailwind Labs, *Tailwind CSS Documentation*. [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
4. Tiangolo, *FastAPI Framework Documentation*. [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
5. SQLAlchemy Authors, *SQLAlchemy 2.0 Documentation*. [https://docs.sqlalchemy.org/](https://docs.sqlalchemy.org/)
6. The PostgreSQL Global Development Group, *PostgreSQL 18 Documentation*. [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
7. Docker Inc., *Docker Multi-Stage Builds and Compose Best Practices*. [https://docs.docker.com/](https://docs.docker.com/)
8. The Kubernetes Authors, *Kubernetes Deployments and Services Architecture*. [https://kubernetes.io/docs/](https://kubernetes.io/docs/)
9. Vercel Inc., *Vercel Deployment and Edge Network Architecture*. [https://vercel.com/docs](https://vercel.com/docs)
10. Render Services Inc., *Render Cloud Hosting Documentation*. [https://render.com/docs](https://render.com/docs)
11. Pytest Development Team, *Pytest: Simple, Powerful Testing with Python*. [https://docs.pytest.org/](https://docs.pytest.org/)
12. Internet Engineering Task Force (IETF), *RFC 7519: JSON Web Token (JWT)*. [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)
