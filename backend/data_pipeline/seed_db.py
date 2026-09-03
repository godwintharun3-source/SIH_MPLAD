"""
High-Speed SQLite Database Seed Pipeline for MPLAD Intelligence Platform
Uses native SQLite batch loading and creates custom multi-column B-Tree indices
for sub-millisecond query performance across 250,000+ records.
"""

import os
import sys
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
PROCESSED_DIR = os.path.abspath(os.path.join(ROOT_DIR, "data/processed"))
DB_PATH = os.path.join(PROCESSED_DIR, "mplads_intelligence.db")

def run_seed():
    print(f"Starting High-Speed SQLite Seeding to {DB_PATH}...")
    t0 = datetime.now()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Projects
    proj_path = os.path.join(PROCESSED_DIR, "scored_projects.csv")
    print(f"Loading {proj_path}...")
    df_proj = pd.read_csv(proj_path, low_memory=False)
    
    # Convert booleans to 0/1 integers for SQLite compatibility
    df_proj["has_images"] = df_proj["has_images"].astype(int)
    df_proj["is_ml_anomaly"] = df_proj["is_ml_anomaly"].astype(int)
    
    print(f"Writing {len(df_proj):,} project records to SQLite...")
    df_proj.to_sql("projects", conn, if_exists="replace", index=False)
    
    # 2. Expenditures
    exp_path = os.path.join(PROCESSED_DIR, "enriched_expenditures.csv")
    print(f"Loading {exp_path}...")
    df_exp = pd.read_csv(exp_path, low_memory=False)
    df_exp = df_exp.drop(columns=["sig_key"], errors="ignore")
    df_exp["is_exact_duplicate"] = df_exp["is_exact_duplicate"].astype(int)
    df_exp["is_repeated_signature"] = df_exp["is_repeated_signature"].astype(int)
    
    print(f"Writing {len(df_exp):,} expenditure records to SQLite...")
    df_exp.to_sql("expenditures", conn, if_exists="replace", index=False)
    
    # 3. MP Summaries
    mp_path = os.path.join(PROCESSED_DIR, "clean_mp_summary.csv")
    print(f"Loading {mp_path}...")
    df_mp = pd.read_csv(mp_path, low_memory=False)
    
    mp_risk_agg = df_proj.groupby("mp_name").agg(
        avg_risk_score=("risk_score", "mean"),
        high_risk_projects_count=("risk_level", lambda s: int(s.isin(["HIGH", "CRITICAL"]).sum()))
    ).reset_index()
    
    df_mp = df_mp.merge(mp_risk_agg, on="mp_name", how="left")
    df_mp["avg_risk_score"] = df_mp["avg_risk_score"].fillna(0.0).round(1)
    df_mp["high_risk_projects_count"] = df_mp["high_risk_projects_count"].fillna(0).astype(int)
    
    print(f"Writing {len(df_mp):,} MP summary records to SQLite...")
    df_mp.to_sql("mp_summaries", conn, if_exists="replace", index=False)
    
    # 4. Create Performance B-Tree Indices
    print("Creating B-Tree indices for instant search & filtering...")
    indices = [
        "CREATE INDEX IF NOT EXISTS idx_proj_id ON projects(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_proj_state ON projects(state)",
        "CREATE INDEX IF NOT EXISTS idx_proj_district ON projects(district)",
        "CREATE INDEX IF NOT EXISTS idx_proj_constituency ON projects(constituency)",
        "CREATE INDEX IF NOT EXISTS idx_proj_mp ON projects(mp_name)",
        "CREATE INDEX IF NOT EXISTS idx_proj_cat ON projects(category)",
        "CREATE INDEX IF NOT EXISTS idx_proj_risk_lvl ON projects(risk_level)",
        "CREATE INDEX IF NOT EXISTS idx_proj_risk_score ON projects(risk_score DESC)",
        "CREATE INDEX IF NOT EXISTS idx_proj_status ON projects(completion_status)",
        "CREATE INDEX IF NOT EXISTS idx_proj_state_risk ON projects(state, risk_level)",
        
        "CREATE INDEX IF NOT EXISTS idx_exp_tx_id ON expenditures(transaction_id)",
        "CREATE INDEX IF NOT EXISTS idx_exp_mp ON expenditures(mp_name)",
        "CREATE INDEX IF NOT EXISTS idx_exp_const ON expenditures(constituency)",
        "CREATE INDEX IF NOT EXISTS idx_exp_state ON expenditures(state)",
        "CREATE INDEX IF NOT EXISTS idx_exp_vendor ON expenditures(vendor)",
        "CREATE INDEX IF NOT EXISTS idx_exp_matched_proj ON expenditures(matched_project_id)",
        "CREATE INDEX IF NOT EXISTS idx_exp_dup ON expenditures(is_exact_duplicate)",
        "CREATE INDEX IF NOT EXISTS idx_exp_rep_sig ON expenditures(is_repeated_signature)",
        
        "CREATE INDEX IF NOT EXISTS idx_mp_name ON mp_summaries(mp_name)",
        "CREATE INDEX IF NOT EXISTS idx_mp_state ON mp_summaries(state)",
        "CREATE INDEX IF NOT EXISTS idx_mp_const ON mp_summaries(constituency)"
    ]
    
    for idx_sql in indices:
        cursor.execute(idx_sql)
        
    conn.commit()
    conn.close()
    
    duration = (datetime.now() - t0).total_seconds()
    print(f"Database successfully seeded and indexed in {duration:.2f}s!")

if __name__ == "__main__":
    run_seed()
