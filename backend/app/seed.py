from datetime import date, time, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.availability import DoctorAvailability, DoctorLeave
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical_record import MedicalRecord
from app.utils.security import hash_password

def seed_database(db: Session = None):
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # Check if already seeded
        admin_exists = db.query(User).filter(User.email == "admin@hospital.com").first()
        if admin_exists:
            print("Database already seeded.")
            return

        print("Seeding initial hospital data...")

        # 1. Admin
        admin = User(
            email="admin@hospital.com",
            hashed_password=hash_password("Password@123"),
            full_name="Hospital Administrator",
            role=UserRole.ADMIN.value,
            phone="+1-555-0001",
            is_active=True
        )
        db.add(admin)

        # 2. Receptionist
        receptionist = User(
            email="reception@hospital.com",
            hashed_password=hash_password("Password@123"),
            full_name="Rachel Adams",
            role=UserRole.RECEPTIONIST.value,
            phone="+1-555-0002",
            is_active=True
        )
        db.add(receptionist)
        db.flush()

        # 3. Doctors
        doctors_meta = [
            {
                "email": "dr.smith@hospital.com",
                "name": "Sarah Smith",
                "phone": "+1-555-0111",
                "spec": "Cardiology",
                "qual": "MD, FACC, Fellowship in Interventional Cardiology",
                "exp": 12,
                "fee": Decimal("750.00"),
                "room": "Cardiology Suite 101",
                "bio": "Board-certified Cardiologist specializing in adult cardiac care, hypertension, echocardiography, and preventative heart health."
            },
            {
                "email": "dr.johnson@hospital.com",
                "name": "Michael Johnson",
                "phone": "+1-555-0112",
                "spec": "Pediatrics",
                "qual": "MD, FAAP",
                "exp": 9,
                "fee": Decimal("500.00"),
                "room": "Children's Pavilion 204",
                "bio": "Compassionate pediatrician committed to child development, immunization management, and adolescent medicine."
            },
            {
                "email": "dr.chen@hospital.com",
                "name": "Emily Chen",
                "phone": "+1-555-0113",
                "spec": "Dermatology",
                "qual": "MD, Board Certified Dermatologist",
                "exp": 11,
                "fee": Decimal("600.00"),
                "room": "Derma Clinic 305",
                "bio": "Expert in diagnostic dermatology, eczema, acne management, and dermatologic surgeries."
            },
            {
                "email": "dr.williams@hospital.com",
                "name": "David Williams",
                "phone": "+1-555-0114",
                "spec": "Orthopedics",
                "qual": "MS Ortho, FRCS",
                "exp": 16,
                "fee": Decimal("800.00"),
                "room": "Orthopedics Center 108",
                "bio": "Senior orthopedic surgeon specializing in joint replacements, sports injuries, and spine conditions."
            }
        ]

        created_doctors = []
        for d in doctors_meta:
            u = User(
                email=d["email"],
                hashed_password=hash_password("Password@123"),
                full_name=d["name"],
                role=UserRole.DOCTOR.value,
                phone=d["phone"],
                is_active=True
            )
            db.add(u)
            db.flush()

            doc = Doctor(
                user_id=u.id,
                specialization=d["spec"],
                qualifications=d["qual"],
                experience_years=d["exp"],
                consultation_fee=d["fee"],
                room_number=d["room"],
                bio=d["bio"],
                is_available=True
            )
            db.add(doc)
            db.flush()
            created_doctors.append(doc)

            # Add weekly availability (Mon-Fri 09:00 to 17:00, Sat 09:00 to 13:00)
            for day in range(5):
                db.add(
                    DoctorAvailability(
                        doctor_id=doc.id,
                        day_of_week=day,
                        start_time=time(9, 0),
                        end_time=time(17, 0),
                        slot_duration_minutes=30,
                        is_active=True
                    )
                )
            db.add(
                DoctorAvailability(
                    doctor_id=doc.id,
                    day_of_week=5,  # Saturday
                    start_time=time(9, 0),
                    end_time=time(13, 0),
                    slot_duration_minutes=30,
                    is_active=True
                )
            )

        # 4. Patients
        patients_meta = [
            {
                "email": "john.doe@patient.com",
                "name": "John Doe",
                "phone": "+1-555-0201",
                "dob": date(1990, 5, 15),
                "gender": "Male",
                "blood": "O+",
                "address": "742 Evergreen Terrace, Springfield",
                "ec_name": "Mary Doe",
                "ec_phone": "+1-555-0202"
            },
            {
                "email": "jane.miller@patient.com",
                "name": "Jane Miller",
                "phone": "+1-555-0203",
                "dob": date(1985, 8, 22),
                "gender": "Female",
                "blood": "A+",
                "address": "456 Elm Street, Metropolis",
                "ec_name": "Tom Miller",
                "ec_phone": "+1-555-0204"
            },
            {
                "email": "robert.taylor@patient.com",
                "name": "Robert Taylor",
                "phone": "+1-555-0205",
                "dob": date(1978, 11, 3),
                "gender": "Male",
                "blood": "B+",
                "address": "12 Oak Lane, Gotham",
                "ec_name": "Sarah Taylor",
                "ec_phone": "+1-555-0206"
            },
            {
                "email": "alice.wonder@patient.com",
                "name": "Alice Wonder",
                "phone": "+1-555-0207",
                "dob": date(1996, 2, 14),
                "gender": "Female",
                "blood": "AB+",
                "address": "88 Maple Drive, Star City",
                "ec_name": "Bob Wonder",
                "ec_phone": "+1-555-0208"
            }
        ]

        created_patients = []
        for p in patients_meta:
            u = User(
                email=p["email"],
                hashed_password=hash_password("Password@123"),
                full_name=p["name"],
                role=UserRole.PATIENT.value,
                phone=p["phone"],
                is_active=True
            )
            db.add(u)
            db.flush()

            pat = Patient(
                user_id=u.id,
                date_of_birth=p["dob"],
                gender=p["gender"],
                blood_group=p["blood"],
                address=p["address"],
                emergency_contact_name=p["ec_name"],
                emergency_contact_phone=p["ec_phone"]
            )
            db.add(pat)
            db.flush()
            created_patients.append(pat)

        today = date.today()

        # 5. Appointments & Medical Records
        # Past Completed Appointment 1
        appt1 = Appointment(
            appointment_number="APT-20261025-0001",
            patient_id=created_patients[0].id,
            doctor_id=created_doctors[0].id,
            appointment_date=today - timedelta(days=7),
            appointment_time=time(10, 0),
            end_time=time(10, 30),
            status=AppointmentStatus.COMPLETED.value,
            reason_for_visit="Routine cardiac checkup and blood pressure management"
        )
        db.add(appt1)
        db.flush()

        mr1 = MedicalRecord(
            appointment_id=appt1.id,
            patient_id=created_patients[0].id,
            doctor_id=created_doctors[0].id,
            symptoms="Occasional shortness of breath during heavy exertion, mild palpitations",
            diagnosis="Stage 1 Primary Hypertension, Sinus Tachycardia",
            consultation_notes="Patient is advised to reduce dietary sodium, maintain daily exercise of at least 30 minutes, and monitor BP twice daily.",
            prescription="Amlodipine 5mg OD morning, Metoprolol Tartrate 25mg BD after meals for 30 days.",
            follow_up_date=today + timedelta(days=21)
        )
        db.add(mr1)

        # Past Completed Appointment 2
        appt2 = Appointment(
            appointment_number="APT-20261028-0002",
            patient_id=created_patients[1].id,
            doctor_id=created_doctors[2].id,
            appointment_date=today - timedelta(days=4),
            appointment_time=time(11, 0),
            end_time=time(11, 30),
            status=AppointmentStatus.COMPLETED.value,
            reason_for_visit="Severe itchy skin rash on arms"
        )
        db.add(appt2)
        db.flush()

        mr2 = MedicalRecord(
            appointment_id=appt2.id,
            patient_id=created_patients[1].id,
            doctor_id=created_doctors[2].id,
            symptoms="Pruritic erythematous plaques with fine scaling on both forearms",
            diagnosis="Contact Dermatitis / Atopic flare",
            consultation_notes="Advised to avoid perfumed soaps and synthetic fabric. Use cool compresses.",
            prescription="Hydrocortisone 1% cream topically BD for 7 days, Cetirizine 10mg HS for 10 days.",
            follow_up_date=today + timedelta(days=14)
        )
        db.add(mr2)

        # Cancelled Appointment (with realistic cancellation reason!)
        appt_cancel = Appointment(
            appointment_number="APT-20261030-0003",
            patient_id=created_patients[2].id,
            doctor_id=created_doctors[3].id,
            appointment_date=today - timedelta(days=2),
            appointment_time=time(14, 0),
            end_time=time(14, 30),
            status=AppointmentStatus.CANCELLED.value,
            reason_for_visit="Knee joint pain after weekend jogging",
            cancellation_reason="Patient caught with urgent family travel emergency",
            cancelled_at=datetime.combine(today - timedelta(days=2), time(9, 30)),
            cancelled_by_id=created_patients[2].user_id
        )
        db.add(appt_cancel)

        # Today's Scheduled Appointment
        appt_today = Appointment(
            appointment_number="APT-TODAY-0004",
            patient_id=created_patients[0].id,
            doctor_id=created_doctors[1].id,
            appointment_date=today,
            appointment_time=time(15, 0),
            end_time=time(15, 30),
            status=AppointmentStatus.CONFIRMED.value,
            reason_for_visit="Pediatric consultation and seasonal flu vaccine"
        )
        db.add(appt_today)

        # Upcoming Appointments
        appt_future1 = Appointment(
            appointment_number="APT-NEXT-0005",
            patient_id=created_patients[1].id,
            doctor_id=created_doctors[0].id,
            appointment_date=today + timedelta(days=2),
            appointment_time=time(10, 30),
            end_time=time(11, 0),
            status=AppointmentStatus.SCHEDULED.value,
            reason_for_visit="Follow-up consultation and ECG evaluation"
        )
        db.add(appt_future1)

        appt_future2 = Appointment(
            appointment_number="APT-NEXT-0006",
            patient_id=created_patients[3].id,
            doctor_id=created_doctors[3].id,
            appointment_date=today + timedelta(days=3),
            appointment_time=time(11, 30),
            end_time=time(12, 0),
            status=AppointmentStatus.SCHEDULED.value,
            reason_for_visit="Evaluation of persistent lower back stiffness"
        )
        db.add(appt_future2)

        db.commit()
        print("Hospital initial seed completed successfully!")

    except Exception as e:
        db.rollback()
        print("Error during seeding:", e)
        raise e
    finally:
        if close_session:
            db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_database()

