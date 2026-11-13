from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse, DoctorDetailResponse
from app.schemas.availability import AvailabilityCreate, AvailabilityResponse, LeaveCreate, LeaveResponse, DoctorSlotsResponse
from app.models.user import User
from app.models.doctor import Doctor
from app.services import doctor_service, appointment_service
from app.dependencies.auth import require_admin, get_current_user, require_staff

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])

@router.get("/specializations/all", response_model=List[str])
def get_specializations(db: Session = Depends(get_db)):
    return doctor_service.get_all_specializations(db)

@router.get("", response_model=List[DoctorResponse])
def list_doctors(
    specialization: Optional[str] = None,
    search: Optional[str] = None,
    is_available: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    return doctor_service.get_doctors(db, specialization=specialization, search=search, is_available=is_available)

@router.get("/{doctor_id}", response_model=DoctorDetailResponse)
def get_doctor_details(doctor_id: int, db: Session = Depends(get_db)):
    return doctor_service.get_doctor_by_id(db, doctor_id)

@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_new_doctor(doctor_data: DoctorCreate, db: Session = Depends(get_db)):
    return doctor_service.create_doctor(db, doctor_data)

@router.put("/{doctor_id}", response_model=DoctorResponse, dependencies=[Depends(require_admin)])
def update_doctor_profile(doctor_id: int, update_data: DoctorUpdate, db: Session = Depends(get_db)):
    return doctor_service.update_doctor(db, doctor_id, update_data)

@router.delete("/{doctor_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(require_admin)])
def delete_or_deactivate_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doc = doctor_service.get_doctor_by_id(db, doctor_id)
    doc.is_available = False
    doc.user.is_active = False
    db.commit()
    return {"message": "Doctor deactivated successfully"}

# Slots Generator API
@router.get("/{doctor_id}/slots", response_model=DoctorSlotsResponse)
def get_available_slots(
    doctor_id: int,
    date_val: date = Query(..., alias="date"),
    db: Session = Depends(get_db)
):
    return appointment_service.get_doctor_slots(db, doctor_id=doctor_id, target_date=date_val)

# Availability Management
@router.get("/{doctor_id}/availability", response_model=List[AvailabilityResponse])
def get_doctor_availabilities(doctor_id: int, db: Session = Depends(get_db)):
    doc = doctor_service.get_doctor_by_id(db, doctor_id)
    return doc.availabilities

@router.post("/{doctor_id}/availability", response_model=List[AvailabilityResponse])
def set_doctor_availability_schedule(
    doctor_id: int,
    avail_list: List[AvailabilityCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admin or the doctor themselves can set availability
    if current_user.role == "DOCTOR":
        own_doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
        if own_doc.id != doctor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot alter another doctor's schedule")
    elif current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    return doctor_service.set_doctor_availability(db, doctor_id, avail_list)

# Leaves Management
@router.get("/{doctor_id}/leaves", response_model=List[LeaveResponse])
def get_doctor_leaves(doctor_id: int, db: Session = Depends(get_db)):
    return doctor_service.get_doctor_leaves(db, doctor_id)

@router.post("/{doctor_id}/leaves", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
def apply_doctor_leave(
    doctor_id: int,
    leave_data: LeaveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "DOCTOR":
        own_doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
        if own_doc.id != doctor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot apply leave for another doctor")
    elif current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    return doctor_service.add_doctor_leave(db, doctor_id, leave_data)

@router.delete("/leaves/{leave_id}", status_code=status.HTTP_200_OK)
def remove_doctor_leave(
    leave_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "DOCTOR"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
    doctor_service.delete_doctor_leave(db, leave_id)
    return {"message": "Leave removed successfully"}

