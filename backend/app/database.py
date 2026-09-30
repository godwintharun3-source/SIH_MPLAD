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

# On Vercel / AWS Lambda, file system is read-only except /tmp
IS_VERCEL = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

if IS_VERCEL:
    TMP_DB = "/tmp/mplads_intelligence.db"
    if not os.path.exists(TMP_DB):
        if os.path.exists(DB_PATH):
            try:
                shutil.copyfile(DB_PATH, TMP_DB)
            except Exception as e:
                print(f"Could not copy DB to /tmp: {e}")
        elif os.path.exists(GZ_PATH):
            print(f"Decompressing {GZ_PATH} to {TMP_DB} on Vercel...")
            try:
                with gzip.open(GZ_PATH, 'rb') as f_in:
                    with open(TMP_DB, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                print("Database decompression to /tmp completed successfully!")
            except Exception as e:
                print(f"Error decompressing database to /tmp: {e}")
    if os.path.exists(TMP_DB):
        DB_PATH = TMP_DB
else:
    # Auto-decompress from compressed archive if SQLite file is missing locally
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
