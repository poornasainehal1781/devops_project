import io
import csv
from datetime import date, datetime, timedelta
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_, desc
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.schemas.reports import (
    DailyAppointmentReportItem,
    DoctorWiseReportItem,
    PatientRegistrationReportItem,
    AppointmentCancellationReportItem,
    AdminDashboardStats,
    DoctorDashboardStats,
    ReceptionistDashboardStats,
    PatientDashboardStats
)

def calculate_age(born: date) -> int:
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

# ----------------- REPORT 1: DAILY APPOINTMENTS -----------------
def get_daily_appointments_report(
    db: Session,
    report_date: Optional[date] = None,
    doctor_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[DailyAppointmentReportItem], int]:
    query = (
        db.query(Appointment)
        .join(Appointment.patient)
        .join(Patient.user)
        .join(Appointment.doctor)
        .options(
            joinedload(Appointment.patient).joinedload(Patient.user),
            joinedload(Appointment.doctor).joinedload(Doctor.user)
        )
    )

    if report_date:
        query = query.filter(Appointment.appointment_date == report_date)
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if status_filter and status_filter.strip():
        query = query.filter(Appointment.status == status_filter.strip())
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Appointment.appointment_number.ilike(term),
                User.full_name.ilike(term)
            )
        )

    total_count = query.count()
    records = (
        query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = [
        DailyAppointmentReportItem(
            appointment_id=a.id,
            appointment_number=a.appointment_number,
            patient_name=a.patient.user.full_name,
            doctor_name=f"Dr. {a.doctor.user.full_name}",
            appointment_date=a.appointment_date,
            appointment_time=a.appointment_time,
            status=a.status
        )
        for a in records
    ]
    return items, total_count

def export_daily_appointments_csv(db: Session, report_date: Optional[date] = None, doctor_id: Optional[int] = None, status_filter: Optional[str] = None) -> io.StringIO:
    items, _ = get_daily_appointments_report(db, report_date, doctor_id, status_filter, skip=0, limit=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Appointment ID", "Appointment #", "Patient Name", "Doctor Name", "Appointment Date", "Appointment Time", "Status"])
    for r in items:
        writer.writerow([r.appointment_id, r.appointment_number, r.patient_name, r.doctor_name, str(r.appointment_date), str(r.appointment_time), r.status])
    output.seek(0)
    return output

# ----------------- REPORT 2: DOCTOR-WISE APPOINTMENTS -----------------
def get_doctor_wise_report(
    db: Session,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[DoctorWiseReportItem], int]:
    query = db.query(Doctor).join(Doctor.user).options(joinedload(Doctor.user))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                Doctor.specialization.ilike(term)
            )
        )

    total_count = query.count()
    doctors = query.offset(skip).limit(limit).all()

    today = date.today()
    now_time = datetime.now().time()
    items = []

    for doc in doctors:
        appts = db.query(Appointment).filter(Appointment.doctor_id == doc.id).all()
        total = len(appts)
        completed = sum(1 for a in appts if a.status == AppointmentStatus.COMPLETED.value)
        cancelled = sum(1 for a in appts if a.status == AppointmentStatus.CANCELLED.value)
        upcoming = sum(
            1 for a in appts 
            if a.status in [AppointmentStatus.SCHEDULED.value, AppointmentStatus.CONFIRMED.value]
            and (a.appointment_date > today or (a.appointment_date == today and a.appointment_time >= now_time))
        )

        items.append(
            DoctorWiseReportItem(
                doctor_id=doc.id,
                doctor_name=f"Dr. {doc.user.full_name}",
                specialization=doc.specialization,
                total_appointments=total,
                completed_appointments=completed,
                cancelled_appointments=cancelled,
                upcoming_appointments=upcoming
            )
        )

    return items, total_count

