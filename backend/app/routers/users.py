from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.auth_service import create_receptionist_user
from app.dependencies.auth import require_admin

router = APIRouter(prefix="/api/users", tags=["Users & Receptionists"])

@router.get("/receptionists", response_model=List[UserResponse], dependencies=[Depends(require_admin)])
def list_receptionists(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == UserRole.RECEPTIONIST.value).order_by(User.id.desc()).all()

@router.post("/receptionists", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_receptionist(user_data: UserCreate, db: Session = Depends(get_db)):
    return create_receptionist_user(db, user_data)

@router.patch("/{user_id}/toggle-active", response_model=UserResponse, dependencies=[Depends(require_admin)])
def toggle_user_active(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

