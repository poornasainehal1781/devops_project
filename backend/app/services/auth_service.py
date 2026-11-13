from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.schemas.auth import LoginRequest, Token
from app.schemas.patient import PatientRegistration
from app.schemas.user import UserCreate
from app.utils.security import verify_password, hash_password, create_access_token
from datetime import timedelta

def authenticate_user(db: Session, login_data: LoginRequest) -> Token:
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently deactivated. Please contact administration."
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "email": user.email}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email
    )

def register_patient_user(db: Session, reg_data: PatientRegistration) -> Patient:
    # Check if email exists
    existing = db.query(User).filter(User.email == reg_data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    new_user = User(
        email=reg_data.email.lower().strip(),
        hashed_password=hash_password(reg_data.password),
        full_name=reg_data.full_name.strip(),
        phone=reg_data.phone,
        role=UserRole.PATIENT.value,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    new_patient = Patient(
        user_id=new_user.id,
        date_of_birth=reg_data.date_of_birth,
        gender=reg_data.gender,
        blood_group=reg_data.blood_group,
        address=reg_data.address,
        emergency_contact_name=reg_data.emergency_contact_name,
        emergency_contact_phone=reg_data.emergency_contact_phone
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

def create_receptionist_user(db: Session, user_data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == user_data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    new_user = User(
        email=user_data.email.lower().strip(),
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name.strip(),
        phone=user_data.phone,
        role=UserRole.RECEPTIONIST.value,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

