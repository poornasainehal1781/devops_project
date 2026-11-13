# Software Requirements Specification (SRS)
## Online Hospital Appointment and Patient Management System

### 1. Introduction
The **Online Hospital Appointment and Patient Management System** (CarePoint) is an enterprise-grade digital healthcare platform engineered to streamline patient consultations, eliminate scheduling collisions, empower clinical electronic medical records (EMR), and deliver regulatory hospital operational reports.

### 2. User Roles & Personas
1. **System Administrator (ADMIN)**:
   - Full governance of hospital master records.
   - Doctor recruitment, deactivation, and specialization assignment.
   - Front-desk receptionist credential management.
   - Hospital-wide appointment auditing and tracking.
   - Access to all four mandatory hospital reports and operational CSV exports.

2. **Physician / Specialist (DOCTOR)**:
   - Authenticated clinical portal.
   - Real-time access to daily and upcoming patient appointment queues.
   - Patient visit history and past prescription lookup.
   - Consultation documentation: chief symptoms, clinical diagnosis, Rx prescriptions, advice, and follow-up schedules.
   - Clinical status updates: mark complete, mark no-show, reschedule, cancel.
   - Working hours and scheduled absence/leave management.

3. **Patient (PATIENT)**:
   - Public self-registration and secure login.
   - Specialist discovery filtered by medical department, qualifications, experience, and consultation fees.
   - Concurrency-safe calendar slot reservation.
   - Appointment rescheduling and self-service cancellation with mandatory reason.
   - Direct access to electronic prescription history, visit diagnosis, and doctor notes.

4. **Front-Desk Receptionist (RECEPTIONIST)**:
   - Walk-in patient registration and demographic profile updates.
   - Patient directory lookup by phone, email, or name.
   - Front-desk appointment desk to schedule, reschedule, and cancel visits on behalf of patients.
   - Daily clinic schedule monitoring.

### 3. Functional Requirements
- **FR-1: Authentication & RBAC**:
  - Secure bcrypt password hashing.
  - JSON Web Tokens (JWT) signed with HS256 algorithm.
  - Granular role guards enforced at both backend API dependencies and frontend router guards.

- **FR-2: Dynamic Availability & Slot Engine**:
  - Automatic slot generation from doctor's weekly active schedule (e.g. 15, 30, 45, 60-minute increments).
  - Collision prevention against already booked slots.
  - Exclusion of past dates and past times.
  - Automatic exclusion of doctor planned leaves and unassigned days.

- **FR-3: Electronic Medical Records (EMR)**:
  - Documented clinical visits containing symptoms, diagnosis, notes, prescription (Rx), and follow-up date.
  - Automatic transition of appointment status to `Completed` upon diagnosis submission.

- **FR-4: Mandatory Regulatory Reports**:
  - **Report 1 (Daily Appointments)**: ID, patient, doctor, date, time, status. Filterable by date, doctor, status.
  - **Report 2 (Doctor-Wise Appointments)**: Doctor name, specialty, total, completed, cancelled, upcoming appointments.
  - **Report 3 (Patient Registration)**: Patient ID, name, gender, age, phone, registration date. Filterable by date range and gender.
  - **Report 4 (Appointment Cancellation)**: Appt ID, patient, doctor, appt date, cancel date, cancel reason.
  - Live CSV download for all 4 reports.

### 4. Non-Functional Requirements
- **Security**: OWASP compliance, SQL injection prevention via SQLAlchemy ORM, no plaintext passwords.
- **Reliability & Concurrency**: Database transaction locks preventing simultaneous double bookings.
- **Performance**: Sub-50ms API response times, client-side pagination and optimized indexed queries.
- **Usability**: Responsive, accessible medical theme utilizing modern Tailwind CSS design patterns.

