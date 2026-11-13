from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.reports import (
    DailyAppointmentReportItem,
    DoctorWiseReportItem,
    PatientRegistrationReportItem,
    AppointmentCancellationReportItem
)
from app.services import report_service
from app.dependencies.auth import require_admin, require_staff

router = APIRouter(prefix="/api/reports", tags=["Mandatory Reports"], dependencies=[Depends(require_staff)])

# REPORT 1: Daily Appointments
@router.get("/daily-appointments")
def get_daily_appointments(
    report_date: Optional[date] = Query(None, alias="date"),
    doctor_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    items, total = report_service.get_daily_appointments_report(
        db, report_date=report_date, doctor_id=doctor_id, status_filter=status, search=search, skip=skip, limit=limit
    )
    return {"total": total, "items": items}

@router.get("/daily-appointments/csv")
def download_daily_appointments_csv(
    report_date: Optional[date] = Query(None, alias="date"),
    doctor_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    csv_buf = report_service.export_daily_appointments_csv(db, report_date=report_date, doctor_id=doctor_id, status_filter=status)
    filename = f"daily_appointments_{date.today()}.csv"
    return Response(
        content=csv_buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# REPORT 2: Doctor-wise Appointments
@router.get("/doctor-wise")
def get_doctor_wise(
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    items, total = report_service.get_doctor_wise_report(db, search=search, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.get("/doctor-wise/csv")
def download_doctor_wise_csv(db: Session = Depends(get_db)):
    csv_buf = report_service.export_doctor_wise_csv(db)
    filename = f"doctor_wise_appointments_{date.today()}.csv"
    return Response(
        content=csv_buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# REPORT 3: Patient Registration
@router.get("/patient-registration")
def get_patient_registration(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    gender: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    items, total = report_service.get_patient_registration_report(
        db, start_date=start_date, end_date=end_date, gender=gender, search=search, skip=skip, limit=limit
    )
    return {"total": total, "items": items}

@router.get("/patient-registration/csv")
def download_patient_registration_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    gender: Optional[str] = None,
    db: Session = Depends(get_db)
):
    csv_buf = report_service.export_patient_registration_csv(db, start_date=start_date, end_date=end_date, gender=gender)
    filename = f"patient_registrations_{date.today()}.csv"
    return Response(
        content=csv_buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# REPORT 4: Appointment Cancellation
@router.get("/appointment-cancellation")
def get_appointment_cancellation(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    items, total = report_service.get_appointment_cancellation_report(
        db, start_date=start_date, end_date=end_date, search=search, skip=skip, limit=limit
    )
    return {"total": total, "items": items}

@router.get("/appointment-cancellation/csv")
def download_cancellation_report_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    csv_buf = report_service.export_cancellation_report_csv(db, start_date=start_date, end_date=end_date)
    filename = f"appointment_cancellations_{date.today()}.csv"
    return Response(
        content=csv_buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

