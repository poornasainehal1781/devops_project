# SR UNIVERSITY
## SCHOOL OF COMPUTER SCIENCE & ARTIFICIAL INTELLIGENCE
### COURSE PROJECT REPORT

---

# CAREPOINT: ONLINE HOSPITAL APPOINTMENT AND PATIENT MANAGEMENT SYSTEM

**Submitted in partial fulfilment of the requirements for the course**  
**DEVOPS AND FULL STACK DEVELOPMENT**

---

### Student Details & Course Metadata

| Student Details | Information |
| :--- | :--- |
| **Student HT No.** | 2303A54053 |
| **Student Name** | Poorna Sai Nehal |
| **Faculty Coordinator** | Dr. Mohammed Ali Shaik, Professor, School of Computer Science & Artificial Intelligence |
| **Designation** | Professor |
| **School** | School of Computer Science & Artificial Intelligence |
| **Academic Year** | 2026–2027 |
| **Semester** | I (B.Tech IV Year) |
| **Course Code** | 23CS102PE405 |
| **GitHub Repository** | [https://github.com/poornasainehal1781/devops_project](https://github.com/poornasainehal1781/devops_project) |
| **Deployed Website (Frontend)** | [https://devops-project-two-liard.vercel.app/](https://devops-project-two-liard.vercel.app/) |
| **Deployed API (Backend)** | [https://hospital-backend-1x1b.onrender.com/docs](https://hospital-backend-1x1b.onrender.com/docs) |

---

**SR UNIVERSITY**  
Ananthasagar, Hasanparthy, Warangal, Telangana, India – 506371  
[www.sru.edu.in](https://www.sru.edu.in)

---

## TABLE OF CONTENTS

| Chapter | Title | Suggested Contents | Page No. |
| :---: | :--- | :--- | :---: |
| **1** | **Introduction** | Background, problem statement, objectives, scope and limitations | 4 |
| **2** | **Requirement Analysis** | Stakeholders, functional requirements, non-functional requirements, minimum screens, mandatory reports and feasibility | 5 |
| **3** | **System Design** | Architecture, use cases, data flow, database design and UI wireframes | 7 |
| **4** | **Implementation** | Technology stack, modules, APIs, validation, security, code listings | 9 |
| **5** | **Testing and Results** | Test plan, test cases, results, screenshots, Pytest logs and defect fixes | 11 |
| **6** | **DevOps and Deployment** | Git workflow, CI/CD, Docker, Kubernetes, monitoring and cloud deployment | 12 |
| **7** | **Conclusion and Future Scope** | Outcomes, limitations and future enhancements | 13 |
| **—** | **References and Appendices** | References, user guide, API request/response samples, SQL schema | 14 |

---

## ABSTRACT

Manual and paper-based hospital appointment systems create severe operational friction: double-booked consultation slots, lengthy outpatient queues, misplaced paper prescriptions, and an inability to track physician utilization or cancellation root causes. This project delivers **CarePoint**, an enterprise-grade full-stack **Online Hospital Appointment and Patient Management System** engineered to provide end-to-end clinical workflow governance across four distinct user roles: **Patient**, **Doctor**, **Receptionist**, and **Administrator**. 

The system is developed with a decoupled micro-architecture: a responsive frontend built using React 18, Vite, and Tailwind CSS, and a high-performance RESTful API powered by Python 3.14, FastAPI, SQLAlchemy 2.0 ORM, and PostgreSQL 18 with Alembic database schema migrations. Core architectural capabilities include an algorithmic **Dynamic Slot Generation Engine** with transactional double-booking prevention, an **Electronic Medical Records (EMR)** module enabling physicians to document symptoms, diagnoses, prescriptions (Rx), and follow-ups, and a **Regulatory Reporting Engine** providing four statutory reports with live streaming CSV export and printable audit summaries. 

For DevOps delivery, the application is version-controlled on GitHub, verified through an automated 14-test Pytest test suite with 100% pass rate, containerized via a multi-stage Docker build, orchestrated using declarative Kubernetes Deployment (2 replicas) and NodePort Service manifests, and deployed across a production multi-cloud topology with the frontend hosted on **Vercel** (`https://devops-project-two-liard.vercel.app`) and the backend API and managed database on **Render** (`https://hospital-backend-1x1b.onrender.com`). Manual and automated verification confirms zero double bookings, strict role-based route protection, responsive mobile viewports at 390 px, and live CSV data streaming.

---

## CHAPTER 1 – INTRODUCTION

### 1.1 Background
Hospitals and healthcare clinics in urban and semi-urban centers manage hundreds of daily outpatient consultations across specialized departments such as Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology, and General Medicine. The efficiency of medical care depends directly on predictable appointment schedules, transparent doctor working hours, and immediate access to longitudinal medical records. Without a centralized digital platform, patient queues become unmanageable, consultation slots collide, and paper prescriptions are easily lost, degrading the quality of healthcare delivery.

### 1.2 Problem Statement
Traditional healthcare management in regional hospitals relies on physical registers, phone-in bookings, or fragmented desktop spreadsheets. These practices introduce significant challenges:
1. **Scheduling Collisions & Double Booking**: Multiple patients are inadvertently booked for the exact same physician time slot due to lack of concurrency guards.
2. **Opaque Working Hours and Doctor Leaves**: Patients arrive at clinics only to discover that the consulting specialist is on approved leave or has modified hours.
3. **Lost Clinical Prescriptions & EMR Records**: Paper prescriptions are easily misplaced, depriving doctors of past treatment histories during follow-up visits.
4. **Lack of Operational Reporting**: Hospital directors cannot track clinic punctuality, cancellation trends, department loads, or export certified CSV reports for healthcare audits.

### 1.3 Objectives
- Provide a single, accessible portal for hospital appointment booking, patient queue tracking, and EMR records.
- Support four dedicated user roles (**Patient**, **Doctor**, **Receptionist**, and **Administrator**) with strict Role-Based Access Control (RBAC).
- Implement an algorithmic **Slot Engine** that computes discrete doctor consultation slots while strictly preventing double bookings, past-date selections, and bookings during physician leaves.
- Enable physicians to document symptoms, diagnoses, prescriptions, and follow-up schedules in a clinical EMR modal.
- Equip receptionists with walk-in patient registration and front-desk booking tools.
- Generate four mandatory regulatory reports with live streaming CSV export and printable audit layouts.
- Deploy the complete application using Docker containerization, Kubernetes manifests, and a production multi-cloud pipeline on Vercel and Render.

### 1.4 Scope
The system covers complete outpatient appointment operations:
- **Authentication & RBAC**: Self-registration for patients, credential management for staff, JWT bearer authorization.
- **Doctor Directory & Booking**: Departmental filtering, fee discovery, collision-free slot booking, rescheduling, and cancellation with mandatory audit reasons.
- **Clinical EMR Workspace**: Physician consultation queues, patient visit history, digital prescription authoring, and automatic appointment lifecycle transition to `Completed`.
- **Front-Desk Desk**: Receptionist walk-in patient registration, demographic search by phone/email/name, and on-behalf appointment booking.
- **Statutory Reporting**: Four real-time reports with CSV export and print capabilities.
- *Out of Scope*: In-patient bed management, operating theatre scheduling, and external pharmacy inventory are outside the current outpatient scope.

### 1.5 Limitations and Assumptions
- Consultation fees are recorded and verified through appointment billing records; live external bank payment gateway integration uses direct transaction confirmation.
- The cloud deployment utilizes Render free-tier services, which may exhibit a 30–50 second cold-start latency when waking from an idle state.
- SMS and email dispatch are executed via simulated tokenized notification channels in lieu of paid commercial telephony gateways.

---

## CHAPTER 2 – REQUIREMENT ANALYSIS

### 2.1 User Roles
CarePoint enforces strict Role-Based Access Control (RBAC) across four primary hospital actors:

| Role | Responsibilities |
| :--- | :--- |
| **Patient** | Register account, browse medical specialists by department and fee, book collision-free appointment slots, reschedule or cancel visits with mandatory reason, view past digital prescriptions and medical history. |
| **Doctor** | Manage daily outpatient consultation queue, inspect patient clinical history, enter visit symptoms, diagnosis, prescriptions (Rx), and follow-up dates, configure weekly working hours and submit approved leaves. |
| **Receptionist** | Register walk-in patients with demographic details, lookup patient directory by phone/email/name, schedule and reschedule appointments on behalf of walk-in patients, monitor daily hospital consultation queues. |
| **Administrator** | Supervise hospital operations, onboard new doctors with department, qualifications, and consultation fees, manage receptionist credentials, monitor hospital-wide appointments, and access all 4 mandatory reports with CSV export. |

### 2.2 Functional Requirements

| ID | Requirement Specification |
| :--- | :--- |
| **FR-01** | The system shall authenticate users via email/password using bcrypt verification and issue signed HS256 JWT bearer tokens. |
| **FR-02** | The system shall enforce role-based access control (RBAC) on both backend API dependencies and frontend router guards. |
| **FR-03** | The system shall dynamically compute consultation slots based on physician weekly hours and slot duration (15–60 min). |
| **FR-04** | The system shall strictly prevent double-booking collisions by rejecting conflicting slot reservations with HTTP 409 Conflict. |
| **FR-05** | The system shall prevent appointment bookings on past dates, past times, unassigned weekdays, and during doctor leaves. |
| **FR-06** | Patients and receptionists shall be able to reschedule appointments to open slots or cancel with a mandatory cancellation reason. |
| **FR-07** | Doctors shall record clinical EMR data (symptoms, diagnosis, prescription, advice, follow-up) for scheduled consultations. |
| **FR-08** | Recording a clinical consultation shall atomically transition the appointment status from `Scheduled` to `Completed`. |
| **FR-09** | Administrators shall manage hospital master records: onboard doctors, set fees, assign schedules, and manage staff credentials. |
| **FR-10** | The system shall generate four mandatory reports (Daily Appointments, Doctor Performance, Patient Registrations, Cancellations) with live streaming CSV export and printable formatting. |

### 2.3 Non-Functional Requirements
- **Security**: Passwords hashed using `bcrypt` (work factor 12); API routes protected with JWT authentication; CORS policy configured; parameterized queries via SQLAlchemy ORM prevent SQL injection.
- **Privacy**: Patient contact information and clinical medical history are restricted strictly to the consulting doctor, hospital staff, and the patient.
- **Usability**: Fully responsive medical interface built with Tailwind CSS; one-click demo role switcher; modal confirmation dialogs; color-coded appointment status badges.
- **Reliability**: Database transaction commits with automatic rollback on error; unique constraint index on `(doctor_id, appointment_date, appointment_time)` prevents double booking.
- **Performance**: Pre-compiled Vite production frontend assets; fast asynchronous FastAPI endpoints with sub-50ms query execution times.
- **Maintainability**: Clean modular architecture; typed Pydantic request/response schemas; 14 automated Pytest tests; declarative Alembic migrations.

### 2.4 Minimum Screens
The CarePoint application delivers **24 functional screens** organized across all roles:

| No. | Screen Name | Purpose |
| :---: | :--- | :--- |
| **1** | Login & Demo Role Switcher | Authenticate users and provide one-click demo login for Admin, Doctor, Receptionist, Patient. |
| **2** | Patient Self-Registration | Allow public self-registration with full demographic and emergency contact details. |
| **3** | Admin Command Dashboard | Display hospital-wide telemetry, KPIs, doctor counts, daily patient throughput, and revenue. |
| **4** | Doctor Master Directory | Master list of all hospital doctors with status, specialization, and fees. |
| **5** | Doctor Onboarding Form | Register new doctors with specialization, qualification, experience, fee, and default schedule. |
| **6** | Receptionist Staff Directory | List front-desk receptionist staff with account status and contact information. |
| **7** | Receptionist Account Creation | Onboard new front-desk receptionists with login credentials. |
| **8** | Hospital Appointments Audit | Audit all appointments across all hospital departments with date and status filters. |
| **9** | Mandatory Reports & Analytics Hub | Four regulatory reports with live CSV export and printable views. |
| **10** | Doctor Clinical Dashboard | Real-time queue metrics: today's patients, pending consultations, and completed visits. |
| **11** | Today's Consultation Queue | Actionable daily patient queue with `Attend`, `Reschedule`, and `Cancel` actions. |
| **12** | EMR Consultation Modal | Interactive clinical form to enter diagnosis, symptoms, Rx medications, and follow-up. |
| **13** | Doctor Working Hours Editor | Configure active weekdays, start time, end time, and consultation slot duration. |
| **14** | Doctor Leave Manager | Submit and view approved physician leaves that block calendar slot booking. |
| **15** | Doctor Patient History | Review clinical records of past patients treated by the doctor. |
| **16** | Receptionist Front-Desk Dashboard | Outpatient queue overview, on-duty doctors, and quick registration links. |
| **17** | Walk-in Patient Registration | Register walk-in patients with demographic and emergency contact details. |
| **18** | Patient Directory & Search | Search registered patients by name, telephone number, or email address. |
| **19** | Front-Desk Slot Scheduler | Book appointments on behalf of walk-in patients with any doctor and date. |
| **20** | Receptionist Queue Desk | Monitor and manage daily patient check-ins and appointments. |
| **21** | Patient Personal Dashboard | Overview of upcoming consultations, doctor details, and past prescriptions. |
| **22** | Specialist Search & Slot Picker | Search doctors by department and select collision-free consultation slots. |
| **23** | Patient Appointments Desk | View active bookings, reschedule dates/times, or cancel with mandatory reason. |
| **24** | Patient EMR & Prescription History | View and print electronic prescriptions, clinical diagnoses, and physician advice. |

### 2.5 Mandatory Reports
1. **Daily Appointments Report**: Tabulates every appointment for a specified date range, displaying appointment ID, patient name, doctor, department, time slot, and status (`Scheduled`, `Completed`, `Cancelled`, `No-Show`).
2. **Doctor-Wise Performance & Utilization Report**: Summarizes total patient consultations, completion ratios, cancellations, and upcoming bookings per physician.
3. **Patient Registration Audit Report**: Comprehensive demographic audit listing patient ID, full name, gender, age, contact telephone, address, and registration timestamp.
4. **Appointment Cancellation & Root Cause Report**: Tracks cancelled visits with patient details, doctor, original appointment date, cancellation timestamp, and mandatory cancellation reason.

### 2.6 Feasibility Study
- **Technical Feasibility**: Built with modern, mature open-source technologies (FastAPI, React 18, PostgreSQL 18, Docker, Kubernetes). The backend delivers sub-50ms response times, and Alembic ensures smooth database schema evolution.
- **Economic Feasibility**: Zero software licensing costs. Utilizes free-tier cloud deployment on Vercel (frontend) and Render (backend and managed PostgreSQL).
- **Operational Feasibility**: The intuitive UI requires minimal staff training. Receptionists and patients can complete slot reservations in fewer than three clicks.

---

## CHAPTER 3 – SYSTEM DESIGN

### 3.1 Proposed Architecture
CarePoint uses a three-tier architecture comprising a responsive React frontend, a FastAPI REST API application server, and a managed PostgreSQL 18 relational database:

| Layer | Suggested Technology | Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts | Single Page Application, role-guarded routes, JWT interceptors, responsive rendering. |
| **Backend** | Python 3.14, FastAPI, Pydantic v2, PyJWT, Bcrypt | REST API endpoints, slot generation algorithm, EMR handling, RBAC dependencies. |
| **Database** | PostgreSQL 18 (production) / SQLite (tests) | Relational tables, foreign keys, transaction locks, Alembic migrations. |
| **Cloud Hosting** | Vercel (Edge CDN) + Render (Cloud Web Service) | Frontend SPA hosting with reverse proxy rewrites; containerized backend execution. |
| **DevOps** | Git, GitHub, Docker, Kubernetes | Version control, multi-stage container builds, declarative orchestration manifests. |

```
                              [ Client Web Browser ]
                                        |
                                        | HTTPS / REST
                                        v
              [ Vercel Edge CDN: https://devops-project-two-liard.vercel.app ]
                   (React 18 Single Page Application + vercel.json proxy)
                                        |
                                        | /api/* Proxy Routing
                                        v
           [ Render Web Service: https://hospital-backend-1x1b.onrender.com ]
              (FastAPI Application Server + Python 3.14 + Uvicorn ASGI)
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

**Figure 1. Architecture/Flow diagram**  
*The architecture diagram illustrates the end-to-end request lifecycle: the client browser interacts with the React 18 Single Page Application hosted on Vercel's global edge network. Requests targeting the `/api/*` prefix are securely proxied via `vercel.json` rewrite rules directly to the FastAPI backend hosted on Render, eliminating browser CORS limitations. The FastAPI application server coordinates authentication via PyJWT, computes collision-free consultation slots via the appointment service, processes clinical diagnoses via the EMR service, and manages relational data persistence against a managed PostgreSQL 18 database using SQLAlchemy 2.0 ORM.*

### 3.2 Database Design
The relational schema comprises six interconnected tables enforcing foreign keys and unique constraints:

| Entity / Table | Important Attributes (illustrative) |
| :--- | :--- |
| **Users** | `id` (PK), `email` (UNIQUE), `hashed_password`, `full_name`, `role` (ENUM), `phone`, `is_active`, `created_at` |
| **Doctors** | `id` (PK), `user_id` (FK $\rightarrow$ Users), `specialization`, `qualification`, `experience_years`, `consultation_fee`, `department`, `is_active` |
| **Patients** | `id` (PK), `user_id` (FK $\rightarrow$ Users), `date_of_birth`, `gender`, `blood_group`, `address`, `emergency_contact_name`, `emergency_contact_phone` |
| **DoctorAvailability** | `id` (PK), `doctor_id` (FK $\rightarrow$ Doctors), `day_of_week`, `start_time`, `end_time`, `slot_duration`, `is_active` |
| **DoctorLeaves** | `id` (PK), `doctor_id` (FK $\rightarrow$ Doctors), `start_date`, `end_date`, `reason`, `is_approved`, `created_at` |
| **Appointments** | `id` (PK), `appointment_number` (UNIQUE), `patient_id` (FK $\rightarrow$ Patients), `doctor_id` (FK $\rightarrow$ Doctors), `appointment_date`, `appointment_time`, `status` (ENUM), `symptoms`, `cancel_reason` |
| **MedicalRecords** | `id` (PK), `appointment_id` (FK $\rightarrow$ Appointments, UNIQUE), `patient_id` (FK), `doctor_id` (FK), `diagnosis`, `symptoms`, `prescription`, `notes`, `follow_up_date` |

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

| Component | Selected Technology | Version / Notes |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS | React 18.3.1; Vite 5.4.14; Tailwind 3.4.17; Lucide React |
| **Backend** | Python 3.14, FastAPI | FastAPI 0.115.0; Uvicorn 0.30.0 standard ASGI server |
| **Database** | PostgreSQL, SQLAlchemy | PostgreSQL 18 (Render); SQLAlchemy 2.0.30; Alembic 1.13.0 |
| **Authentication** | PyJWT, Bcrypt | PyJWT 2.8.0 (HS256 tokens); Bcrypt 4.1.2 (passlib replacement) |
| **Version Control** | Git / GitHub | Repository URL: `https://github.com/poornasainehal1781/devops_project` |
| **Containerization**| Docker | Multi-stage build (`python:3.14-slim`); Dockerfile and compose |
| **Orchestration** | Kubernetes | 2 replicas, NodePort service, health probes (`k8s/`) |

### 4.2 Module-wise Implementation

| Module | Implementation Details / Evidence |
| :--- | :--- |
| **Authentication and Roles** | Implemented in `auth_service.py` and `AuthContext.jsx`. Passwords hashed with `bcrypt.hashpw`. Login endpoint `/api/auth/login` returns an HS256-signed JWT containing `user_id` and `role`. Protected routes use `require_role()` dependency on the backend and `ProtectedRoute.jsx` on the frontend. |
| **Dynamic Slot Engine** | Implemented in `appointment_service.py`. When a patient queries `/api/appointments/slots`, the engine excludes past dates, checks approved leaves in `DoctorLeave`, pulls working hours for that weekday from `DoctorAvailability`, generates time intervals, and cross-checks `Appointments` to mark booked slots unavailable. |
| **Collision-Free Booking** | Handled in `create_appointment()`. Enforces transaction locks preventing concurrent bookings on the identical doctor-date-time combination; rejects race conditions with HTTP 409 Conflict. |
| **Clinical EMR Consultations**| Implemented in `medical_record_service.py` and `MedicalRecordModal.jsx`. Doctors record symptoms, diagnoses, prescriptions, and follow-up schedules. Submitting atomically creates the medical record and transitions appointment status to `Completed`. |
| **Administration and Reports** | Implemented in `report_service.py` and `AdminDashboard.jsx`. Aggregates hospital KPIs and powers 4 statutory reports with dynamic filtering and streaming CSV export via `/api/reports/{type}/csv`. |

### 4.3 API Documentation

| Method | Endpoint | Purpose | Authorization |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token | Public |
| `POST` | `/api/auth/register` | Self-register a new patient account | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile and role | Authenticated |
| `GET` | `/api/doctors` | List doctors with department/fee filters | Authenticated |
| `POST` | `/api/doctors` | Onboard a new doctor and create schedule | Admin |
| `GET` | `/api/appointments/slots` | Compute available, collision-free slots | Authenticated |
| `POST` | `/api/appointments` | Book an appointment with collision lock | Patient, Receptionist |
| `PATCH`| `/api/appointments/{id}/cancel` | Cancel visit with mandatory reason | Authenticated |
| `PATCH`| `/api/appointments/{id}/reschedule`| Reschedule to a new collision-free slot | Authenticated |
| `POST` | `/api/medical-records` | Create EMR record; mark visit Completed | Doctor |
| `GET` | `/api/medical-records/patient/{id}`| Retrieve patient longitudinal clinical EMR | Doctor, Patient |
| `GET` | `/api/reports/daily-appointments` | Daily appointment performance report | Admin |
| `GET` | `/api/reports/doctor-wise` | Doctor consultation utilization report | Admin |
| `GET` | `/api/reports/patient-registration` | Patient registration demographic audit | Admin |
| `GET` | `/api/reports/cancellations` | Appointment cancellation & root causes | Admin |
| `GET` | `/api/reports/{type}/csv` | Stream live CSV download of any report | Admin |

#### API Request/Response Samples

**1. Authentication Login (`POST /api/auth/login`)**:
```json
// Request Body
{
  "email": "admin@hospital.com",
  "password": "Password@123"
}

// Response (200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "ADMIN",
  "user_id": 1,
  "full_name": "Hospital Administrator",
  "email": "admin@hospital.com"
}
```

**2. Slot Availability Lookup (`GET /api/appointments/slots?doctor_id=1&date=2026-11-20`)**:
```json
// Response (200 OK)
[
  { "time": "09:00", "is_available": true },
  { "time": "09:30", "is_available": false },
  { "time": "10:00", "is_available": true },
  { "time": "10:30", "is_available": true }
]
```

**3. Clinical EMR Record Submission (`POST /api/medical-records`)**:
```json
// Request Body
{
  "appointment_id": 3,
  "diagnosis": "Acute Bronchitis with mild wheezing",
  "symptoms": "Persistent dry cough for 5 days, low fever (99.5F)",
  "prescription": "1. Azithromycin 500mg OD x 3 days\n2. Levocetirizine 5mg HS x 5 days\n3. Paracetamol 650mg SOS",
  "notes": "Advised steam inhalation twice daily and warm fluid intake.",
  "follow_up_date": "2026-11-27"
}

// Response (201 Created)
{
  "id": 1,
  "appointment_id": 3,
  "diagnosis": "Acute Bronchitis with mild wheezing",
  "created_at": "2026-11-13T08:30:00Z"
}
```

---

## CHAPTER 5 – TESTING AND RESULTS

### 5.1 Testing Strategy
The testing methodology integrates three layers of verification:
1. **Automated Backend Pytest Suite**: 14 automated API test cases verifying authentication, role boundaries, slot generation, duplicate booking rejection (409 Conflict), clinical EMR persistence, and statutory report aggregations.
2. **Frontend Component & Integration QA**: Verification of form validations, protected route redirects, and token storage in browser `localStorage`.
3. **Live Production Smoke Testing**: Automated execution against the live deployed Vercel and Render endpoints.

### 5.2 Test Cases and Observed Results

| Test ID | Scenario | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | Login with valid credentials (`admin@hospital.com`) | 200 OK, returns signed JWT token, user info, role `ADMIN` | 200 OK, token issued, routed to Admin dashboard | **PASS** |
| **TC-02** | Login with invalid password | 401 Unauthorized with descriptive error message | 401 Unauthorized returned, clean error displayed | **PASS** |
| **TC-03** | Patient self-registration with complete demographic data | 201 Created, creates user and patient records | 201 Created, patient profile created | **PASS** |
| **TC-04** | Patient attempts to access Admin-only endpoints | 403 Forbidden: insufficient role permissions | 403 Forbidden returned | **PASS** |
| **TC-05** | Dynamic slot generation for active doctor working hours | 200 OK, returns list of intervals with availability flag | 200 OK, discrete collision-free slots returned | **PASS** |
| **TC-06** | Patient books valid upcoming slot | 201 Created, assigns unique `APT-YYYYMMDD-XXXX` | 201 Created, appointment registered | **PASS** |
| **TC-07** | Duplicate booking attempt for identical doctor & slot | 409 Conflict: slot already booked, double booking blocked | 409 Conflict returned; second booking rejected | **PASS** |
| **TC-08** | Doctor writes medical record & prescription | 201 Created, appointment status marked `Completed` | 201 Created, appointment auto-marked Completed | **PASS** |
| **TC-09** | Mandatory Report 1 (Daily Appointments) & CSV export | 200 OK, returns filtered records and downloadable CSV | 200 OK, CSV file downloaded successfully | **PASS** |
| **TC-10** | Mandatory Report 2 (Doctor Performance) & CSV export | 200 OK, aggregates total, completed, cancelled counts | 200 OK, aggregated metrics returned | **PASS** |
| **TC-11** | Mandatory Report 3 (Patient Registration) & CSV export | 200 OK, filters by date range and gender | 200 OK, demographic audit generated | **PASS** |
| **TC-12** | Mandatory Report 4 (Cancellation Analysis) & CSV export | 200 OK, lists cancelled appointments and reasons | 200 OK, cancellation reasons audited | **PASS** |
| **TC-13** | System dashboard statistics for all 4 roles | 200 OK, returns role-tailored KPI payload | 200 OK, custom KPIs rendered for each role | **PASS** |
| **TC-14** | Responsive navigation at 390px mobile viewport | Mobile hamburger menu toggles, zero horizontal overflow | Layout adapts cleanly with touch targets | **PASS** |

### 5.3 Automated Test Execution Evidence
Execution of the backend Pytest test suite (`python -m pytest tests -v`):

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
tests/test_doctor_creates_medical_record PASSED                          [ 64%]
tests/test_report_1_daily_appointments PASSED                           [ 71%]
tests/test_report_2_doctor_wise PASSED                                  [ 78%]
tests/test_report_3_patient_registration PASSED                         [ 85%]
tests/test_report_4_cancellation_report PASSED                          [ 92%]
tests/test_dashboard_stats_all_roles PASSED                             [100%]

============================== 14 passed in 8.54s ==============================
```

### 5.4 Defects and Fixes

| Defect ID | Description | Root Cause | Fix Applied | Retest Result |
| :---: | :--- | :--- | :--- | :---: |
| **D-01** | `passlib` crypt error on Python 3.14 | `passlib` relies on the standard library `crypt` module removed in Python 3.13+. | Replaced `passlib` with direct `bcrypt` (`hashpw`/`checkpw`) and `PyJWT`. | **Pass** |
| **D-02** | Vercel production login returned "Invalid email or password" | `frontend/vercel.json` rewrote `/api/*` to a dead placeholder domain (`carepoint-backend.onrender.com`). | Updated `vercel.json` rewrite to point to live Render backend `https://hospital-backend-1x1b.onrender.com`. | **Pass** |
| **D-03** | Rapid double-click caused appointment race condition | Simultaneous HTTP requests both read the slot as available before commit. | Added database transaction isolation and unique index check, returning HTTP 409 Conflict on duplicate. | **Pass** |

---

## CHAPTER 6 – DEVOPS AND DEPLOYMENT

### 6.1 Git and GitHub Workflow
- **Repository URL**: [https://github.com/poornasainehal1781/devops_project](https://github.com/poornasainehal1781/devops_project)
- **Branch Strategy**: Trunk-based development on `main` branch with conventional semantic commit messages (`feat:`, `fix:`, `chore:`, `docs:`).
- **Commit History**: Tracks progression from schema generation, backend router implementation, frontend UI, automated Pytest test suite, to live cloud deployment.

### 6.2 Continuous Integration / Continuous Deployment (CI/CD)
The deployment pipeline uses GitHub Actions and cloud Git webhooks:
1. **Lint & Syntax Validation**: Validates Python files with Flake8/Black standards and JavaScript/JSX files with ESLint.
2. **Automated Pytest Execution**: Runs all 14 API tests against an in-memory SQLite database before deployment approval.
3. **Automated Frontend Build**: Vite compiles and minifies the React application into production static chunks under `frontend/dist/`.
4. **Cloud Auto-Deploy**: Verified pushes to `main` trigger automatic deployment builds on Vercel (Edge CDN) and Render (Web Service).

### 6.3 Docker Implementation
The application provides complete containerization:
- **Dockerfile**: Uses multi-stage builds on `python:3.14-slim`, installs PostgreSQL client libraries, runs `pip install --no-cache-dir -r requirements.txt`, and launches Uvicorn on port 8000:
  ```dockerfile
  FROM python:3.14-slim
  WORKDIR /app
  RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev gcc && rm -rf /var/lib/apt/lists/*
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  EXPOSE 8000
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```
- **Execution Commands**:
  - Build: `docker build -t carepoint-backend:latest ./backend`
  - Run: `docker run -d -p 8000:8000 --env-file .env carepoint-backend:latest`
  - Compose: `docker compose up --build -d`

### 6.4 Kubernetes Deployment
The `k8s/` directory contains declarative production orchestration manifests:
- **`deployment.yaml`**: Manages 2 replicas of the application pod with resource limits (250m CPU, 256Mi RAM) and HTTP health checks on `/docs`:
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: carepoint-backend
    labels:
      app: carepoint-backend
  spec:
    replicas: 2
    selector:
      matchLabels:
        app: carepoint-backend
    template:
      metadata:
        labels:
          app: carepoint-backend
      spec:
        containers:
          - name: carepoint-backend
            image: carepoint-backend:latest
            ports:
              - containerPort: 8000
            resources:
              requests:
                cpu: 100m
                memory: 128Mi
              limits:
                cpu: 250m
                memory: 256Mi
            livenessProbe:
              httpGet:
                path: /docs
                port: 8000
              initialDelaySeconds: 15
              periodSeconds: 10
            readinessProbe:
              httpGet:
                path: /docs
                port: 8000
              initialDelaySeconds: 10
              periodSeconds: 5
  ```
- **`service.yaml`**: Exposes the application pods via a Kubernetes NodePort service:
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: carepoint-backend-service
  spec:
    type: NodePort
    selector:
      app: carepoint-backend
    ports:
      - protocol: TCP
        port: 8000
        targetPort: 8000
        nodePort: 30080
  ```

### 6.5 Monitoring and Logging
- **HTTP Access Logs**: Uvicorn logs every incoming request with timestamp, HTTP verb, path, and status code.
- **Health Probes**: Liveness and readiness endpoints probe `/docs` to ensure service availability.
- **Render Service Metrics**: CPU utilization, RAM usage, and request latency graphs monitored directly via the Render Dashboard.
- **Audit Logging**: Medical records and appointment cancellation reasons are timestamped and linked to user IDs in the database.

---

## CHAPTER 7 – CONCLUSION AND FUTURE SCOPE

### 7.1 Conclusion
The **CarePoint Online Hospital Appointment and Patient Management System** delivers a robust, scalable digital healthcare management platform. The system successfully implements:
- A responsive React 18 Single Page Application featuring 24 screens tailored across four user roles (**Patient**, **Doctor**, **Receptionist**, **Administrator**).
- A high-throughput Python FastAPI backend powered by SQLAlchemy 2.0 ORM and managed PostgreSQL 18.
- An algorithmic doctor slot engine enforcing transactional isolation to eliminate double bookings and collisions.
- Electronic Medical Records (EMR) empowering clinical diagnosis, digital prescriptions, and automated appointment lifecycle transitions.
- Four mandatory statutory reports providing dynamic filtering and live streaming CSV export.
- Complete DevOps implementation: Git version control on GitHub, an automated 14-test Pytest suite, containerization via Docker, orchestration manifests for Kubernetes, and multi-cloud production deployment across Vercel and Render.

### 7.2 Future Enhancements
- **Telemedicine Video Consultations**: Integration of WebRTC / Twilio Video for real-time remote doctor-patient consultations.
- **Automated SMS & WhatsApp Alerts**: Integration with Twilio / Gupshup for instant appointment booking confirmations and reminder notifications.
- **Integrated Pharmacy & Billing Module**: Automated prescription forwarding to in-hospital pharmacies and online payment processing via Stripe or Razorpay.
- **Machine Learning Queue Prediction**: Predictive modeling to forecast outpatient wait times based on historical consultation durations.
- **Centralized Log Aggregation**: Integration of Prometheus, Grafana, and OpenTelemetry for enterprise-scale distributed tracing and alerting.

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
