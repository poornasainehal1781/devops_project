# Hospital REST API Documentation

Base URL: `http://localhost:8000` or deployed backend domain.
Swagger UI Interactive Documentation: `http://localhost:8000/docs`
ReDoc Interactive Documentation: `http://localhost:8000/redoc`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
Authenticates a user and returns a signed JWT bearer token.
- **Request Body**:
```json
{
  "email": "admin@hospital.com",
  "password": "Password@123"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "role": "ADMIN",
  "user_id": 1,
  "full_name": "Hospital Administrator",
  "email": "admin@hospital.com"
}
```

### `POST /api/auth/register`
Self-service patient registration.
- **Request Body**:
```json
{
  "email": "new.patient@example.com",
  "password": "Password@123",
  "full_name": "Sarah Connor",
  "phone": "+1-555-0987",
  "date_of_birth": "1992-04-18",
  "gender": "Female",
  "blood_group": "O+",
  "address": "123 Resistance Rd",
  "emergency_contact_name": "John Connor",
  "emergency_contact_phone": "+1-555-0988"
}
```
- **Response (201 Created)**: Patient object with nested user profile.

### `GET /api/auth/me`
Fetches currently authenticated user details, roles, and linked doctor/patient identifiers.
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Doctors (`/api/doctors`)

### `GET /api/doctors`
List all doctors with optional filters:
- Query parameters:
  - `specialization` (string, optional)
  - `search` (string, optional)
  - `is_available` (boolean, optional)

### `GET /api/doctors/{id}`
Returns doctor details including qualifications, consultation fee, bio, and weekly availability schedule.

### `GET /api/doctors/{id}/slots?date=YYYY-MM-DD`
Computes all discrete appointment slots for the target date based on the doctor's weekly working hours, excluding:
1. Past dates and past time slots
2. Planned doctor leaves
3. Already booked active appointments

### `POST /api/doctors`
*(Admin Only)* Create new doctor profile and user account.

### `PUT /api/doctors/{id}`
*(Admin Only)* Update doctor clinical credentials, fees, and active status.

### `DELETE /api/doctors/{id}`
*(Admin Only)* Deactivate doctor account.

---

## 3. Availability & Leaves (`/api/doctors/{id}/...`)

### `GET /api/doctors/{id}/availability`
Retrieve 7-day consultation schedule.

### `POST /api/doctors/{id}/availability`
*(Admin or Doctor self)* Configure weekly consultation hours and slot interval duration (in minutes).

### `GET /api/doctors/{id}/leaves`
List scheduled doctor leaves and leaves of absence.

### `POST /api/doctors/{id}/leaves`
*(Admin or Doctor self)* Apply for leave duration (`start_date`, `end_date`, `reason`).

---

## 4. Patients (`/api/patients`)

### `GET /api/patients`
*(Staff Only: Admin, Doctor, Receptionist)* Search and list patients.

### `GET /api/patients/{id}`
Get full patient profile.

### `GET /api/patients/{id}/history`
Get patient clinical visit timeline, past appointments, and diagnostic records.

---

## 5. Appointments (`/api/appointments`)

### `GET /api/appointments`
Returns appointments based on user role:
- Patient: Only their own appointments
- Doctor: Only appointments assigned to them
- Admin / Receptionist: Hospital-wide appointments with filter support (`doctor_id`, `patient_id`, `status`, `date`, `search`)

### `POST /api/appointments`
Book appointment.
- **Request Body**:
```json
{
  "doctor_id": 1,
  "appointment_date": "2026-11-10",
  "appointment_time": "10:30:00",
  "reason_for_visit": "Persistent migraine and fatigue",
  "patient_id": 2
}
```
*(Note: `patient_id` is auto-inferred for Patient role)*

### `POST /api/appointments/{id}/reschedule`
Reschedule an appointment to a new date and time.

### `POST /api/appointments/{id}/cancel`
Cancel an appointment.
- **Request Body**:
```json
{
  "cancellation_reason": "Urgent work travel conflict"
}
```

### `PATCH /api/appointments/{id}/status`
Update status (`Confirmed`, `Completed`, `Cancelled`, `No-show`).

---

## 6. Medical Records (`/api/medical-records`)

### `POST /api/medical-records`
*(Doctor Only)* Document clinical consultation:
```json
{
  "appointment_id": 4,
  "symptoms": "Severe acute tension headaches, photophobia",
  "diagnosis": "Episodic Migraine without aura",
  "consultation_notes": "Avoid prolonged screen strain, maintain regular sleep schedule.",
  "prescription": "1. Sumatriptan 50mg PO at onset of headache\n2. Paracetamol 650mg SOS",
  "follow_up_date": "2026-11-24"
}
```
Automatically transitions appointment status to `Completed`.

---

## 7. Mandatory Reports (`/api/reports`)

### Report 1: Daily Appointments
- `GET /api/reports/daily-appointments?date=...&doctor_id=...&status=...`
- `GET /api/reports/daily-appointments/csv` -> Exports CSV file

### Report 2: Doctor-Wise Appointments
- `GET /api/reports/doctor-wise?search=...`
- `GET /api/reports/doctor-wise/csv` -> Exports CSV file

### Report 3: Patient Registration
- `GET /api/reports/patient-registration?start_date=...&end_date=...&gender=...`
- `GET /api/reports/patient-registration/csv` -> Exports CSV file

### Report 4: Appointment Cancellations
- `GET /api/reports/appointment-cancellation?start_date=...&end_date=...`
- `GET /api/reports/appointment-cancellation/csv` -> Exports CSV file

---

## 8. Dashboard Statistics (`/api/stats/dashboard`)
Returns role-tailored real-time telemetry metrics and charts for `ADMIN`, `DOCTOR`, `RECEPTIONIST`, and `PATIENT`.