def export_doctor_wise_csv(db: Session) -> io.StringIO:
    items, _ = get_doctor_wise_report(db, skip=0, limit=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Doctor Name", "Specialization", "Total Appointments", "Completed Appointments", "Cancelled Appointments", "Upcoming Appointments"])
    for r in items:
        writer.writerow([r.doctor_name, r.specialization, r.total_appointments, r.completed_appointments, r.cancelled_appointments, r.upcoming_appointments])
    output.seek(0)
    return output

# ----------------- REPORT 3: PATIENT REGISTRATION -----------------
def get_patient_registration_report(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    gender: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[PatientRegistrationReportItem], int]:
    query = db.query(Patient).join(Patient.user).options(joinedload(Patient.user))

    if start_date:
        query = query.filter(func.date(Patient.created_at) >= start_date)
    if end_date:
        query = query.filter(func.date(Patient.created_at) <= end_date)
    if gender and gender.strip():
        query = query.filter(Patient.gender.ilike(gender.strip()))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.phone.ilike(term),
                User.email.ilike(term)
            )
        )

    total_count = query.count()
    patients = query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()

    items = [
        PatientRegistrationReportItem(
            patient_id=p.id,
            patient_name=p.user.full_name,
            gender=p.gender,
            age=calculate_age(p.date_of_birth) if p.date_of_birth else None,
            phone_number=p.user.phone,
            registration_date=p.created_at.date() if p.created_at else date.today()
        )
        for p in patients
    ]
    return items, total_count

def export_patient_registration_csv(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None, gender: Optional[str] = None) -> io.StringIO:
    items, _ = get_patient_registration_report(db, start_date, end_date, gender, skip=0, limit=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Patient ID", "Patient Name", "Gender", "Age", "Phone Number", "Registration Date"])
    for r in items:
        writer.writerow([r.patient_id, r.patient_name, r.gender, r.age or "", r.phone_number or "", str(r.registration_date)])
    output.seek(0)
    return output

# ----------------- REPORT 4: APPOINTMENT CANCELLATION -----------------
def get_appointment_cancellation_report(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Tuple[List[AppointmentCancellationReportItem], int]:
    query = (
        db.query(Appointment)
        .filter(Appointment.status == AppointmentStatus.CANCELLED.value)
        .join(Appointment.patient)
        .join(Patient.user)
        .join(Appointment.doctor)
        .options(
            joinedload(Appointment.patient).joinedload(Patient.user),
            joinedload(Appointment.doctor).joinedload(Doctor.user)
        )
    )

    if start_date:
        query = query.filter(Appointment.appointment_date >= start_date)
    if end_date:
        query = query.filter(Appointment.appointment_date <= end_date)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Appointment.appointment_number.ilike(term),
                User.full_name.ilike(term),
                Appointment.cancellation_reason.ilike(term)
            )
        )

    total_count = query.count()
    appts = query.order_by(Appointment.cancelled_at.desc(), Appointment.appointment_date.desc()).offset(skip).limit(limit).all()

    items = [
        AppointmentCancellationReportItem(
            appointment_id=a.id,
            appointment_number=a.appointment_number,
            patient_name=a.patient.user.full_name,
            doctor_name=f"Dr. {a.doctor.user.full_name}",
            appointment_date=a.appointment_date,
            cancellation_date=a.cancelled_at.date() if a.cancelled_at else None,
            cancellation_reason=a.cancellation_reason or "Reason not specified"
        )
        for a in appts
    ]
    return items, total_count

