from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import time, date, datetime

class AvailabilityBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(30, ge=10, le=120)
    is_active: bool = True

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class AvailabilityResponse(AvailabilityBase):
    id: int
    doctor_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LeaveCreate(BaseModel):
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveResponse(BaseModel):
    id: int
    doctor_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TimeSlot(BaseModel):
    start_time: str
    end_time: str
    is_available: bool
    reason_unavailable: Optional[str] = None

class DoctorSlotsResponse(BaseModel):
    doctor_id: int
    date: date
    day_of_week: int
    day_name: str
    is_working_day: bool
    is_on_leave: bool
    slots: List[TimeSlot]

