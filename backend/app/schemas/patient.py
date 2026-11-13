from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from app.schemas.user import UserResponse

class PatientBase(BaseModel):
    date_of_birth: date
    gender: str
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class PatientRegistration(PatientBase):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class PatientCreate(PatientRegistration):
    pass

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