def export_cancellation_report_csv(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> io.StringIO:
    items, _ = get_appointment_cancellation_report(db, start_date, end_date, skip=0, limit=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Appointment ID", "Appointment #", "Patient Name", "Doctor Name", "Appointment Date", "Cancellation Date", "Cancellation Reason"])
    for r in items:
        writer.writerow([r.appointment_id, r.appointment_number, r.patient_name, r.doctor_name, str(r.appointment_date), str(r.cancellation_date or ""), r.cancellation_reason or ""])
    output.seek(0)
    return output

# ----------------- DASHBOARD STATISTICS -----------------
def get_admin_dashboard_stats(db: Session) -> AdminDashboardStats:
    today = date.today()
    now_time = datetime.now().time()

    total_doctors = db.query(Doctor).count()
    total_patients = db.query(Patient).count()
    total_appointments = db.query(Appointment).count()
    today_appointments = db.query(Appointment).filter(Appointment.appointment_date == today).count()
    completed_appointments = db.query(Appointment).filter(Appointment.status == AppointmentStatus.COMPLETED.value).count()
    cancelled_appointments = db.query(Appointment).filter(Appointment.status == AppointmentStatus.CANCELLED.value).count()

    upcoming_appointments = db.query(Appointment).filter(
        Appointment.status.in_([AppointmentStatus.SCHEDULED.value, AppointmentStatus.CONFIRMED.value]),
        or_(
            Appointment.appointment_date > today,
            and_(Appointment.appointment_date == today, Appointment.appointment_time >= now_time)
        )
    ).count()

    # Status breakdown
    all_statuses = [s.value for s in AppointmentStatus]
    status_counts = {}
    for st in all_statuses:
        status_counts[st] = db.query(Appointment).filter(Appointment.status == st).count()

    # Daily trend for past 7 days
    daily_trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = db.query(Appointment).filter(Appointment.appointment_date == d).count()
        daily_trend.append({"date": d.strftime("%b %d"), "count": count})

    # Specialization distribution
    specs = db.query(Doctor.specialization, func.count(Doctor.id)).group_by(Doctor.specialization).all()
    specialization_distribution = [{"name": s[0], "value": s[1]} for s in specs]

    return AdminDashboardStats(
        total_doctors=total_doctors,
        total_patients=total_patients,
        total_appointments=total_appointments,
        today_appointments=today_appointments,
        completed_appointments=completed_appointments,
        cancelled_appointments=cancelled_appointments,
        upcoming_appointments=upcoming_appointments,
        status_distribution=status_counts,
        daily_trend=daily_trend,
        specialization_distribution=specialization_distribution
    )

def get_doctor_dashboard_stats(db: Session, doctor_id: int) -> DoctorDashboardStats:
    today = date.today()
    now_time = datetime.now().time()
    doctor = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.id == doctor_id).first()

    today_count = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == today
    ).count()

    upcoming_count = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status.in_([AppointmentStatus.SCHEDULED.value, AppointmentStatus.CONFIRMED.value]),
        or_(
            Appointment.appointment_date > today,
            and_(Appointment.appointment_date == today, Appointment.appointment_time >= now_time)
        )
    ).count()

    completed_count = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status == AppointmentStatus.COMPLETED.value
    ).count()

    total_patients = db.query(func.count(func.distinct(Appointment.patient_id))).filter(
        Appointment.doctor_id == doctor_id
    ).scalar() or 0

    # Today's schedule list
    today_appts = (
        db.query(Appointment)
        .options(joinedload(Appointment.patient).joinedload(Patient.user))
        .filter(Appointment.doctor_id == doctor_id, Appointment.appointment_date == today)
        .order_by(Appointment.appointment_time.asc())
        .all()
    )

    today_schedule = [
        {
            "id": a.id,
            "appointment_number": a.appointment_number,
            "patient_name": a.patient.user.full_name,
            "time": str(a.appointment_time),
            "status": a.status,
            "reason": a.reason_for_visit
        }
        for a in today_appts
    ]

    return DoctorDashboardStats(
        doctor_id=doctor.id,
        doctor_name=doctor.user.full_name,
        specialization=doctor.specialization,
        today_appointments=today_count,
        upcoming_appointments=upcoming_count,
        completed_appointments=completed_count,
        total_patients=total_patients,
        today_schedule=today_schedule
    )

