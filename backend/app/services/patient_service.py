from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.patient import Patient
from app.models.user import User
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.schemas.patient import PatientUpdate

def get_patients(
    db: Session,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Patient]:
    query = db.query(Patient).join(User).options(joinedload(Patient.user))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                User.phone.ilike(term),
                Patient.blood_group.ilike(term),
                Patient.emergency_contact_name.ilike(term)
            )
        )
    return query.order_by(Patient.id.desc()).offset(skip).limit(limit).all()

def get_patient_by_id(db: Session, patient_id: int) -> Patient:
    patient = (
        db.query(Patient)
        .options(joinedload(Patient.user))
        .filter(Patient.id == patient_id)
        .first()
    )
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient

def get_patient_by_user_id(db: Session, user_id: int) -> Patient:
    patient = (
        db.query(Patient)
        .options(joinedload(Patient.user))
        .filter(Patient.user_id == user_id)
        .first()
    )
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found for this user")
    return patient

def update_patient(db: Session, patient_id: int, update_data: PatientUpdate) -> Patient:
    patient = get_patient_by_id(db, patient_id)

    if update_data.full_name is not None:
        patient.user.full_name = update_data.full_name.strip()
    if update_data.phone is not None:
        patient.user.phone = update_data.phone.strip()

    if update_data.date_of_birth is not None:
        patient.date_of_birth = update_data.date_of_birth
    if update_data.gender is not None:
        patient.gender = update_data.gender
    if update_data.blood_group is not None:
        patient.blood_group = update_data.blood_group
    if update_data.address is not None:
        patient.address = update_data.address
    if update_data.emergency_contact_name is not None:
        patient.emergency_contact_name = update_data.emergency_contact_name
    if update_data.emergency_contact_phone is not None:
        patient.emergency_contact_phone = update_data.emergency_contact_phone

    db.commit()
    db.refresh(patient)
    return patient

def get_patient_visit_history(db: Session, patient_id: int):
    # Verify patient exists
    get_patient_by_id(db, patient_id)

    appointments = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.doctor).joinedload(Doctor.user),
            joinedload(Appointment.medical_record)
        )
        .filter(Appointment.patient_id == patient_id)
        .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
        .all()
    )
    return appointments
