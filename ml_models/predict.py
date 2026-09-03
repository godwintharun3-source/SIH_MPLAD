"""
Inference Module for Isolation Forest Anomaly Detection
Loads trained model and scaler to generate anomaly scores and binary flags.
"""

import os
import joblib
import numpy as np
import pandas as pd

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

_model = None
_scaler = None

def load_model():
    global _model, _scaler
    if _model is None or _scaler is None:
        model_path = os.path.join(MODELS_DIR, "isolation_forest_v1.joblib")
        scaler_path = os.path.join(MODELS_DIR, "scaler_v1.joblib")
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            _model = joblib.load(model_path)
            _scaler = joblib.load(scaler_path)
    return _model, _scaler

def predict_anomalies(df):
    model, scaler = load_model()
    if model is None or scaler is None:
        # Fallback if model not yet trained
        return np.zeros(len(df)), np.zeros(len(df), dtype=bool)
        
    df_feat = df.copy()
    if "has_images_numeric" not in df_feat.columns:
        df_feat["has_images_numeric"] = df_feat["has_images"].astype(int) if "has_images" in df_feat.columns else 0
        
    for col in ["cost_deviation_pct", "category_cost_deviation_pct"]:
        if col in df_feat.columns:
            df_feat[col] = df_feat[col].replace([np.inf, -np.inf], np.nan).fillna(0.0).clip(-100.0, 1000.0)
        else:
            df_feat[col] = 0.0
            
    for col in FEATURE_COLS:
        if col not in df_feat.columns:
            df_feat[col] = 0.0
            
    X = df_feat[FEATURE_COLS].fillna(0.0).values
    X_scaled = scaler.transform(X)
    
    # decision_function gives lower values for more anomalous instances
    raw_scores = model.decision_function(X_scaled)
    # Convert to 0-100 anomaly intensity (lower raw score -> higher anomaly intensity)
    # Raw scores typically range from -0.3 (highly anomalous) to +0.2 (very normal)
    anomaly_intensity = np.clip(np.round((0.2 - raw_scores) / 0.5 * 100.0, 1), 0.0, 100.0)
    is_anomaly = model.predict(X_scaled) == -1
    
    return anomaly_intensity, is_anomaly
