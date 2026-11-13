from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentReschedule,
    AppointmentCancel,
    AppointmentStatusUpdate,
    AppointmentResponse,
    AppointmentDetailResponse
)
from app.services import appointment_service, patient_service, doctor_service
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.get("", response_model=List[AppointmentDetailResponse])
def list_appointments(
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    target_date: Optional[date] = Query(None, alias="date"),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        pat = patient_service.get_patient_by_user_id(db, current_user.id)
        return appointment_service.get_appointments(
            db, patient_id=pat.id, target_date=target_date, status_filter=status_filter, search=search, skip=skip, limit=limit
        )
    elif current_user.role == "DOCTOR":
        doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
        return appointment_service.get_appointments(
            db, doctor_id=doc.id, patient_id=patient_id, target_date=target_date, status_filter=status_filter, search=search, skip=skip, limit=limit
        )
    else:  # ADMIN or RECEPTIONIST
        return appointment_service.get_appointments(
            db, doctor_id=doctor_id, patient_id=patient_id, target_date=target_date, status_filter=status_filter, search=search, skip=skip, limit=limit
        )

@router.get("/{appointment_id}", response_model=AppointmentDetailResponse)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = appointment_service.get_appointment_by_id(db, appointment_id)
    if current_user.role == "PATIENT":
        pat = patient_service.get_patient_by_user_id(db, current_user.id)
        if appt.patient_id != pat.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "DOCTOR":
        doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
        if appt.doctor_id != doc.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return appt

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        pat = patient_service.get_patient_by_user_id(db, current_user.id)
        patient_id = pat.id
    else:
        if not data.patient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="patient_id is required when booking as staff."
            )
        patient_id = data.patient_id

    return appointment_service.book_appointment(db, data, patient_id=patient_id)

@router.post("/{appointment_id}/reschedule", response_model=AppointmentResponse)
def reschedule_appointment_endpoint(
    appointment_id: int,
    data: AppointmentReschedule,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return appointment_service.reschedule_appointment(
        db, appointment_id=appointment_id, data=data, user_id=current_user.id, user_role=current_user.role
    )

@router.post("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment_endpoint(
    appointment_id: int,
    data: AppointmentCancel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return appointment_service.cancel_appointment(
        db, appointment_id=appointment_id, data=data, user_id=current_user.id, user_role=current_user.role
    )

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_status(
    appointment_id: int,
    status_update: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patients cannot directly alter appointment status. Use cancel or reschedule.")

    appt = appointment_service.get_appointment_by_id(db, appointment_id)
    if current_user.role == "DOCTOR":
        doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
        if appt.doctor_id != doc.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot alter another doctor's appointment")

    return appointment_service.update_appointment_status(
        db,
        appointment_id=appointment_id,
        new_status=status_update.status,
        cancellation_reason=status_update.cancellation_reason,
        user_id=current_user.id
    )

