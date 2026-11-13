from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import date, time, datetime

class DailyAppointmentReportItem(BaseModel):
    appointment_id: int
    appointment_number: str
    patient_name: str
    doctor_name: str
    appointment_date: date
    appointment_time: time
    status: str

class DoctorWiseReportItem(BaseModel):
    doctor_id: int
    doctor_name: str
    specialization: str
    total_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    upcoming_appointments: int

class PatientRegistrationReportItem(BaseModel):
    patient_id: int
    patient_name: str
    gender: str
    age: Optional[int] = None
    phone_number: Optional[str] = None
    registration_date: date

class AppointmentCancellationReportItem(BaseModel):
    appointment_id: int
    appointment_number: str
    patient_name: str
    doctor_name: str
    appointment_date: date
    cancellation_date: Optional[date] = None
    cancellation_reason: Optional[str] = None

class AdminDashboardStats(BaseModel):
    total_doctors: int
    total_patients: int
    total_appointments: int
    today_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    upcoming_appointments: int
    status_distribution: Dict[str, int]
    daily_trend: List[Dict[str, Any]]
    specialization_distribution: List[Dict[str, Any]]

class DoctorDashboardStats(BaseModel):
    doctor_id: int
    doctor_name: str
    specialization: str
    today_appointments: int
    upcoming_appointments: int
    completed_appointments: int
    total_patients: int
    today_schedule: List[Dict[str, Any]]

class ReceptionistDashboardStats(BaseModel):
    today_appointments: int
    upcoming_appointments: int
    total_patients: int
    today_new_patients: int
    today_appointments_list: List[Dict[str, Any]]

class PatientDashboardStats(BaseModel):
    total_appointments: int
    upcoming_appointments_count: int
    completed_appointments_count: int
    upcoming_appointments: List[Dict[str, Any]]
    recent_records: List[Dict[str, Any]]

