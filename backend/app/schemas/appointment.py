from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from app.schemas.doctor import DoctorResponse
from app.schemas.patient import PatientResponse
from app.schemas.medical_record import MedicalRecordResponse

class AppointmentBase(BaseModel):
    doctor_id: int
    appointment_date: date
    appointment_time: time
    reason_for_visit: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    patient_id: Optional[int] = None  # Optional for patient role (uses logged in patient profile), required for receptionist/admin

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    reason_for_visit: Optional[str] = None
    status: Optional[str] = None

class AppointmentReschedule(BaseModel):
    appointment_date: date
    appointment_time: time
    reason: Optional[str] = None

class AppointmentCancel(BaseModel):
    cancellation_reason: str

class AppointmentStatusUpdate(BaseModel):
    status: str  # Scheduled, Confirmed, Completed, Cancelled, No-show
    cancellation_reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    appointment_number: str
    patient_id: int
    doctor_id: int
    appointment_date: date
    appointment_time: time
    end_time: Optional[time] = None
    status: str
    reason_for_visit: Optional[str] = None
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancelled_by_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AppointmentDetailResponse(AppointmentResponse):
    doctor: Optional[DoctorResponse] = None
    patient: Optional[PatientResponse] = None
    medical_record: Optional[MedicalRecordResponse] = None

    class Config:
        from_attributes = True
