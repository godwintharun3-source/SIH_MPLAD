"""
Project Similarity & Comparable Benchmark Service
Finds comparable development works in the same category/state and calculates peer cost benchmarks.
"""

import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/processed"))

_projects_df = None

def get_projects_df():
    global _projects_df
    if _projects_df is None:
        p_path = os.path.join(PROCESSED_DIR, "enriched_projects.csv")
        if os.path.exists(p_path):
            _projects_df = pd.read_csv(p_path, low_memory=False)
        else:
            from backend.app.database import DB_PATH
            import sqlite3
            if os.path.exists(DB_PATH):
                conn = sqlite3.connect(DB_PATH)
                _projects_df = pd.read_sql("SELECT * FROM projects", conn)
                conn.close()
    return _projects_df

def find_similar_projects(project_id: str, limit: int = 5) -> Dict[str, Any]:
    df = get_projects_df()
    if df is None:
        return {"current_project": None, "similar_projects": [], "benchmark": None}
        
    target_match = df[df["project_id"].astype(str) == str(project_id)]
    if len(target_match) == 0:
        return {"current_project": None, "similar_projects": [], "benchmark": None}
        
    target = target_match.iloc[0]
    category = target["category"]
    state = target["state"]
    rec_amt = float(target["recommended_amount"])
    
    # 1. Filter same category
    same_cat = df[(df["category"] == category) & (df["project_id"].astype(str) != str(project_id)) & (df["recommended_amount"] > 0)].copy()
    
    if len(same_cat) == 0:
        # Fallback to all works
        same_cat = df[(df["project_id"].astype(str) != str(project_id)) & (df["recommended_amount"] > 0)].copy()
        
    # Same state preference
    same_cat["same_state"] = (same_cat["state"] == state).astype(int)
    
    # Compute budget proximity
    same_cat["amt_diff"] = np.abs(same_cat["recommended_amount"] - rec_amt)
    
    # Sort by same state first, then closest budget
    similar = same_cat.sort_values(by=["same_state", "amt_diff"], ascending=[False, True]).head(limit)
    
    sim_list = []
    for _, row in similar.iterrows():
        sim_amt = float(row["recommended_amount"])
        dev_from_target = round(((rec_amt - sim_amt) / sim_amt * 100.0), 1) if sim_amt > 0 else 0.0
        sim_list.append({
            "project_id": str(row["project_id"]),
            "work_description": str(row["work_description"]),
            "category": str(row["category"]),
            "state": str(row["state"]),
            "district": str(row["district"]),
            "constituency": str(row["constituency"]),
            "mp_name": str(row["mp_name"]),
            "recommended_amount": sim_amt,
            "final_amount": float(row["final_amount"]),
            "completion_status": str(row["completion_status"]),
            "deviation_pct": dev_from_target
        })
        
    # Benchmark stats across comparable cohort
    if len(sim_list) > 0:
        amounts = [p["recommended_amount"] for p in sim_list]
        peer_median = float(np.median(amounts))
        peer_mean = float(np.mean(amounts))
        peer_min = float(np.min(amounts))
        peer_max = float(np.max(amounts))
        dev_vs_median = round(((rec_amt - peer_median) / peer_median * 100.0), 1) if peer_median > 0 else 0.0
    else:
        peer_median = rec_amt
        peer_mean = rec_amt
        peer_min = rec_amt
        peer_max = rec_amt
        dev_vs_median = 0.0
        
    return {
        "current_project": {
            "project_id": str(target["project_id"]),
            "work_description": str(target["work_description"]),
            "category": str(category),
            "state": str(state),
            "recommended_amount": rec_amt,
            "final_amount": float(target["final_amount"])
        },
        "similar_projects": sim_list,
        "benchmark": {
            "peer_median_amount": peer_median,
            "peer_mean_amount": peer_mean,
            "peer_min_amount": peer_min,
            "peer_max_amount": peer_max,
            "current_vs_peer_median_pct": dev_vs_median
        }
    }
