"""
Unit & Integration Tests for Backend API & Services
"""

import unittest
from backend.app.api.endpoints import (
    get_dashboard_summary,
    get_projects,
    get_high_risk_projects,
    get_project_detail,
    get_similar_projects,
    get_cost_anomalies,
    get_completion_anomalies,
    get_sector_anomalies,
    get_duplicate_anomalies,
    get_payment_anomalies,
    get_mps_list,
    get_state_analytics
)
from backend.app.services.ai_assistant import answer_officer_query

class TestAPIEndpoints(unittest.TestCase):
    
    def test_dashboard_summary(self):
        s = get_dashboard_summary()
        self.assertGreater(s.total_allocated, 0)
        self.assertGreater(s.total_expenditure, 0)
        self.assertGreater(s.total_projects, 0)
        self.assertIn("LOW", s.risk_distribution)
        self.assertIn("CRITICAL", s.risk_distribution)
        
    def test_projects_pagination_and_filtering(self):
        p = get_projects(page=1, page_size=10, risk_level="All")
        self.assertGreater(p.total, 100000)
        self.assertEqual(len(p.items), 10)
        
    def test_high_risk_projects(self):
        high_risk = get_high_risk_projects(limit=5)
        self.assertGreaterEqual(len(high_risk), 1)
        for item in high_risk:
            self.assertGreaterEqual(item.risk_score, 30)
            
    def test_similar_projects_lookup(self):
        p = get_projects(page=1, page_size=1)
        first_id = p.items[0].project_id
        sim = get_similar_projects(first_id, limit=3)
        self.assertIsNotNone(sim["current_project"])
        self.assertIsNotNone(sim["benchmark"])

    def test_cost_anomalies_data_integrity(self):
        costs = get_cost_anomalies(limit=10)
        self.assertGreater(len(costs), 0)
        for c in costs:
            self.assertGreater(c["recommended_amount"], 0)
            self.assertGreater(c["final_amount"], 0)
            self.assertGreater(c["cost_deviation_pct"], 25.0)

    def test_completion_anomalies_verification_queue(self):
        comps = get_completion_anomalies(limit=10)
        self.assertGreater(len(comps), 0)
        for c in comps:
            self.assertGreater(c["recommended_amount"], 0)
            self.assertEqual(c["completion_status"], "COMPLETION_VERIFICATION_REQUIRED")
            self.assertIsNotNone(c["reason"])
            self.assertIsNotNone(c["review_action"])
            self.assertIsNotNone(c["linkage_status"])

    def test_sector_anomalies_peer_deviation(self):
        sectors = get_sector_anomalies(limit=10)
        self.assertGreater(len(sectors), 0)
        for s in sectors:
            self.assertGreater(s["recommended_amount"], 0)
            self.assertGreater(s["category_median_amount"], 0)
            self.assertGreater(s["category_cost_deviation_pct"], 50.0)
            self.assertGreater(s["comparable_works_count"], 0)
            self.assertIsNotNone(s["reason"])
            self.assertIsNotNone(s["review_action"])

    def test_duplicate_anomalies_data_integrity(self):
        dups = get_duplicate_anomalies(limit=10)
        self.assertGreater(len(dups), 0)
        for d in dups:
            self.assertGreaterEqual(d["repeat_count"], 2)
            self.assertGreater(d["total_amount"], 0)
            self.assertIsNotNone(d["vendor"])
            self.assertIsNotNone(d["expenditure_date"])

    def test_payment_density_burst_anomalies(self):
        bursts = get_payment_anomalies(limit=10)
        self.assertGreater(len(bursts), 0)
        for b in bursts:
            self.assertGreaterEqual(b["voucher_count"], 4)
            self.assertGreater(b["total_cluster_amount"], 0)
            self.assertGreaterEqual(b["span_days"], 1)
            self.assertGreater(b["density_ratio"], 1.0)
            self.assertIsNotNone(b["start_date"])
            self.assertIsNotNone(b["end_date"])
            self.assertGreater(len(b["sample_vouchers"]), 0)
            self.assertEqual(b["pattern_indicator"], "High Payment Burst Density")
        
    def test_ai_assistant_grounded_response(self):
        res = answer_officer_query("Show me the 10 highest-risk projects")
        self.assertTrue("prioritized projects" in res["answer"].lower() or "project" in res["answer"].lower())
        self.assertGreater(len(res["grounding_data"]), 0)
        
    def test_ai_assistant_unknown_query(self):
        res = answer_officer_query("What is the weather on Mars?")
        self.assertIn("I don't have sufficient data", res["answer"])

if __name__ == "__main__":
    unittest.main()
