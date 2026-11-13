from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordResponse
from app.services import medical_record_service, doctor_service, patient_service
from app.dependencies.auth import get_current_user, require_doctor

router = APIRouter(prefix="/api/medical-records", tags=["Medical Records"])

@router.post("", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_record(
    data: MedicalRecordCreate,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
    return medical_record_service.create_or_update_medical_record(db, data, current_doctor_id=doc.id)

@router.get("/appointment/{appointment_id}", response_model=Optional[MedicalRecordResponse])
def get_by_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = medical_record_service.get_medical_record_by_appointment(db, appointment_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No medical record found for this appointment")

    if current_user.role == "PATIENT":
        pat = patient_service.get_patient_by_user_id(db, current_user.id)
        if record.patient_id != pat.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "DOCTOR":
        doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
        if record.doctor_id != doc.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return record

@router.get("/patient/{patient_id}", response_model=List[MedicalRecordResponse])
def get_by_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        pat = patient_service.get_patient_by_user_id(db, current_user.id)
        if pat.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return medical_record_service.get_patient_medical_records(db, patient_id)

