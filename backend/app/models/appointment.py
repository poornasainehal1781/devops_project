import enum
from sqlalchemy import Column, Integer, String, Text, Date, Time, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from app.database import Base

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "Scheduled"
    CONFIRMED = "Confirmed"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    NO_SHOW = "No-show"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    appointment_number = Column(String(50), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_date = Column(Date, nullable=False, index=True)
    appointment_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=True)
    status = Column(String(30), nullable=False, default=AppointmentStatus.SCHEDULED.value, index=True)
    reason_for_visit = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    cancelled_by = relationship("User", foreign_keys=[cancelled_by_id])
    medical_record = relationship("MedicalRecord", back_populates="appointment", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_doctor_date_time", "doctor_id", "appointment_date", "appointment_time"),
        Index("idx_patient_date", "patient_id", "appointment_date"),
    )

