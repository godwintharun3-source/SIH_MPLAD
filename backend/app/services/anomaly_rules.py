"""
Rule-Based Anomaly Evaluation Service
Evaluates explainable risk indicators across cost, timeline, payments, duplicates, and category benchmarks.
"""

from typing import Dict, Any, List

DEFAULT_WEIGHTS = {
    "cost_anomaly_max": 30,
    "completion_concern_max": 25,
    "payment_anomaly_max": 20,
    "duplicate_concern_max": 15,
    "similarity_anomaly_max": 10
}

def evaluate_cost_risk(rec_amt: float, fin_amt: float, cost_dev_pct: float, max_pts: int = 30) -> Dict[str, Any]:
    points = 0
    reasons = []
    
    if fin_amt > 0 and rec_amt > 0:
        if cost_dev_pct >= 100.0:
            points = max_pts
            reasons.append(f"Final amount (₹{fin_amt:,.0f}) is {cost_dev_pct:.1f}% above recommended amount (₹{rec_amt:,.0f}) — High Cost Deviation")
        elif cost_dev_pct >= 50.0:
            points = int(max_pts * 0.75)
            reasons.append(f"Final amount is {cost_dev_pct:.1f}% above recommended amount — Significant Cost Deviation")
        elif cost_dev_pct >= 25.0:
            points = int(max_pts * 0.50)
            reasons.append(f"Final amount is {cost_dev_pct:.1f}% above recommended amount — Moderate Cost Deviation")
        elif cost_dev_pct <= -50.0:
            points = int(max_pts * 0.30)
            reasons.append(f"Final amount is {abs(cost_dev_pct):.1f}% below recommended budget — Substantial Expenditure Underspend")
            
    return {
        "factor": "cost_anomaly",
        "points": min(points, max_pts),
        "max_points": max_pts,
        "reasons": reasons
    }

def evaluate_completion_risk(status: str, delay_status: str, duration_days: int, max_pts: int = 25) -> Dict[str, Any]:
    points = 0
    reasons = []
    
    if status == "COMPLETION_VERIFICATION_REQUIRED":
        points = int(max_pts * 0.75)
        reasons.append("Project completion status requires verification (no matching completed record in published registry)")
    elif status == "COMPLETED":
        if delay_status == "SEVERELY_DELAYED" or duration_days > 730:
            points = max_pts
            reasons.append(f"Project duration spans {duration_days} days (>2 years from recommendation) — Severely Delayed")
        elif delay_status == "DELAYED" or duration_days > 365:
            points = int(max_pts * 0.60)
            reasons.append(f"Project duration spans {duration_days} days (>1 year from recommendation) — Delayed")
            
    return {
        "factor": "completion_concern",
        "points": min(points, max_pts),
        "max_points": max_pts,
        "reasons": reasons
    }

def evaluate_payment_risk(tx_count: int, tx_total: float, rec_amt: float, fin_amt: float, max_pts: int = 20) -> Dict[str, Any]:
    points = 0
    reasons = []
    
    benchmark_amt = max(rec_amt, fin_amt)
    if tx_total > 0 and benchmark_amt > 0:
        if tx_total > (1.3 * benchmark_amt):
            points += int(max_pts * 0.70)
            reasons.append(f"Linked expenditure payments (₹{tx_total:,.0f}) exceed benchmark project budget (₹{benchmark_amt:,.0f}) by {((tx_total/benchmark_amt)-1)*100:.1f}%")
        elif tx_total > (1.1 * benchmark_amt):
            points += int(max_pts * 0.40)
            reasons.append(f"Linked expenditure payments slightly exceed allocated project budget")
            
    if tx_count > 12:
        points += int(max_pts * 0.35)
        reasons.append(f"Unusually high transaction frequency ({tx_count} payment vouchers linked to single work)")
        
    return {
        "factor": "payment_anomaly",
        "points": min(points, max_pts),
        "max_points": max_pts,
        "reasons": reasons
    }

def evaluate_duplicate_risk(exact_dup_cnt: int, repeat_sig_cnt: int, max_pts: int = 15) -> Dict[str, Any]:
    points = 0
    reasons = []
    
    if exact_dup_cnt > 0:
        points += int(max_pts * 0.80)
        reasons.append(f"Contains {exact_dup_cnt} exact duplicate expenditure record(s) with identical amount, vendor, and date")
        
    if repeat_sig_cnt > 1:
        points += int(max_pts * 0.40)
        reasons.append(f"Detected {repeat_sig_cnt} repeated payment signatures to same vendor for identical amount")
        
    return {
        "factor": "duplicate_concern",
        "points": min(points, max_pts),
        "max_points": max_pts,
        "reasons": reasons
    }

def evaluate_similarity_risk(rec_amt: float, cat_median: float, cat_dev_pct: float, max_pts: int = 10) -> Dict[str, Any]:
    points = 0
    reasons = []
    
    if rec_amt > 0 and cat_median > 0:
        if cat_dev_pct >= 200.0:
            points = max_pts
            reasons.append(f"Recommended budget (₹{rec_amt:,.0f}) is +{cat_dev_pct:.1f}% above sector median (₹{cat_median:,.0f}) for similar projects")
        elif cat_dev_pct >= 100.0:
            points = int(max_pts * 0.60)
            reasons.append(f"Recommended budget is +{cat_dev_pct:.1f}% higher than median cost of similar category works")
            
    return {
        "factor": "similarity_anomaly",
        "points": min(points, max_pts),
        "max_points": max_pts,
        "reasons": reasons
    }
