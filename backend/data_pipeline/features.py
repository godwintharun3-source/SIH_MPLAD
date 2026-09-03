"""
Feature Engineering Engine for MPLAD Master Projects & Expenditures
Computes cost deviation, comparable category benchmarks, delay calculations,
linked expenditure metrics, duplicate signatures, and prepares training matrices.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/processed"))

def run_feature_engineering():
    print("Starting Feature Engineering...")
    t0 = datetime.now()
    
    projects_path = os.path.join(PROCESSED_DIR, "master_projects.csv")
    exp_path = os.path.join(PROCESSED_DIR, "master_expenditures.csv")
    
    df_proj = pd.read_csv(projects_path, low_memory=False)
    df_exp = pd.read_csv(exp_path, low_memory=False)
    
    # 1. Expenditure Aggregations per Project
    print("Aggregating linked expenditures and duplicate signatures...")
    
    # Group duplicate signatures in expenditures
    # Signature: mp_name + constituency + vendor + ida + expenditure_amount + expenditure_date
    df_exp["sig_key"] = (
        df_exp["mp_name"].astype(str) + "___" +
        df_exp["constituency"].astype(str) + "___" +
        df_exp["vendor"].astype(str) + "___" +
        df_exp["ida"].astype(str) + "___" +
        df_exp["expenditure_amount"].astype(str) + "___" +
        df_exp["expenditure_date"].astype(str)
    )
    
    sig_counts = df_exp["sig_key"].value_counts()
    df_exp["sig_repeat_count"] = df_exp["sig_key"].map(sig_counts)
    df_exp["is_repeated_signature"] = df_exp["sig_repeat_count"] > 1
    
    # Save enriched expenditures
    df_exp.to_csv(os.path.join(PROCESSED_DIR, "enriched_expenditures.csv"), index=False)
    
    # Aggregate linked expenditures to projects
    linked_exp = df_exp[df_exp["matched_project_id"].notna()]
    proj_exp_agg = linked_exp.groupby("matched_project_id").agg(
        tx_count=("transaction_id", "count"),
        tx_total_amount=("expenditure_amount", "sum"),
        tx_max_single_amount=("expenditure_amount", "max"),
        tx_exact_duplicate_count=("is_exact_duplicate", lambda s: int(s.sum())),
        tx_repeated_signature_count=("is_repeated_signature", lambda s: int(s.sum()))
    ).reset_index().rename(columns={"matched_project_id": "project_id"})
    
    df_proj = df_proj.merge(proj_exp_agg, on="project_id", how="left")
    df_proj["tx_count"] = df_proj["tx_count"].fillna(0).astype(int)
    df_proj["tx_total_amount"] = df_proj["tx_total_amount"].fillna(0.0)
    df_proj["tx_max_single_amount"] = df_proj["tx_max_single_amount"].fillna(0.0)
    df_proj["tx_exact_duplicate_count"] = df_proj["tx_exact_duplicate_count"].fillna(0).astype(int)
    df_proj["tx_repeated_signature_count"] = df_proj["tx_repeated_signature_count"].fillna(0).astype(int)
    
    # 2. Cost Deviation Metrics
    print("Computing cost deviation metrics...")
    rec_amt = df_proj["recommended_amount"].astype(float)
    fin_amt = df_proj["final_amount"].astype(float)
    
    has_both_amounts = (rec_amt > 0) & (fin_amt > 0)
    df_proj["cost_deviation_amount"] = np.where(has_both_amounts, fin_amt - rec_amt, 0.0)
    df_proj["cost_deviation_pct"] = np.where(
        has_both_amounts,
        np.round(((fin_amt - rec_amt) / rec_amt) * 100.0, 2),
        0.0
    )
    
    # 3. Category Benchmark / Comparable Project Median
    print("Calculating category median benchmarks...")
    cat_medians = df_proj[df_proj["recommended_amount"] > 0].groupby("category")["recommended_amount"].median().to_dict()
    overall_median = df_proj[df_proj["recommended_amount"] > 0]["recommended_amount"].median()
    if pd.isna(overall_median) or overall_median <= 0:
        overall_median = 500000.0
        
    df_proj["category_median_amount"] = df_proj["category"].map(cat_medians).fillna(overall_median)
    df_proj["category_cost_deviation_pct"] = np.where(
        df_proj["category_median_amount"] > 0,
        np.round(((df_proj["recommended_amount"] - df_proj["category_median_amount"]) / df_proj["category_median_amount"]) * 100.0, 2),
        0.0
    )
    
    # 4. Project Duration & Delay Categorization
    print("Calculating duration and delay metrics...")
    rec_dates = pd.to_datetime(df_proj["recommendation_date"], errors="coerce")
    comp_dates = pd.to_datetime(df_proj["completed_date"], errors="coerce")
    duration_series = (comp_dates - rec_dates).dt.days
    df_proj["project_duration_days"] = np.where(duration_series.notna() & (duration_series >= 0), duration_series, 0).astype(int)
    
    # Delay status
    delay_conditions = [
        (df_proj["completion_status"] == "COMPLETED") & (df_proj["project_duration_days"] > 730),
        (df_proj["completion_status"] == "COMPLETED") & (df_proj["project_duration_days"] > 365),
        (df_proj["completion_status"] == "COMPLETED") & (df_proj["project_duration_days"] <= 365),
        (df_proj["completion_status"] == "COMPLETION_VERIFICATION_REQUIRED")
    ]
    delay_choices = ["SEVERELY_DELAYED", "DELAYED", "NORMAL", "VERIFICATION_REQUIRED"]
    df_proj["delay_status"] = np.select(delay_conditions, delay_choices, default="NORMAL")
    
    # Save enriched project master
    out_path = os.path.join(PROCESSED_DIR, "enriched_projects.csv")
    df_proj.to_csv(out_path, index=False)
    
    duration = (datetime.now() - t0).total_seconds()
    print(f"Feature engineering completed in {duration:.2f}s! Saved enriched dataset ({len(df_proj):,} rows) to {out_path}")
    return df_proj

if __name__ == "__main__":
    run_feature_engineering()
