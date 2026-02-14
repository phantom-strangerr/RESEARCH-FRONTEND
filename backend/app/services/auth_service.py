from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.user import User, UserRole
from app.utils.security import verify_password, get_password_hash


def get_user_by_username(db: Session, username: str):
    """Fetch a user by username."""
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    """Validate credentials and return the user or None."""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_last_login(db: Session, user: User):
    """Update user's last_login timestamp."""
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def seed_users(db: Session):
    """Create demo users if they don't already exist."""
    demo_users = [
        {
            "username": "admin",
            "email": "admin@iotsoc.local",
            "password": "admin123",
            "full_name": "Super Administrator",
            "role": UserRole.SUPER_ADMIN,
        },
        {
            "username": "secadmin",
            "email": "secadmin@iotsoc.local",
            "password": "sec123",
            "full_name": "Security Administrator",
            "role": UserRole.SECURITY_ADMIN,
        },
        {
            "username": "operator",
            "email": "operator@iotsoc.local",
            "password": "op123",
            "full_name": "Network Operator",
            "role": UserRole.OPERATOR,
        },
        {
            "username": "analyst",
            "email": "analyst@iotsoc.local",
            "password": "analyst123",
            "full_name": "Security Analyst",
            "role": UserRole.ANALYST,
        },
    ]

    created = []
    for u in demo_users:
        existing = get_user_by_username(db, u["username"])
        if existing:
            continue

        user = User(
            username=u["username"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            full_name=u["full_name"],
            role=u["role"],
            is_active=True,
        )
        db.add(user)
        created.append(u["username"])

    db.commit()
    return created