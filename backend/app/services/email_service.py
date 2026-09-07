"""
Email Notification Service for MPLAD Scheme Monitoring Platform
Handles automated alerts to admin (admin777444555@gmail.com) upon user events (e.g. public registration),
with resilient SQLite audit logging and fallback delivery channels.
"""

import os
import smtplib
import sqlite3
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any, Optional

from backend.app.database import DB_PATH

ADMIN_EMAIL = "admin777444555@gmail.com"

# Optional SMTP Configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "mplads-alerts@gov.in")

def init_notification_table():
    """Initializes admin_notifications table if not present."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient TEXT NOT NULL,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            user_id INTEGER,
            username TEXT,
            state TEXT,
            status TEXT NOT NULL,
            delivery_channel TEXT NOT NULL,
            error_message TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def send_admin_registration_notification(user_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sends registration notification email to admin777444555@gmail.com.
    Logs each dispatch in admin_notifications table.
    Gracefully handles network/SMTP unavailability without failing user flow.
    """
    init_notification_table()
    
    username = user_info.get("username", "Unknown")
    email = user_info.get("email", "N/A")
    phone = user_info.get("phone", "N/A")
    state = user_info.get("state", "All India")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    
    subject = f"[MPLAD AI Alert] New Citizen Auditor Registered: {username} ({state})"
    
    body_text = f"""
=====================================================
GOVERNMENT OF INDIA - MoSPI / SMART INDIA HACKATHON
MPLAD AI Risk & Anomaly Intelligence Monitoring System
=====================================================

NEW PUBLIC CITIZEN AUDITOR REGISTRATION NOTIFICATION
Recipient: {ADMIN_EMAIL}
Timestamp: {now_str}

Citizen Details:
----------------
• Username:      {username}
• Registered State: {state}
• Email Address: {email}
• Phone Number:  {phone}
• Role Granted:  Public Auditor (State-Scoped with LS/RS Access)

Audit Log:
This citizen has been successfully provisioned on the platform.
Data access is automatically defaulted to {state} with optional
Lok Sabha and Rajya Sabha cross-state exploration.

Best regards,
MPLAD Intelligence AI Daemon
Ministry of Statistics and Programme Implementation (MoSPI)
=====================================================
"""

    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">MPLAD AI Risk & Anomaly Intelligence</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Ministry of Statistics & Programme Implementation (MoSPI)</p>
        </div>
        <div style="padding: 24px;">
            <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-weight: bold; color: #166534; font-size: 14px;">🔔 New Citizen Auditor Registration</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #15803d;">Admin Alert Destination: <strong>{ADMIN_EMAIL}</strong></p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Username</td>
                    <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">{username}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Registered State</td>
                    <td style="padding: 10px 0; font-weight: 600; color: #2563eb;">{state}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Email ID</td>
                    <td style="padding: 10px 0; color: #0f172a;">{email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Phone Number</td>
                    <td style="padding: 10px 0; color: #0f172a;">{phone}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Role</td>
                    <td style="padding: 10px 0; color: #0f172a;"><span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Public Auditor</span></td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Registration Time</td>
                    <td style="padding: 10px 0; color: #0f172a;">{now_str}</td>
                </tr>
            </table>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
                System generated notification by MoSPI MPLADS Risk Intelligence System.
            </div>
        </div>
    </div>
    """

    status = "DELIVERED"
    delivery_channel = "DATABASE_AUDIT"
    error_msg = None

    # Try SMTP transmission if credentials exist
    if SMTP_HOST and SMTP_USER and SMTP_PASS:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_FROM
            msg["To"] = ADMIN_EMAIL
            
            part1 = MIMEText(body_text, "plain")
            part2 = MIMEText(body_html, "html")
            msg.attach(part1)
            msg.attach(part2)
            
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=8) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_FROM, [ADMIN_EMAIL], msg.as_string())
            delivery_channel = "SMTP_DIRECT"
            print(f"[EmailService] Successfully sent SMTP email to {ADMIN_EMAIL}")
        except Exception as e:
            delivery_channel = "DATABASE_AUDIT_FALLBACK"
            error_msg = str(e)
            print(f"[EmailService] SMTP relay skipped or failed ({e}). Stored in database audit log.")
    else:
        delivery_channel = "DATABASE_AUDIT_LOGGED"
        print(f"[EmailService] SMTP not configured. Notification recorded to database audit log for {ADMIN_EMAIL}")

    # Persist in admin_notifications table
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO admin_notifications 
        (recipient, subject, body, user_id, username, state, status, delivery_channel, error_message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ADMIN_EMAIL,
        subject,
        body_text,
        user_info.get("id"),
        username,
        state,
        status,
        delivery_channel,
        error_msg,
        now_str
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "recipient": ADMIN_EMAIL,
        "channel": delivery_channel,
        "timestamp": now_str
    }

def get_admin_notifications(limit: int = 50):
    """Retrieves recent admin notifications."""
    init_notification_table()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_notifications ORDER BY id DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows
