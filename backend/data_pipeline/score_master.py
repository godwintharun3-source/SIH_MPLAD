"""
Batch Risk Scoring Pipeline
Applies the Isolation Forest and Explainable Risk Engine across all master projects.
Outputs scored_projects.csv for high-performance database indexing and API serving.
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml_models.predict import predict_anomalies
from backend.app.services.risk_scoring import compute_project_risk

PROCESSED_DIR = os.path.abspath(os.path.join(ROOT_DIR, "data/processed"))

def run_scoring():
    print("Starting Batch Project Risk Scoring...")
    t0 = datetime.now()
    
    in_path = os.path.join(PROCESSED_DIR, "enriched_projects.csv")
    df = pd.read_csv(in_path, low_memory=False)
    
    # 1. Run ML predictions
    print(f"Running Isolation Forest inference on {len(df):,} records...")
    ml_scores, is_ml = predict_anomalies(df)
    df["ml_anomaly_score"] = ml_scores
    df["is_ml_anomaly"] = is_ml
    
    # 2. Run Explainable Risk Engine
    print("Computing explainable risk scores and reason codes...")
    records = df.to_dict("records")
    
    risk_scores = []
    risk_levels = []
    primary_reasons = []
    all_reasons_json = []
    breakdowns_json = []
    advisories_json = []
    
    for r in records:
        eval_res = compute_project_risk(
            row=r,
            ml_anomaly_score=r["ml_anomaly_score"],
            is_ml_anomaly=r["is_ml_anomaly"]
        )
        risk_scores.append(eval_res["risk_score"])
        risk_levels.append(eval_res["risk_level"])
        primary_reasons.append(eval_res["primary_reason"])
        all_reasons_json.append(json.dumps(eval_res["reasons"]))
        breakdowns_json.append(json.dumps(eval_res["point_breakdown"]))
        advisories_json.append(json.dumps(eval_res["advisory_actions"]))
        
    df["risk_score"] = risk_scores
    df["risk_level"] = risk_levels
    df["primary_reason"] = primary_reasons
    df["reasons_json"] = all_reasons_json
    df["point_breakdown_json"] = breakdowns_json
    df["advisory_actions_json"] = advisories_json
    
    out_path = os.path.join(PROCESSED_DIR, "scored_projects.csv")
    df.to_csv(out_path, index=False)
    
    duration = (datetime.now() - t0).total_seconds()
    level_counts = df["risk_level"].value_counts().to_dict()
    print(f"Risk scoring completed in {duration:.2f}s! Saved {len(df):,} scored projects to {out_path}")
    print(f"Risk Distribution: {level_counts}")
    return df

if __name__ == "__main__":
    run_scoring()
