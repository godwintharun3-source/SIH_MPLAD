"""
Unit Tests for Data Cleaning & Normalization
"""

import unittest
import pandas as pd
import numpy as np

class TestDataCleaning(unittest.TestCase):
    
    def test_amount_cleaning(self):
        vals = ["1000", "50000.50", "invalid", "", None, "-500"]
        cleaned = pd.to_numeric(pd.Series(vals), errors="coerce").fillna(0.0)
        self.assertEqual(cleaned[0], 1000.0)
        self.assertEqual(cleaned[1], 50000.5)
        self.assertEqual(cleaned[2], 0.0)
        self.assertEqual(cleaned[3], 0.0)
        self.assertEqual(cleaned[4], 0.0)
        self.assertEqual(cleaned[5], -500.0)
        
    def test_whitespace_normalization(self):
        text = "  Shri   Arun   Kumar  Sagar  "
        cleaned = " ".join(text.split())
        self.assertEqual(cleaned, "Shri Arun Kumar Sagar")
        
    def test_zero_amount_percentage_safety(self):
        rec = 0.0
        final = 50000.0
        if rec > 0:
            pct = ((final - rec) / rec) * 100.0
        else:
            pct = 0.0
        self.assertEqual(pct, 0.0)

if __name__ == "__main__":
    unittest.main()
