"""
Machine Learning Training Pipeline for MPLAD Anomaly Intelligence System
Trains an unsupervised Isolation Forest on engineered numerical project features (no label leakage).
Saves model artifacts and metadata to ml_models/.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/processed"))
MODELS_DIR = os.path.abspath(os.path.dirname(__file__))

FEATURE_COLS = [
    "recommended_amount",
    "final_amount",
    "cost_deviation_pct",
    "category_cost_deviation_pct",
    "project_duration_days",
    "has_images_numeric",
    "match_confidence",
    "tx_count",
    "tx_total_amount",
    "tx_exact_duplicate_count",
    "tx_repeated_signature_count"
]

def train():
    print("Training Isolation Forest Anomaly Model...")
    t0 = datetime.now()
    
    data_path = os.path.join(PROCESSED_DIR, "enriched_projects.csv")
    df = pd.read_csv(data_path, low_memory=False)
    
    # Preprocess features
    df_feat = df.copy()
    df_feat["has_images_numeric"] = df_feat["has_images"].astype(int)
    
    # Handle infinite or extreme values
    for col in ["cost_deviation_pct", "category_cost_deviation_pct"]:
        df_feat[col] = df_feat[col].replace([np.inf, -np.inf], np.nan).fillna(0.0)
        # Clip extreme outliers for numerical stability
        df_feat[col] = df_feat[col].clip(-100.0, 1000.0)
        
    X = df_feat[FEATURE_COLS].fillna(0.0).values
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train Isolation Forest
    iso = IsolationForest(
        n_estimators=120,
        max_samples="auto",
        contamination=0.06, # ~6% potential anomaly baseline
        random_state=42,
        n_jobs=-1
    )
    iso.fit(X_scaled)
    
    # Compute decision function scores
    scores = iso.decision_function(X_scaled)
    predictions = iso.predict(X_scaled) # -1 for anomaly, 1 for normal
    
    # Save artifacts
    model_path = os.path.join(MODELS_DIR, "isolation_forest_v1.joblib")
    scaler_path = os.path.join(MODELS_DIR, "scaler_v1.joblib")
    joblib.dump(iso, model_path)
    joblib.dump(scaler, scaler_path)
    
    anomaly_count = int((predictions == -1).sum())
    
    metadata = {
        "model_type": "IsolationForest",
        "version": "1.0.0",
        "training_timestamp": datetime.now().isoformat(),
        "total_training_records": len(df),
        "features": FEATURE_COLS,
        "parameters": {
            "n_estimators": 120,
            "contamination": 0.06,
            "random_state": 42
        },
        "anomalies_detected": anomaly_count,
        "anomaly_rate_pct": round((anomaly_count / len(df)) * 100, 2),
        "score_min": float(scores.min()),
        "score_max": float(scores.max()),
        "score_mean": float(scores.mean()),
        "training_duration_seconds": round((datetime.now() - t0).total_seconds(), 2)
    }
    
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as mf:
        json.dump(metadata, mf, indent=2)
        
    print(f"Model saved to {model_path} with metadata in {meta_path}")
    print(f"Detected {anomaly_count:,} statistical anomalies ({metadata['anomaly_rate_pct']}%) in {metadata['training_duration_seconds']}s.")
    return metadata

if __name__ == "__main__":
    train()
