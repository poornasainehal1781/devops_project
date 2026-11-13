from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class MedicalRecordBase(BaseModel):
    symptoms: str
    diagnosis: str
    consultation_notes: Optional[str] = None
    prescription: Optional[str] = None
    follow_up_date: Optional[date] = None

class MedicalRecordCreate(MedicalRecordBase):
    appointment_id: int

class MedicalRecordUpdate(BaseModel):
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    consultation_notes: Optional[str] = None
    prescription: Optional[str] = None
    follow_up_date: Optional[date] = None

class MedicalRecordResponse(MedicalRecordBase):
    id: int
    appointment_id: int
    patient_id: int
    doctor_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

