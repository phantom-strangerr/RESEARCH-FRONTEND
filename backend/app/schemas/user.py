from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# --- Request schemas ---

class LoginRequest(BaseModel):
    username: str
    password: str


# --- Response schemas ---

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut