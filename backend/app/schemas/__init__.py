from app.schemas.auth import LoginRequest, Token, TokenData
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.doctor import DoctorBase, DoctorCreate, DoctorUpdate, DoctorResponse, DoctorDetailResponse
from app.schemas.patient import PatientBase, PatientCreate, PatientUpdate, PatientResponse, PatientRegistration
from app.schemas.availability import (
    AvailabilityBase, AvailabilityCreate, AvailabilityUpdate, AvailabilityResponse,
    LeaveCreate, LeaveResponse, TimeSlot, DoctorSlotsResponse
)
from app.schemas.appointment import (
    AppointmentBase, AppointmentCreate, AppointmentUpdate, AppointmentReschedule,
    AppointmentCancel, AppointmentStatusUpdate, AppointmentResponse, AppointmentDetailResponse
)
from app.schemas.medical_record import (
    MedicalRecordBase, MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse
)
from app.schemas.reports import (
    DailyAppointmentReportItem, DoctorWiseReportItem, PatientRegistrationReportItem,
    AppointmentCancellationReportItem, AdminDashboardStats, DoctorDashboardStats,
    ReceptionistDashboardStats, PatientDashboardStats
)

__all__ = [
    "LoginRequest", "Token", "TokenData",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse",
    "DoctorBase", "DoctorCreate", "DoctorUpdate", "DoctorResponse", "DoctorDetailResponse",
    "PatientBase", "PatientCreate", "PatientUpdate", "PatientResponse", "PatientRegistration",
    "AvailabilityBase", "AvailabilityCreate", "AvailabilityUpdate", "AvailabilityResponse",
    "LeaveCreate", "LeaveResponse", "TimeSlot", "DoctorSlotsResponse",
    "AppointmentBase", "AppointmentCreate", "AppointmentUpdate", "AppointmentReschedule",
    "AppointmentCancel", "AppointmentStatusUpdate", "AppointmentResponse", "AppointmentDetailResponse",
    "MedicalRecordBase", "MedicalRecordCreate", "MedicalRecordUpdate", "MedicalRecordResponse",
    "DailyAppointmentReportItem", "DoctorWiseReportItem", "PatientRegistrationReportItem",
    "AppointmentCancellationReportItem", "AdminDashboardStats", "DoctorDashboardStats",
    "ReceptionistDashboardStats", "PatientDashboardStats"
]

