"""
High-Performance Vectorized Data Cleaning & Normalization Pipeline for MPLAD Datasets
Cleans whitespace, normalizes column names, standardizes dates and amounts,
tracks transformation audit log, and writes clean data to data/processed/.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/raw"))
PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/processed"))
os.makedirs(PROCESSED_DIR, exist_ok=True)

audit_log = []

def log_audit(step, message, records_affected=0):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "step": step,
        "message": message,
        "records_affected": int(records_affected)
    }
    audit_log.append(entry)
    print(f"[{step}] {message} ({records_affected:,} records)")

def clean_mp_summary():
    file_path = os.path.join(RAW_DIR, "mplads_mp_summary_2026-08-28.csv")
    if not os.path.exists(file_path):
        return None
    
    df = pd.read_csv(file_path, low_memory=False)
    log_audit("CLEAN_MP_SUMMARY", "Loaded raw MP summary", len(df))
    
    rename_map = {
        "MP Name": "mp_name",
        "Constituency": "constituency",
        "State": "state",
        "House": "house",
        "Allocated Amount (₹)": "allocated_amount",
        "Total Expenditure (₹)": "total_expenditure",
        "Utilization %": "utilization_pct",
        "Completed Works": "completed_works",
        "Recommended Works": "recommended_works",
        "Completion Rate %": "completion_rate_pct",
        "Unspent Amount (₹)": "unspent_amount",
        "Transaction Count": "transaction_count",
        "Successful Payments": "successful_payments",
        "Pending Payments": "pending_payments",
        "Average Rating": "average_rating"
    }
    df = df.rename(columns=rename_map)
    
    for col in ["mp_name", "constituency", "state", "house"]:
        df[col] = df[col].astype(str).str.strip().str.replace(r"\s+", " ", regex=True)
        
    num_cols = ["allocated_amount", "total_expenditure", "utilization_pct", 
                "completed_works", "recommended_works", "completion_rate_pct", 
                "unspent_amount", "transaction_count", "successful_payments", "pending_payments"]
    for col in num_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        
    df["average_rating"] = pd.to_numeric(df["average_rating"].replace("N/A", np.nan), errors="coerce")
    
    out_path = os.path.join(PROCESSED_DIR, "clean_mp_summary.csv")
    df.to_csv(out_path, index=False)
    log_audit("CLEAN_MP_SUMMARY", "Saved clean MP summary", len(df))
    return df

def clean_recommended_works():
    file_path = os.path.join(RAW_DIR, "mplads_recommended_works_2026-08-28.csv")
    if not os.path.exists(file_path):
        return None
    
    df = pd.read_csv(file_path, low_memory=False)
    log_audit("CLEAN_RECOMMENDED_WORKS", "Loaded raw recommended works", len(df))
    
    rename_map = {
        "Work ID": "work_id",
        "Work Description": "work_description",
        "Category": "category",
        "MP Name": "mp_name",
        "Constituency": "constituency",
        "State": "state",
        "House": "house",
        "Recommended Amount (₹)": "recommended_amount",
        "Recommendation Date": "recommendation_date",
        "Has Images": "has_images",
        "IDA": "ida"
    }
    df = df.rename(columns=rename_map)
    
    for col in ["work_description", "category", "mp_name", "constituency", "state", "house", "ida"]:
        df[col] = df[col].fillna("").astype(str).str.strip().str.replace(r"\s+", " ", regex=True)
        
    # Vectorized date string slicing (take first 10 chars YYYY-MM-DD)
    df["recommendation_date"] = df["recommendation_date"].astype(str).str.slice(0, 10)
    df.loc[~df["recommendation_date"].str.match(r"^\d{4}-\d{2}-\d{2}$", na=False), "recommendation_date"] = None
    
    df["recommended_amount"] = pd.to_numeric(df["recommended_amount"], errors="coerce").fillna(0.0)
    df["work_id"] = pd.to_numeric(df["work_id"], errors="coerce").fillna(0).astype("int64")
    df["has_images"] = df["has_images"].astype(bool)
    
    # Vectorized district extraction: IDA before '('
    extracted_district = df["ida"].str.split("(", n=1).str[0].str.strip()
    df["district"] = np.where(extracted_district != "", extracted_district, df["constituency"])
    
    out_path = os.path.join(PROCESSED_DIR, "clean_recommended_works.csv")
    df.to_csv(out_path, index=False)
    log_audit("CLEAN_RECOMMENDED_WORKS", "Saved clean recommended works", len(df))
    return df

def clean_completed_works():
    file_path = os.path.join(RAW_DIR, "mplads_completed_works_2026-08-28.csv")
    if not os.path.exists(file_path):
        return None
    
    df = pd.read_csv(file_path, low_memory=False)
    log_audit("CLEAN_COMPLETED_WORKS", "Loaded raw completed works", len(df))
    
    rename_map = {
        "Work ID": "work_id",
        "Work Description": "work_description",
        "Category": "category",
        "MP Name": "mp_name",
        "Constituency": "constituency",
        "State": "state",
        "House": "house",
        "Final Amount (₹)": "final_amount",
        "Completed Date": "completed_date",
        "Has Images": "has_images",
        "Average Rating": "average_rating",
        "IDA": "ida"
    }
    df = df.rename(columns=rename_map)
    
    for col in ["work_description", "category", "mp_name", "constituency", "state", "house", "ida"]:
        df[col] = df[col].fillna("").astype(str).str.strip().str.replace(r"\s+", " ", regex=True)
        
    df["completed_date"] = df["completed_date"].astype(str).str.slice(0, 10)
    df.loc[~df["completed_date"].str.match(r"^\d{4}-\d{2}-\d{2}$", na=False), "completed_date"] = None
    
    df["final_amount"] = pd.to_numeric(df["final_amount"], errors="coerce").fillna(0.0)
    df["work_id"] = pd.to_numeric(df["work_id"], errors="coerce").fillna(0).astype("int64")
    df["has_images"] = df["has_images"].astype(bool)
    df["average_rating"] = pd.to_numeric(df["average_rating"], errors="coerce")
    
    extracted_district = df["ida"].str.split("(", n=1).str[0].str.strip()
    df["district"] = np.where(extracted_district != "", extracted_district, df["constituency"])
    
    out_path = os.path.join(PROCESSED_DIR, "clean_completed_works.csv")
    df.to_csv(out_path, index=False)
    log_audit("CLEAN_COMPLETED_WORKS", "Saved clean completed works", len(df))
    return df

def clean_expenditures():
    file_path = os.path.join(RAW_DIR, "mplads_expenditures_2026-08-28.csv")
    if not os.path.exists(file_path):
        return None
    
    df = pd.read_csv(file_path, low_memory=False)
    raw_count = len(df)
    log_audit("CLEAN_EXPENDITURES", "Loaded raw expenditures", raw_count)
    
    rename_map = {
        "MP Name": "mp_name",
        "Constituency": "constituency",
        "State": "state",
        "House": "house",
        "Work Description": "work_description",
        "Vendor": "vendor",
        "IDA": "ida",
        "Expenditure Amount (₹)": "expenditure_amount",
        "Expenditure Date": "expenditure_date",
        "Payment Status": "payment_status"
    }
    df = df.rename(columns=rename_map)
    
    for col in ["work_description", "mp_name", "constituency", "state", "house", "vendor", "ida", "payment_status"]:
        df[col] = df[col].fillna("").astype(str).str.strip().str.replace(r"\s+", " ", regex=True)
        
    df["expenditure_date"] = df["expenditure_date"].astype(str).str.slice(0, 10)
    df.loc[~df["expenditure_date"].str.match(r"^\d{4}-\d{2}-\d{2}$", na=False), "expenditure_date"] = None
    
    df["expenditure_amount"] = pd.to_numeric(df["expenditure_amount"], errors="coerce").fillna(0.0)
    
    # Mark duplicate signatures for anomaly analysis
    df["is_exact_duplicate"] = df.duplicated(keep=False)
    exact_dup_count = int(df["is_exact_duplicate"].sum())
    log_audit("CLEAN_EXPENDITURES", f"Identified {exact_dup_count} exact duplicate rows (retained with flag for anomaly intelligence)", exact_dup_count)
    
    df["transaction_id"] = [f"TX-{i+1:06d}" for i in range(len(df))]
    
    out_path = os.path.join(PROCESSED_DIR, "clean_expenditures.csv")
    df.to_csv(out_path, index=False)
    log_audit("CLEAN_EXPENDITURES", "Saved clean expenditures", len(df))
    return df

def run_cleaning():
    print("Starting High-Speed Data Cleaning Pipeline...")
    t0 = datetime.now()
    clean_mp_summary()
    clean_recommended_works()
    clean_completed_works()
    clean_expenditures()
    
    audit_path = os.path.join(PROCESSED_DIR, "cleaning_audit_log.json")
    with open(audit_path, "w", encoding="utf-8") as af:
        json.dump(audit_log, af, indent=2)
    duration = (datetime.now() - t0).total_seconds()
    print(f"Cleaning completed in {duration:.2f}s! Saved transformation audit log to {audit_path}")

if __name__ == "__main__":
    run_cleaning()
