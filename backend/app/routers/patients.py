from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.schemas.appointment import AppointmentDetailResponse
from app.services import patient_service, auth_service
from app.dependencies.auth import get_current_user, require_staff, require_admin_or_receptionist

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse], dependencies=[Depends(require_staff)])
def list_patients(
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    return patient_service.get_patients(db, search=search, skip=skip, limit=limit)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        own_patient = patient_service.get_patient_by_user_id(db, current_user.id)
        if own_patient.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return patient_service.get_patient_by_id(db, patient_id)

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin_or_receptionist)])
def create_patient_by_staff(
    patient_data: PatientCreate,
    db: Session = Depends(get_db)
):
    return auth_service.register_patient_user(db, patient_data)

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient_info(
    patient_id: int,
    update_data: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        own_patient = patient_service.get_patient_by_user_id(db, current_user.id)
        if own_patient.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return patient_service.update_patient(db, patient_id, update_data)

@router.get("/{patient_id}/history", response_model=List[AppointmentDetailResponse])
def get_patient_history(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "PATIENT":
        own_patient = patient_service.get_patient_by_user_id(db, current_user.id)
        if own_patient.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return patient_service.get_patient_visit_history(db, patient_id)

