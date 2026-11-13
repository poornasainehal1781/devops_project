from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, Token
from app.schemas.patient import PatientRegistration, PatientResponse
from app.schemas.user import UserResponse
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.services.auth_service import authenticate_user, register_patient_user
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(db, login_data)

@router.post("/register", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def register(reg_data: PatientRegistration, db: Session = Depends(get_db)):
    return register_patient_user(db, reg_data)

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone": current_user.phone,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }

    if current_user.role == "DOCTOR":
        doc = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doc:
            result["doctor_id"] = doc.id
            result["specialization"] = doc.specialization
            result["consultation_fee"] = float(doc.consultation_fee)
    elif current_user.role == "PATIENT":
        pat = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if pat:
            result["patient_id"] = pat.id
            result["gender"] = pat.gender
            result["date_of_birth"] = str(pat.date_of_birth)
            result["blood_group"] = pat.blood_group

    return result

