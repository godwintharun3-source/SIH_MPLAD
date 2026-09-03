"""
Explainable Risk Engine for MPLAD Scheme Monitoring
Computes composite risk score (0-100), risk level, plain-English reasons,
and granular factor point contributions for complete transparency.
"""

from typing import Dict, Any, List, Optional
from backend.app.services.anomaly_rules import (
    evaluate_cost_risk,
    evaluate_completion_risk,
    evaluate_payment_risk,
    evaluate_duplicate_risk,
    evaluate_similarity_risk,
    DEFAULT_WEIGHTS
)

def compute_project_risk(
    row: Dict[str, Any],
    weights: Optional[Dict[str, int]] = None,
    ml_anomaly_score: float = 0.0,
    is_ml_anomaly: bool = False
) -> Dict[str, Any]:
    w = weights if weights is not None else DEFAULT_WEIGHTS
    
    rec_amt = float(row.get("recommended_amount", 0.0))
    fin_amt = float(row.get("final_amount", 0.0))
    cost_dev_pct = float(row.get("cost_deviation_pct", 0.0))
    status = str(row.get("completion_status", "COMPLETION_VERIFICATION_REQUIRED"))
    delay_status = str(row.get("delay_status", "NORMAL"))
    duration_days = int(row.get("project_duration_days", 0))
    tx_count = int(row.get("tx_count", 0))
    tx_total = float(row.get("tx_total_amount", 0.0))
    exact_dup = int(row.get("tx_exact_duplicate_count", 0))
    repeat_sig = int(row.get("tx_repeated_signature_count", 0))
    cat_median = float(row.get("category_median_amount", 0.0))
    cat_dev_pct = float(row.get("category_cost_deviation_pct", 0.0))
    
    # 1. Rule Evaluations
    cost_eval = evaluate_cost_risk(rec_amt, fin_amt, cost_dev_pct, w.get("cost_anomaly_max", 30))
    comp_eval = evaluate_completion_risk(status, delay_status, duration_days, w.get("completion_concern_max", 25))
    pay_eval = evaluate_payment_risk(tx_count, tx_total, rec_amt, fin_amt, w.get("payment_anomaly_max", 20))
    dup_eval = evaluate_duplicate_risk(exact_dup, repeat_sig, w.get("duplicate_concern_max", 15))
    sim_eval = evaluate_similarity_risk(rec_amt, cat_median, cat_dev_pct, w.get("similarity_anomaly_max", 10))
    
    # Sum rule points
    base_points = (
        cost_eval["points"] +
        comp_eval["points"] +
        pay_eval["points"] +
        dup_eval["points"] +
        sim_eval["points"]
    )
    
    # ML Model confirmation boost
    ml_boost = 0
    ml_reasons = []
    if is_ml_anomaly:
        ml_boost = 8
        ml_reasons.append("Unsupervised Isolation Forest algorithm flagged high multi-dimensional anomaly intensity across financial and execution vectors")
        
    total_score = min(100, base_points + ml_boost)
    
    # Risk Level Categorization
    if total_score >= 81:
        risk_level = "CRITICAL"
        risk_color = "#dc2626" # red
    elif total_score >= 61:
        risk_level = "HIGH"
        risk_color = "#ea580c" # orange
    elif total_score >= 31:
        risk_level = "MEDIUM"
        risk_color = "#ca8a04" # yellow
    else:
        risk_level = "LOW"
        risk_color = "#16a34a" # green
        
    all_reasons = (
        cost_eval["reasons"] +
        comp_eval["reasons"] +
        pay_eval["reasons"] +
        dup_eval["reasons"] +
        sim_eval["reasons"] +
        ml_reasons
    )
    
    if len(all_reasons) == 0:
        all_reasons.append("Parameters align within standard operating ranges across all monitored indicators.")
        
    primary_reason = all_reasons[0]
    
    # Advisory human review action
    advisory_actions = []
    if cost_eval["points"] > 0:
        advisory_actions.append("Review detailed measurement book (MB) and revised sanction approvals for cost escalation rationale.")
    if comp_eval["points"] > 0:
        advisory_actions.append("Verify physical completion status and asset commissioning certificate from District Implementing Authority.")
    if dup_eval["points"] > 0:
        advisory_actions.append("Audit payment vouchers and vendor bank transaction references for potential duplicate payment submission.")
    if pay_eval["points"] > 0:
        advisory_actions.append("Cross-examine total disbursed expenditure against administrative sanction ceiling.")
    if sim_eval["points"] > 0:
        advisory_actions.append("Compare technical specifications and schedule of rates (SoR) with typical district works.")
    if len(advisory_actions) == 0:
        advisory_actions.append("Routine periodic monitoring; no immediate escalation required.")
        
    return {
        "risk_score": total_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "primary_reason": primary_reason,
        "reasons": all_reasons,
        "point_breakdown": {
            "cost_anomaly": cost_eval["points"],
            "completion_concern": comp_eval["points"],
            "payment_anomaly": pay_eval["points"],
            "duplicate_concern": dup_eval["points"],
            "similarity_anomaly": sim_eval["points"],
            "ml_anomaly_boost": ml_boost
        },
        "max_weights": w,
        "ml_anomaly_score": round(float(ml_anomaly_score), 2),
        "is_ml_anomaly": bool(is_ml_anomaly),
        "advisory_actions": advisory_actions
    }
