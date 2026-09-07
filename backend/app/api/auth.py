"""
Authentication and Role-Based Access Control (RBAC) Endpoints
Supports Admin (admin/admin@123K), Employee (emplo/emplo@123K), and Public Citizens (State-Scoped),
with admin email alerts to admin777444555@gmail.com.
"""

import os
import time
import hashlib
import sqlite3
import secrets
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException, Depends, Header

from backend.app.database import DB_PATH
from backend.app.services.email_service import (
    send_admin_registration_notification,
    get_admin_notifications,
    init_notification_table,
    ADMIN_EMAIL
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman And Nicobar Islands",
    "Chandigarh", "Dadra And Nagar Haveli", "Delhi", "Jammu And Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
]

# Simple in-memory token store for session management
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

def hash_password(password: str, salt: str = "mplad_salt_2026") -> str:
    """Generates SHA-256 password hash with salt."""
    return hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_users_table():
    """Initializes users table and provisions default Admin and Employee accounts."""
    init_notification_table()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            state TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()

    # Provision Default Admin: admin / admin@123K
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        admin_hash = hash_password("admin@123K")
        cursor.execute("""
            INSERT INTO users (username, email, phone, password_hash, role, state, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("admin", ADMIN_EMAIL, "+91-9876543210", admin_hash, "admin", "All India", datetime.now().isoformat()))

    # Provision Default Employee: emplo / emplo@123K
    cursor.execute("SELECT id FROM users WHERE username = 'emplo'")
    if not cursor.fetchone():
        emplo_hash = hash_password("emplo@123K")
        cursor.execute("""
            INSERT INTO users (username, email, phone, password_hash, role, state, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("emplo", "emplo@mplad.gov.in", "+91-9876543211", emplo_hash, "employee", "All India", datetime.now().isoformat()))

    conn.commit()
    conn.close()

# Models
class RegisterRequest(BaseModel):
    username: str
    phone_number: str
    mailid: str
    password: str
    confirm_password: str
    state: str

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: str
    phone: Optional[str] = None
    role: str
    state: Optional[str] = None
    token: str

@router.get("/states")
def get_states_list():
    """Returns official list of 36 Indian States and Union Territories."""
    return {"states": sorted(INDIAN_STATES)}

@router.post("/register")
def register_user(req: RegisterRequest):
    """
    Registers a new public citizen auditor.
    Stores user record, assigns state scoping, and dispatches email alert to admin777444555@gmail.com.
    """
    init_users_table()
    
    # 1. Validation
    username = req.username.strip()
    email = req.mailid.strip().lower()
    phone = req.phone_number.strip()
    state = req.state.strip()
    
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Password and confirm password do not match.")
    if len(req.password) < 5:
        raise HTTPException(status_code=400, detail="Password must be at least 5 characters long.")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email address is required.")
    if not state:
        state = "All India"

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check for existing username or email
    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username or email already exists. Please choose another or log in.")

    # Insert user
    pwd_hash = hash_password(req.password)
    now_iso = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO users (username, email, phone, password_hash, role, state, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (username, email, phone, pwd_hash, "public", state, now_iso))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    # Dispatch email notification to admin777444555@gmail.com
    user_data = {
        "id": user_id,
        "username": username,
        "email": email,
        "phone": phone,
        "role": "public",
        "state": state
    }
    
    try:
        send_admin_registration_notification(user_data)
    except Exception as e:
        print(f"[Auth] Notification warning (non-fatal): {e}")

    # Generate session token
    token = secrets.token_hex(24)
    ACTIVE_SESSIONS[token] = user_data

    return {
        "success": True,
        "message": "Citizen auditor successfully registered.",
        "user": user_data,
        "token": token
    }

@router.post("/login")
def login_user(req: LoginRequest):
    """
    Authenticates user via username or email and password.
    Supports default Admin (admin/admin@123K), Employee (emplo/emplo@123K), and Public Citizens.
    """
    init_users_table()
    
    identifier = req.username_or_email.strip()
    password = req.password.strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    # Case-insensitive match on username or email
    cursor.execute("""
        SELECT * FROM users 
        WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
    """, (identifier, identifier))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row:
        raise HTTPException(status_code=401, detail="Invalid username/email or password.")

    user = dict(user_row)
    expected_hash = hash_password(password)

    # Allow direct match or hash match
    if user["password_hash"] != expected_hash:
        raise HTTPException(status_code=401, detail="Invalid username/email or password.")

    token = secrets.token_hex(24)
    user_payload = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
        "state": user["state"] or "All India"
    }
    ACTIVE_SESSIONS[token] = user_payload

    return {
        "success": True,
        "message": f"Welcome back, {user['username']}!",
        "user": user_payload,
        "token": token
    }

@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    """Validates session token and returns active user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header.")
    
    token = authorization.replace("Bearer ", "").strip()
    if token in ACTIVE_SESSIONS:
        return {"success": True, "user": ACTIVE_SESSIONS[token]}
    
    # Fallback to demo guest if token unknown
    raise HTTPException(status_code=401, detail="Session expired or invalid.")

@router.get("/notifications")
def list_admin_notifications(authorization: Optional[str] = Header(None)):
    """Returns list of registration email notifications for admin audit."""
    notifications = get_admin_notifications(50)
    return {
        "admin_email": ADMIN_EMAIL,
        "count": len(notifications),
        "notifications": notifications
    }