def get_receptionist_dashboard_stats(db: Session) -> ReceptionistDashboardStats:
    today = date.today()
    now_time = datetime.now().time()

    today_appointments = db.query(Appointment).filter(Appointment.appointment_date == today).count()
    upcoming_appointments = db.query(Appointment).filter(
        Appointment.status.in_([AppointmentStatus.SCHEDULED.value, AppointmentStatus.CONFIRMED.value]),
        or_(
            Appointment.appointment_date > today,
            and_(Appointment.appointment_date == today, Appointment.appointment_time >= now_time)
        )
    ).count()

    total_patients = db.query(Patient).count()
    today_new_patients = db.query(Patient).filter(func.date(Patient.created_at) == today).count()

    today_appts = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.patient).joinedload(Patient.user),
            joinedload(Appointment.doctor).joinedload(Doctor.user)
        )
        .filter(Appointment.appointment_date == today)
        .order_by(Appointment.appointment_time.asc())
        .limit(10)
        .all()
    )

    today_appointments_list = [
        {
            "id": a.id,
            "appointment_number": a.appointment_number,
            "patient_name": a.patient.user.full_name,
            "doctor_name": f"Dr. {a.doctor.user.full_name}",
            "time": str(a.appointment_time),
            "status": a.status
        }
        for a in today_appts
    ]

    return ReceptionistDashboardStats(
        today_appointments=today_appointments,
        upcoming_appointments=upcoming_appointments,
        total_patients=total_patients,
        today_new_patients=today_new_patients,
        today_appointments_list=today_appointments_list
    )

def get_patient_dashboard_stats(db: Session, patient_id: int) -> PatientDashboardStats:
    today = date.today()
    now_time = datetime.now().time()

    total_appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).count()

    upcoming_count = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.status.in_([AppointmentStatus.SCHEDULED.value, AppointmentStatus.CONFIRMED.value]),
        or_(
            Appointment.appointment_date > today,
            and_(Appointment.appointment_date == today, Appointment.appointment_time >= now_time)
        )
    ).count()

    completed_count = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.status == AppointmentStatus.COMPLETED.value
    ).count()

    upcoming_appts = (
        db.query(Appointment)
        .options(joinedload(Appointment.doctor).joinedload(Doctor.user))
        .filter(
            Appointment.patient_id == patient_id,
            Appointment.status.in_([AppointmentStatus.SCHEDULED.value, AppointmentStatus.CONFIRMED.value]),
            or_(
                Appointment.appointment_date > today,
                and_(Appointment.appointment_date == today, Appointment.appointment_time >= now_time)
            )
        )
        .order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc())
        .limit(5)
        .all()
    )

    from app.models.medical_record import MedicalRecord
    recent_records_raw = (
        db.query(MedicalRecord)
        .options(joinedload(MedicalRecord.doctor).joinedload(Doctor.user))
        .filter(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
        .limit(5)
        .all()
    )

    upcoming_list = [
        {
            "id": a.id,
            "appointment_number": a.appointment_number,
            "doctor_name": f"Dr. {a.doctor.user.full_name}",
            "specialization": a.doctor.specialization,
            "date": str(a.appointment_date),
            "time": str(a.appointment_time),
            "status": a.status
        }
        for a in upcoming_appts
    ]

    records_list = [
        {
            "id": r.id,
            "doctor_name": f"Dr. {r.doctor.user.full_name}",
            "diagnosis": r.diagnosis,
            "symptoms": r.symptoms,
            "prescription": r.prescription,
            "follow_up_date": str(r.follow_up_date) if r.follow_up_date else None,
            "created_at": r.created_at.strftime("%Y-%m-%d")
        }
        for r in recent_records_raw
    ]

    return PatientDashboardStats(
        total_appointments=total_appointments,
        upcoming_appointments_count=upcoming_count,
        completed_appointments_count=completed_count,
        upcoming_appointments=upcoming_list,
        recent_records=records_list
    )

