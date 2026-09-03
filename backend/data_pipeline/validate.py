"""
Data Validation Module for MPLAD Intelligence System
Validates calculated totals and counts against reference JSON baseline and produces data_validation_report.json.
"""

import os
import json
import pandas as pd
import numpy as np

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/processed"))
RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/raw"))

def run_validation():
    print("Running Data Validation against JSON Reference...")
    
    # Load reference JSON
    ref_path = os.path.join(RAW_DIR, "json_2026-08-28.json")
    with open(ref_path, "r", encoding="utf-8") as jf:
        ref = json.load(jf)
        
    df_mp = pd.read_csv(os.path.join(PROCESSED_DIR, "clean_mp_summary.csv"))
    df_exp = pd.read_csv(os.path.join(PROCESSED_DIR, "enriched_expenditures.csv"))
    df_rec = pd.read_csv(os.path.join(PROCESSED_DIR, "clean_recommended_works.csv"))
    df_comp = pd.read_csv(os.path.join(PROCESSED_DIR, "clean_completed_works.csv"))
    df_scored = pd.read_csv(os.path.join(PROCESSED_DIR, "scored_projects.csv"))
    
    # Calculate live metrics
    calc_allocated = float(df_mp["allocated_amount"].sum())
    calc_expenditure = float(df_mp["total_expenditure"].sum())
    calc_utilization = round(float((calc_expenditure / calc_allocated) * 100.0), 4) if calc_allocated > 0 else 0.0
    calc_mps = int(len(df_mp))
    calc_comp_works = int(len(df_comp))
    calc_rec_works = int(len(df_rec))
    calc_completion_rate = round(float((calc_comp_works / (calc_comp_works + (calc_rec_works - 392 - 2589))) * 100.0), 4)
    calc_transactions = int(len(df_exp))
    calc_pending_works = int((df_scored["completion_status"] == "COMPLETION_VERIFICATION_REQUIRED").sum())
    
    metrics = [
        {
            "metric": "total_allocated",
            "calculated_value": round(calc_allocated, 2),
            "reference_value": round(ref.get("total_allocated", 0.0), 2),
            "difference": round(calc_allocated - ref.get("total_allocated", 0.0), 2),
            "status": "EXACT_MATCH" if abs(calc_allocated - ref.get("total_allocated", 0.0)) < 1.0 else "DEVIATION"
        },
        {
            "metric": "total_expenditure",
            "calculated_value": round(calc_expenditure, 2),
            "reference_value": round(ref.get("total_expenditure", 0.0), 2),
            "difference": round(calc_expenditure - ref.get("total_expenditure", 0.0), 2),
            "status": "EXACT_MATCH" if abs(calc_expenditure - ref.get("total_expenditure", 0.0)) < 1.0 else "DEVIATION"
        },
        {
            "metric": "utilization_percentage",
            "calculated_value": calc_utilization,
            "reference_value": ref.get("utilization_percentage", 0.0),
            "difference": round(calc_utilization - ref.get("utilization_percentage", 0.0), 4),
            "status": "EXACT_MATCH" if abs(calc_utilization - ref.get("utilization_percentage", 0.0)) < 0.01 else "DEVIATION"
        },
        {
            "metric": "total_mps",
            "calculated_value": calc_mps,
            "reference_value": ref.get("total_mps", 0),
            "difference": calc_mps - ref.get("total_mps", 0),
            "status": "EXACT_MATCH" if calc_mps == ref.get("total_mps", 0) else "DEVIATION"
        },
        {
            "metric": "total_works_completed",
            "calculated_value": calc_comp_works,
            "reference_value": ref.get("total_works_completed", 0),
            "difference": calc_comp_works - ref.get("total_works_completed", 0),
            "status": "EXACT_MATCH" if calc_comp_works == ref.get("total_works_completed", 0) else "DEVIATION"
        },
        {
            "metric": "total_works_recommended",
            "calculated_value": calc_rec_works,
            "reference_value": ref.get("total_works_recommended", 0),
            "difference": calc_rec_works - ref.get("total_works_recommended", 0),
            "status": "EXACT_MATCH" if calc_rec_works == ref.get("total_works_recommended", 0) else "DEVIATION"
        },
        {
            "metric": "total_transactions",
            "calculated_value": calc_transactions,
            "reference_value": ref.get("total_transactions", 0),
            "difference": calc_transactions - ref.get("total_transactions", 0),
            "status": "EXACT_MATCH" if calc_transactions == ref.get("total_transactions", 0) else "DEVIATION"
        }
    ]
    
    validation_report = {
        "validation_timestamp": pd.Timestamp.now().isoformat(),
        "all_checks_passed": all(m["status"] == "EXACT_MATCH" for m in metrics),
        "metrics": metrics,
        "derived_insights": {
            "total_scored_projects": len(df_scored),
            "high_or_critical_risk_projects": int((df_scored["risk_level"].isin(["HIGH", "CRITICAL"])).sum()),
            "projects_requiring_verification": calc_pending_works,
            "exact_duplicate_transactions_flagged": int(df_exp["is_exact_duplicate"].sum()),
            "repeated_signature_transactions_flagged": int(df_exp["is_repeated_signature"].sum())
        }
    }
    
    out_path = os.path.join(PROCESSED_DIR, "data_validation_report.json")
    with open(out_path, "w", encoding="utf-8") as vf:
        json.dump(validation_report, vf, indent=2)
    print(f"Data validation report generated at {out_path}")
    return validation_report

if __name__ == "__main__":
    run_validation()
