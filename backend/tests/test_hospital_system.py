import pytest
from datetime import date, time, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.availability import DoctorAvailability
from app.models.appointment import Appointment, AppointmentStatus
from app.seed import seed_database

# Use in-memory or test database for tests
TEST_DATABASE_URL = "sqlite:///./test_hospital.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db)
    yield
    db.close()
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

def login_as(email: str, password: str = "Password@123") -> dict:
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    data = res.json()
    return {"Authorization": f"Bearer {data['access_token']}"}

# 1. AUTHENTICATION TESTS
def test_login_success():
    res = client.post("/api/auth/login", json={"email": "admin@hospital.com", "password": "Password@123"})
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "ADMIN"
    assert "access_token" in data

def test_login_invalid_password():
    res = client.post("/api/auth/login", json={"email": "admin@hospital.com", "password": "wrongpassword"})
    assert res.status_code == 401

def test_patient_self_registration():
    reg_payload = {
        "email": "new.patient@test.com",
        "password": "Password@123",
        "full_name": "New Registered Patient",
        "phone": "+1-555-9988",
        "date_of_birth": "1994-06-15",
        "gender": "Female",
        "blood_group": "B+",
        "address": "99 Testing Avenue",
        "emergency_contact_name": "Parent",
        "emergency_contact_phone": "+1-555-9989"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["gender"] == "Female"
    assert data["user"]["email"] == "new.patient@test.com"

# 2. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
def test_patient_cannot_access_admin_receptionists():
    patient_headers = login_as("john.doe@patient.com")
    res = client.get("/api/users/receptionists", headers=patient_headers)
    assert res.status_code == 403

def test_admin_can_access_receptionists():
    admin_headers = login_as("admin@hospital.com")
    res = client.get("/api/users/receptionists", headers=admin_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

# 3. DOCTOR MANAGEMENT
def test_admin_create_doctor():
    admin_headers = login_as("admin@hospital.com")
    doc_payload = {
        "email": "dr.house@hospital.com",
        "password": "Password@123",
        "full_name": "Gregory House",
        "phone": "+1-555-4321",
        "specialization": "Diagnostic Medicine",
        "qualifications": "MD, Department Head",
        "experience_years": 20,
        "consultation_fee": 950.00,
        "bio": "Specialist in rare and complex etiologies.",
        "room_number": "Clinic 401",
        "is_available": True
    }
    res = client.post("/api/doctors", json=doc_payload, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["specialization"] == "Diagnostic Medicine"
    assert data["user"]["full_name"] == "Gregory House"

# 4. DOCTOR AVAILABILITY & SLOTS GENERATION
def test_get_available_slots():
    # Dr. Smith is doctor_id=1
    today = date.today()
    # Choose a weekday within next 7 days
    test_date = today + timedelta(days=(7 - today.weekday()) if today.weekday() >= 5 else 1)
    res = client.get(f"/api/doctors/1/slots?date={test_date.isoformat()}")
    assert res.status_code == 200
    data = res.json()
    assert "slots" in data
    assert len(data["slots"]) > 0
    assert "is_available" in data["slots"][0]

# 5. APPOINTMENT BOOKING & DUPLICATE PREVENTION
def test_appointment_booking_and_duplicate_prevention():
    patient_headers = login_as("john.doe@patient.com")
    today = date.today()
    test_date = today + timedelta(days=5)
    # Ensure weekday
    if test_date.weekday() >= 5:
        test_date += timedelta(days=2)

    booking_payload = {
        "doctor_id": 2,  # Dr. Johnson
        "appointment_date": test_date.isoformat(),
        "appointment_time": "14:00:00",
        "reason_for_visit": "General consultation checkup"
    }

    # 1st booking - should succeed
    res1 = client.post("/api/appointments", json=booking_payload, headers=patient_headers)
    assert res1.status_code == 201
    appt_data = res1.json()
    appt_id = appt_data["id"]

    # 2nd booking for same doctor & slot - should fail with 409 Conflict
    res2 = client.post("/api/appointments", json=booking_payload, headers=patient_headers)
    assert res2.status_code in [400, 409]

    # Test rescheduling
    reschedule_payload = {
        "appointment_date": test_date.isoformat(),
        "appointment_time": "14:30:00",
        "reason": "Moved 30 mins later"
    }
    res_reschedule = client.post(f"/api/appointments/{appt_id}/reschedule", json=reschedule_payload, headers=patient_headers)
    assert res_reschedule.status_code == 200
    assert res_reschedule.json()["appointment_time"] == "14:30:00"

    # Test cancellation with reason
    cancel_payload = {
        "cancellation_reason": "Personal conflict with work meeting"
    }
    res_cancel = client.post(f"/api/appointments/{appt_id}/cancel", json=cancel_payload, headers=patient_headers)
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "Cancelled"
    assert res_cancel.json()["cancellation_reason"] == "Personal conflict with work meeting"

# 6. MEDICAL RECORD MANAGEMENT
def test_doctor_creates_medical_record():
    doc_headers = login_as("dr.smith@hospital.com")
    # Today's confirmed appt with id=4 was seeded or we can fetch appointments
    appts_res = client.get("/api/appointments", headers=doc_headers)
    assert appts_res.status_code == 200
    appts = appts_res.json()
    assert len(appts) > 0
    target_appt = appts[0]

    record_payload = {
        "appointment_id": target_appt["id"],
        "symptoms": "Headache, dizziness",
        "diagnosis": "Mild dehydration and fatigue",
        "consultation_notes": "Hydrate adequately and rest.",
        "prescription": "Oral rehydration salts, Paracetamol 500mg PRN",
        "follow_up_date": (date.today() + timedelta(days=7)).isoformat()
    }
    res = client.post("/api/medical-records", json=record_payload, headers=doc_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["diagnosis"] == "Mild dehydration and fatigue"

# 7. FOUR MANDATORY REPORTS TESTS
def test_report_1_daily_appointments():
    admin_headers = login_as("admin@hospital.com")
    res = client.get("/api/reports/daily-appointments", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data

    # CSV export
    csv_res = client.get("/api/reports/daily-appointments/csv", headers=admin_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Appointment ID" in csv_res.text

def test_report_2_doctor_wise():
    admin_headers = login_as("admin@hospital.com")
    res = client.get("/api/reports/doctor-wise", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert "total_appointments" in data["items"][0]

    # CSV export
    csv_res = client.get("/api/reports/doctor-wise/csv", headers=admin_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Doctor Name" in csv_res.text

def test_report_3_patient_registration():
    admin_headers = login_as("admin@hospital.com")
    res = client.get("/api/reports/patient-registration", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert "patient_name" in data["items"][0]

    # CSV export
    csv_res = client.get("/api/reports/patient-registration/csv", headers=admin_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Patient ID" in csv_res.text

def test_report_4_cancellation_report():
    admin_headers = login_as("admin@hospital.com")
    res = client.get("/api/reports/appointment-cancellation", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert "cancellation_reason" in data["items"][0]

    # CSV export
    csv_res = client.get("/api/reports/appointment-cancellation/csv", headers=admin_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Cancellation Reason" in csv_res.text

# 8. DASHBOARD STATS TESTS
def test_dashboard_stats_all_roles():
    for email in ["admin@hospital.com", "dr.smith@hospital.com", "reception@hospital.com", "john.doe@patient.com"]:
        headers = login_as(email)
        res = client.get("/api/stats/dashboard", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "role" in data
        assert "data" in data

