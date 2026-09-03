"""
Unit Tests for Explainable Risk Engine & Anomaly Rules
"""

import unittest
from backend.app.services.anomaly_rules import (
    evaluate_cost_risk,
    evaluate_completion_risk,
    evaluate_duplicate_risk,
    evaluate_similarity_risk
)
from backend.app.services.risk_scoring import compute_project_risk

class TestRiskScoring(unittest.TestCase):
    
    def test_cost_deviation_high_risk(self):
        # 100% cost deviation should yield maximum cost points (30)
        res = evaluate_cost_risk(rec_amt=500000.0, fin_amt=1000000.0, cost_dev_pct=100.0)
        self.assertEqual(res["points"], 30)
        self.assertTrue(len(res["reasons"]) > 0)
        
    def test_cost_deviation_normal(self):
        res = evaluate_cost_risk(rec_amt=500000.0, fin_amt=500000.0, cost_dev_pct=0.0)
        self.assertEqual(res["points"], 0)
        self.assertEqual(len(res["reasons"]), 0)
        
    def test_completion_verification_status(self):
        res = evaluate_completion_risk(status="COMPLETION_VERIFICATION_REQUIRED", delay_status="NORMAL", duration_days=0)
        self.assertGreater(res["points"], 0)
        self.assertIn("requires verification", res["reasons"][0].lower())
        
    def test_duplicate_transaction_detection(self):
        res = evaluate_duplicate_risk(exact_dup_cnt=3, repeat_sig_cnt=2)
        self.assertGreater(res["points"], 10)
        self.assertTrue(any("duplicate" in r.lower() for r in res["reasons"]))
        
    def test_risk_score_boundaries(self):
        # Normal project
        normal_row = {
            "recommended_amount": 500000.0,
            "final_amount": 500000.0,
            "cost_deviation_pct": 0.0,
            "completion_status": "COMPLETED",
            "delay_status": "NORMAL",
            "project_duration_days": 180,
            "tx_count": 2,
            "tx_total_amount": 500000.0,
            "tx_exact_duplicate_count": 0,
            "tx_repeated_signature_count": 0,
            "category_median_amount": 500000.0,
            "category_cost_deviation_pct": 0.0
        }
        res_normal = compute_project_risk(normal_row)
        self.assertEqual(res_normal["risk_score"], 0)
        self.assertEqual(res_normal["risk_level"], "LOW")
        
        # High risk project
        anomaly_row = {
            "recommended_amount": 500000.0,
            "final_amount": 1500000.0, # +200%
            "cost_deviation_pct": 200.0,
            "completion_status": "COMPLETION_VERIFICATION_REQUIRED",
            "delay_status": "SEVERELY_DELAYED",
            "project_duration_days": 800,
            "tx_count": 15,
            "tx_total_amount": 2000000.0,
            "tx_exact_duplicate_count": 4,
            "tx_repeated_signature_count": 5,
            "category_median_amount": 400000.0,
            "category_cost_deviation_pct": 25.0
        }
        res_anomaly = compute_project_risk(anomaly_row, is_ml_anomaly=True)
        self.assertGreaterEqual(res_anomaly["risk_score"], 70)
        self.assertIn(res_anomaly["risk_level"], ["HIGH", "CRITICAL"])
        self.assertTrue(len(res_anomaly["reasons"]) >= 3)
        self.assertTrue(len(res_anomaly["advisory_actions"]) >= 2)

if __name__ == "__main__":
    unittest.main()
