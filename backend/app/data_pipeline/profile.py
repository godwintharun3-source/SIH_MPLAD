"""
Data Profiling Module for MPLAD AI Risk & Anomaly Intelligence System
Inspects raw datasets, analyzes schema, nulls, duplicates, candidate keys, distributions,
and outputs data/profiling/profiling_report.json and DATA_DICTIONARY.md.
"""

from backend.data_pipeline.profile import run_profiling, profile_dataset

if __name__ == "__main__":
    run_profiling()
