from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.doctor import Doctor
from app.models.availability import DoctorAvailability, DoctorLeave
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.schemas.availability import AvailabilityCreate, LeaveCreate
from app.utils.security import hash_password

DEFAULT_SPECIALIZATIONS = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "Neurology",
    "Gynecology",
    "Ophthalmology",
    "ENT (Ear, Nose, Throat)",
    "Psychiatry"
]

def get_doctors(
    db: Session,
    specialization: Optional[str] = None,
    search: Optional[str] = None,
    is_available: Optional[bool] = None
) -> List[Doctor]:
    query = db.query(Doctor).join(User).options(joinedload(Doctor.user), joinedload(Doctor.availabilities))

    if specialization and specialization.strip():
        query = query.filter(Doctor.specialization.ilike(f"%{specialization.strip()}%"))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                Doctor.specialization.ilike(term),
                Doctor.qualifications.ilike(term),
                Doctor.room_number.ilike(term)
            )
        )

    if is_available is not None:
        query = query.filter(Doctor.is_available == is_available, User.is_active == True)

    return query.all()

def get_doctor_by_id(db: Session, doctor_id: int) -> Doctor:
    doctor = (
        db.query(Doctor)
        .options(joinedload(Doctor.user), joinedload(Doctor.availabilities), joinedload(Doctor.leaves))
        .filter(Doctor.id == doctor_id)
        .first()
    )
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor

def get_doctor_by_user_id(db: Session, user_id: int) -> Doctor:
    doctor = (
        db.query(Doctor)
        .options(joinedload(Doctor.user), joinedload(Doctor.availabilities))
        .filter(Doctor.user_id == user_id)
        .first()
    )
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found for this user")
    return doctor

def create_doctor(db: Session, doctor_data: DoctorCreate) -> Doctor:
    existing = db.query(User).filter(User.email == doctor_data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    new_user = User(
        email=doctor_data.email.lower().strip(),
        hashed_password=hash_password(doctor_data.password),
        full_name=doctor_data.full_name.strip(),
        phone=doctor_data.phone,
        role=UserRole.DOCTOR.value,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    new_doctor = Doctor(
        user_id=new_user.id,
        specialization=doctor_data.specialization,
        qualifications=doctor_data.qualifications,
        experience_years=doctor_data.experience_years,
        consultation_fee=doctor_data.consultation_fee,
        bio=doctor_data.bio,
        room_number=doctor_data.room_number,
        is_available=doctor_data.is_available
    )
    db.add(new_doctor)
    db.flush()

    # Create default availability Monday-Friday 09:00 - 17:00
    from datetime import time
    default_slots = []
    for day in range(5):  # 0 to 4 (Mon to Fri)
        default_slots.append(
            DoctorAvailability(
                doctor_id=new_doctor.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
                slot_duration_minutes=30,
                is_active=True
            )
        )
    db.add_all(default_slots)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor

def update_doctor(db: Session, doctor_id: int, update_data: DoctorUpdate) -> Doctor:
    doctor = get_doctor_by_id(db, doctor_id)

    if update_data.full_name is not None or update_data.phone is not None:
        if update_data.full_name is not None:
            doctor.user.full_name = update_data.full_name.strip()
        if update_data.phone is not None:
            doctor.user.phone = update_data.phone.strip()

    if update_data.specialization is not None:
        doctor.specialization = update_data.specialization
    if update_data.qualifications is not None:
        doctor.qualifications = update_data.qualifications
    if update_data.experience_years is not None:
        doctor.experience_years = update_data.experience_years
    if update_data.consultation_fee is not None:
        doctor.consultation_fee = update_data.consultation_fee
    if update_data.bio is not None:
        doctor.bio = update_data.bio
    if update_data.room_number is not None:
        doctor.room_number = update_data.room_number
    if update_data.is_available is not None:
        doctor.is_available = update_data.is_available

    db.commit()
    db.refresh(doctor)
    return doctor

def set_doctor_availability(db: Session, doctor_id: int, avail_list: List[AvailabilityCreate]) -> List[DoctorAvailability]:
    doctor = get_doctor_by_id(db, doctor_id)
    # Remove existing availabilities
    db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doctor.id).delete()

    created = []
    for item in avail_list:
        avail = DoctorAvailability(
            doctor_id=doctor.id,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
            slot_duration_minutes=item.slot_duration_minutes,
            is_active=item.is_active
        )
        db.add(avail)
        created.append(avail)

    db.commit()
    return created

def add_doctor_leave(db: Session, doctor_id: int, leave_data: LeaveCreate) -> DoctorLeave:
    doctor = get_doctor_by_id(db, doctor_id)
    if leave_data.end_date < leave_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leave end date cannot be earlier than start date."
        )

    leave = DoctorLeave(
        doctor_id=doctor.id,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

def get_doctor_leaves(db: Session, doctor_id: int) -> List[DoctorLeave]:
    return db.query(DoctorLeave).filter(DoctorLeave.doctor_id == doctor_id).order_by(DoctorLeave.start_date.desc()).all()

def delete_doctor_leave(db: Session, leave_id: int):
    leave = db.query(DoctorLeave).filter(DoctorLeave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave record not found")
    db.delete(leave)
    db.commit()

def get_all_specializations(db: Session) -> List[str]:
    db_specs = db.query(Doctor.specialization).distinct().all()
    found = {s[0] for s in db_specs if s[0]}
    combined = sorted(list(set(DEFAULT_SPECIALIZATIONS).union(found)))
    return combined

