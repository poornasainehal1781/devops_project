from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.schemas.user import UserResponse
from app.schemas.availability import AvailabilityResponse

class DoctorBase(BaseModel):
    specialization: str
    qualifications: str
    experience_years: int = 0
    consultation_fee: Decimal = Decimal("500.00")
    bio: Optional[str] = None
    room_number: Optional[str] = None
    is_available: bool = True

class DoctorCreate(DoctorBase):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[Decimal] = None
    bio: Optional[str] = None
    room_number: Optional[str] = None
    is_available: bool = None

class DoctorResponse(DoctorBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class DoctorDetailResponse(DoctorResponse):
    availabilities: List[AvailabilityResponse] = []

    class Config:
        from_attributes = True

