from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.services import report_service, doctor_service, patient_service
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("/dashboard")
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role.upper()
    if role == "ADMIN":
        return {
            "role": "ADMIN",
            "data": report_service.get_admin_dashboard_stats(db)
        }
    elif role == "DOCTOR":
        doc = doctor_service.get_doctor_by_user_id(db, current_user.id)
        return {
            "role": "DOCTOR",
            "data": report_service.get_doctor_dashboard_stats(db, doc.id)
        }
    elif role == "RECEPTIONIST":
        return {
            "role": "RECEPTIONIST",
            "data": report_service.get_receptionist_dashboard_stats(db)
        }
    elif role == "PATIENT":
        pat = patient_service.get_patient_by_user_id(db, current_user.id)
        return {
            "role": "PATIENT",
            "data": report_service.get_patient_dashboard_stats(db, pat.id)
        }
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown role")

