from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserOut
from app.services.auth_service import authenticate_user, update_last_login, seed_users
from app.utils.security import create_access_token, verify_password
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = authenticate_user(db, request.username, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    update_last_login(db, user)

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )

    return TokenResponse(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return current_user


class PasswordVerifyRequest(BaseModel):
    password: str


@router.post("/verify-password")
def verify_current_user_password(
    body: PasswordVerifyRequest,
    current_user: User = Depends(get_current_user),
):
    """Verify the currently logged-in user's password (used to confirm sensitive actions)."""
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    return {"valid": True}


@router.post("/seed")
def seed_demo_users(db: Session = Depends(get_db)):
    """Create demo users. Call once after DB setup."""
    created = seed_users(db)
    return {"message": f"Seeded {len(created)} users", "users": created}