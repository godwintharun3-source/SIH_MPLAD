"""
Database Connection and Session Manager for SQLite / SQLAlchemy
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import gzip
import shutil

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/processed/mplads_intelligence.db"))
GZ_PATH = DB_PATH + ".gz"

# Auto-decompress from compressed archive if SQLite file is missing
if not os.path.exists(DB_PATH) and os.path.exists(GZ_PATH):
    print(f"Decompressing {GZ_PATH} to {DB_PATH}...")
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        with gzip.open(GZ_PATH, 'rb') as f_in:
            with open(DB_PATH, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        print("Database decompression completed successfully!")
    except Exception as e:
        print(f"Error decompressing database: {e}")

DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
