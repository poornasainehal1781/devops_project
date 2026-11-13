from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.medical_record import MedicalRecord
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate

def create_or_update_medical_record(
    db: Session,
    data: MedicalRecordCreate,
    current_doctor_id: Optional[int] = None
) -> MedicalRecord:
    # 1. Fetch appointment
    appt = db.query(Appointment).filter(Appointment.id == data.appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    # If doctor is logged in, ensure this is their appointment
    if current_doctor_id is not None and appt.doctor_id != current_doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are only authorized to add medical records for your own appointments."
        )

    # 2. Check if a medical record already exists for this appointment
    existing = db.query(MedicalRecord).filter(MedicalRecord.appointment_id == data.appointment_id).first()
    if existing:
        existing.symptoms = data.symptoms
        existing.diagnosis = data.diagnosis
        existing.consultation_notes = data.consultation_notes
        existing.prescription = data.prescription
        existing.follow_up_date = data.follow_up_date
        record = existing
    else:
        record = MedicalRecord(
            appointment_id=appt.id,
            patient_id=appt.patient_id,
            doctor_id=appt.doctor_id,
            symptoms=data.symptoms,
            diagnosis=data.diagnosis,
            consultation_notes=data.consultation_notes,
            prescription=data.prescription,
            follow_up_date=data.follow_up_date
        )
        db.add(record)

    # Update appointment status to Completed
    appt.status = AppointmentStatus.COMPLETED.value
    db.commit()
    db.refresh(record)
    return record

def get_medical_record_by_appointment(db: Session, appointment_id: int) -> Optional[MedicalRecord]:
    return db.query(MedicalRecord).filter(MedicalRecord.appointment_id == appointment_id).first()

def get_patient_medical_records(db: Session, patient_id: int) -> List[MedicalRecord]:
    return (
        db.query(MedicalRecord)
        .options(
            joinedload(MedicalRecord.doctor).joinedload(Doctor.user),
            joinedload(MedicalRecord.appointment)
        )
        .filter(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )

