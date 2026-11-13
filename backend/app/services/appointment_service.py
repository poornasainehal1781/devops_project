import uuid
from datetime import datetime, date, time, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from fastapi import HTTPException, status
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.models.availability import DoctorAvailability, DoctorLeave
from app.schemas.appointment import AppointmentCreate, AppointmentReschedule, AppointmentCancel
from app.schemas.availability import DoctorSlotsResponse, TimeSlot

DAYS_MAP = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def generate_appointment_number() -> str:
    now_str = datetime.now().strftime("%Y%m%d")
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"APT-{now_str}-{short_uuid}"

def get_doctor_slots(db: Session, doctor_id: int, target_date: date) -> DoctorSlotsResponse:
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    today = date.today()
    day_of_week = target_date.weekday()  # 0=Monday, 6=Sunday
    day_name = DAYS_MAP[day_of_week]

    # Check leaves
    leave = db.query(DoctorLeave).filter(
        DoctorLeave.doctor_id == doctor_id,
        DoctorLeave.start_date <= target_date,
        DoctorLeave.end_date >= target_date
    ).first()

    is_on_leave = leave is not None

    # Check availability config for this weekday
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.day_of_week == day_of_week,
        DoctorAvailability.is_active == True
    ).first()

    is_working_day = (availability is not None) and (not is_on_leave) and doctor.is_available

    slots: List[TimeSlot] = []

    if not is_working_day:
        reason = "Doctor is on leave" if is_on_leave else ("Doctor does not work on " + day_name if not availability else "Doctor is currently unavailable")
        return DoctorSlotsResponse(
            doctor_id=doctor_id,
            date=target_date,
            day_of_week=day_of_week,
            day_name=day_name,
            is_working_day=False,
            is_on_leave=is_on_leave,
            slots=[]
        )

    # Generate intervals
    current_time_dt = datetime.combine(target_date, availability.start_time)
    end_time_dt = datetime.combine(target_date, availability.end_time)
    slot_delta = timedelta(minutes=availability.slot_duration_minutes)

    # Query existing active appointments for this doctor and date
    existing_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == target_date,
        Appointment.status != AppointmentStatus.CANCELLED.value
    ).all()

    booked_times = {a.appointment_time.strftime("%H:%M") for a in existing_appointments}
    now = datetime.now()

    while current_time_dt + slot_delta <= end_time_dt:
        slot_start_str = current_time_dt.strftime("%H:%M")
        slot_end_dt = current_time_dt + slot_delta
        slot_end_str = slot_end_dt.strftime("%H:%M")

        is_available = True
        reason = None

        if target_date < today:
            is_available = False
            reason = "Past date"
        elif target_date == today and current_time_dt <= now:
            is_available = False
            reason = "Past time slot"
        elif slot_start_str in booked_times:
            is_available = False
            reason = "Already booked"

        slots.append(
            TimeSlot(
                start_time=slot_start_str,
                end_time=slot_end_str,
                is_available=is_available,
                reason_unavailable=reason
            )
        )
        current_time_dt += slot_delta

    return DoctorSlotsResponse(
        doctor_id=doctor_id,
        date=target_date,
        day_of_week=day_of_week,
        day_name=day_name,
        is_working_day=True,
        is_on_leave=False,
        slots=slots
    )

def book_appointment(db: Session, data: AppointmentCreate, patient_id: int) -> Appointment:
    # 1. Validate date not in the past
    today = date.today()
    if data.appointment_date < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book an appointment for a past date."
        )

    # If booking for today, validate time not in the past
    if data.appointment_date == today:
        now_time = datetime.now().time()
        if data.appointment_time <= now_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot book an appointment for a past time slot."
            )

    # 2. Check doctor exists and is active
    doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
    if not doctor or not doctor.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected doctor is not available for booking."
        )

    # 3. Check doctor leave
    leave = db.query(DoctorLeave).filter(
        DoctorLeave.doctor_id == data.doctor_id,
        DoctorLeave.start_date <= data.appointment_date,
        DoctorLeave.end_date >= data.appointment_date
    ).first()
    if leave:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doctor is on leave on {data.appointment_date}."
        )

    # 4. Check doctor availability schedule
    day_of_week = data.appointment_date.weekday()
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == data.doctor_id,
        DoctorAvailability.day_of_week == day_of_week,
        DoctorAvailability.is_active == True
    ).first()
    if not availability:
        day_name = DAYS_MAP[day_of_week]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doctor does not have scheduled working hours on {day_name}."
        )

    # Verify time is inside working hours
    if not (availability.start_time <= data.appointment_time < availability.end_time):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested time is outside doctor's working hours ({availability.start_time.strftime('%H:%M')} - {availability.end_time.strftime('%H:%M')})."
        )

    # 5. Check patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found."
        )

    # 6. Concurrency-safe double booking check
    # Check if doctor is already booked at that exact date and time (ignoring Cancelled)
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == data.doctor_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.appointment_time == data.appointment_time,
        Appointment.status != AppointmentStatus.CANCELLED.value
    ).first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This appointment slot is already booked. Please choose a different time."
        )

    # 7. Check if patient already has an active appointment with this doctor on the same date/time
    patient_conflict = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.appointment_time == data.appointment_time,
        Appointment.status != AppointmentStatus.CANCELLED.value
    ).first()
    if patient_conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an appointment scheduled at this date and time."
        )

    # Calculate end time
    slot_delta = timedelta(minutes=availability.slot_duration_minutes)
    appt_dt = datetime.combine(data.appointment_date, data.appointment_time)
    end_time = (appt_dt + slot_delta).time()

    new_appointment = Appointment(
        appointment_number=generate_appointment_number(),
        patient_id=patient_id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        end_time=end_time,
        status=AppointmentStatus.SCHEDULED.value,
        reason_for_visit=data.reason_for_visit
    )

    db.add(new_appointment)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict occurred while saving appointment. Slot may have been reserved concurrently."
        )

    db.refresh(new_appointment)
    return new_appointment

def reschedule_appointment(db: Session, appointment_id: int, data: AppointmentReschedule, user_id: int, user_role: str) -> Appointment:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if appt.status in [AppointmentStatus.CANCELLED.value, AppointmentStatus.COMPLETED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reschedule an appointment that is already {appt.status}."
        )

    # If patient, ensure it's their own appointment
    if user_role == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == user_id).first()
        if not patient or appt.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    today = date.today()
    if data.appointment_date < today:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reschedule to a past date.")

    if data.appointment_date == today and data.appointment_time <= datetime.now().time():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reschedule to a past time slot.")

    # Check conflict for new date/time
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == appt.doctor_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.appointment_time == data.appointment_time,
        Appointment.id != appt.id,
        Appointment.status != AppointmentStatus.CANCELLED.value
    ).first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested slot is already booked. Please choose a different time."
        )

    # Update slot duration / end time
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == appt.doctor_id,
        DoctorAvailability.day_of_week == data.appointment_date.weekday(),
        DoctorAvailability.is_active == True
    ).first()
    slot_minutes = availability.slot_duration_minutes if availability else 30
    appt_dt = datetime.combine(data.appointment_date, data.appointment_time)
    end_time = (appt_dt + timedelta(minutes=slot_minutes)).time()

    appt.appointment_date = data.appointment_date
    appt.appointment_time = data.appointment_time
    appt.end_time = end_time
    appt.status = AppointmentStatus.CONFIRMED.value

    db.commit()
    db.refresh(appt)
    return appt

def cancel_appointment(db: Session, appointment_id: int, data: AppointmentCancel, user_id: int, user_role: str) -> Appointment:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if appt.status in [AppointmentStatus.CANCELLED.value, AppointmentStatus.COMPLETED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Appointment is already {appt.status}."
        )

    # If patient, verify ownership
    if user_role == "PATIENT":
        patient = db.query(Patient).filter(Patient.user_id == user_id).first()
        if not patient or appt.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    appt.status = AppointmentStatus.CANCELLED.value
    appt.cancellation_reason = data.cancellation_reason.strip() if data.cancellation_reason else "Cancelled by user"
    appt.cancelled_at = datetime.now()
    appt.cancelled_by_id = user_id

    db.commit()
    db.refresh(appt)
    return appt

def update_appointment_status(db: Session, appointment_id: int, new_status: str, cancellation_reason: Optional[str] = None, user_id: Optional[int] = None) -> Appointment:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    valid_statuses = [s.value for s in AppointmentStatus]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    appt.status = new_status
    if new_status == AppointmentStatus.CANCELLED.value:
        appt.cancellation_reason = cancellation_reason or "Cancelled by administrative action"
        appt.cancelled_at = datetime.now()
        appt.cancelled_by_id = user_id

    db.commit()
    db.refresh(appt)
    return appt

def get_appointments(
    db: Session,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    target_date: Optional[date] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Appointment]:
    query = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.doctor).joinedload(Doctor.user),
            joinedload(Appointment.patient).joinedload(Patient.user),
            joinedload(Appointment.medical_record)
        )
    )

    if patient_id is not None:
        query = query.filter(Appointment.patient_id == patient_id)

    if doctor_id is not None:
        query = query.filter(Appointment.doctor_id == doctor_id)

    if target_date is not None:
        query = query.filter(Appointment.appointment_date == target_date)

    if status_filter and status_filter.strip():
        query = query.filter(Appointment.status == status_filter.strip())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.join(Appointment.patient).join(Patient.user).filter(
            or_(
                Appointment.appointment_number.ilike(term),
                User.full_name.ilike(term),
                User.phone.ilike(term)
            )
        )

    return query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).offset(skip).limit(limit).all()

def get_appointment_by_id(db: Session, appointment_id: int) -> Appointment:
    appt = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.doctor).joinedload(Doctor.user),
            joinedload(Appointment.patient).joinedload(Patient.user),
            joinedload(Appointment.medical_record)
        )
        .filter(Appointment.id == appointment_id)
        .first()
    )
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appt

