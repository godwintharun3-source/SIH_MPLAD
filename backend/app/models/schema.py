"""
SQLAlchemy ORM Models with High-Performance Indices for Fast Analytics
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text, Index
from backend.app.database import Base

class ProjectModel(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(64), index=True, nullable=False)
    work_id = Column(Integer, index=True, nullable=True)
    work_description = Column(Text, nullable=False)
    category = Column(String(128), index=True, default="Normal/Others")
    mp_name = Column(String(256), index=True, nullable=False)
    constituency = Column(String(256), index=True, nullable=False)
    state = Column(String(128), index=True, nullable=False)
    district = Column(String(256), index=True, nullable=False)
    house = Column(String(64), default="Lok Sabha")
    ida = Column(String(256))
    recommended_amount = Column(Float, default=0.0)
    recommendation_date = Column(String(32), nullable=True)
    has_images = Column(Boolean, default=False)
    completion_status = Column(String(64), index=True, default="COMPLETION_VERIFICATION_REQUIRED")
    final_amount = Column(Float, default=0.0)
    completed_date = Column(String(32), nullable=True)
    average_rating = Column(Float, nullable=True)
    match_method = Column(String(64), default="UNMATCHED")
    match_confidence = Column(Float, default=0.0)
    record_source = Column(String(64), default="RECOMMENDED_MASTER")
    
    # Linked expenditure metrics
    tx_count = Column(Integer, default=0)
    tx_total_amount = Column(Float, default=0.0)
    tx_max_single_amount = Column(Float, default=0.0)
    tx_exact_duplicate_count = Column(Integer, default=0)
    tx_repeated_signature_count = Column(Integer, default=0)
    
    # Cost & comparable metrics
    cost_deviation_amount = Column(Float, default=0.0)
    cost_deviation_pct = Column(Float, default=0.0)
    category_median_amount = Column(Float, default=0.0)
    category_cost_deviation_pct = Column(Float, default=0.0)
    project_duration_days = Column(Integer, default=0)
    delay_status = Column(String(64), default="NORMAL")
    
    # ML & Risk Engine
    ml_anomaly_score = Column(Float, default=0.0)
    is_ml_anomaly = Column(Boolean, default=False)
    risk_score = Column(Integer, index=True, default=0)
    risk_level = Column(String(32), index=True, default="LOW")
    primary_reason = Column(Text)
    reasons_json = Column(Text)
    point_breakdown_json = Column(Text)
    advisory_actions_json = Column(Text)

    __table_args__ = (
        Index("idx_state_risk", "state", "risk_level"),
        Index("idx_constituency_risk", "constituency", "risk_level"),
        Index("idx_mp_risk", "mp_name", "risk_level"),
        Index("idx_category_risk", "category", "risk_level"),
        Index("idx_score_desc", "risk_score"),
    )

class ExpenditureModel(Base):
    __tablename__ = "expenditures"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String(64), index=True, nullable=False)
    mp_name = Column(String(256), index=True, nullable=False)
    constituency = Column(String(256), index=True, nullable=False)
    state = Column(String(128), index=True, nullable=False)
    house = Column(String(64), default="Lok Sabha")
    work_description = Column(Text, nullable=False)
    vendor = Column(String(256), index=True, nullable=False)
    ida = Column(String(256))
    expenditure_amount = Column(Float, default=0.0)
    expenditure_date = Column(String(32), index=True, nullable=True)
    payment_status = Column(String(64), default="Payment In-Progress")
    is_exact_duplicate = Column(Boolean, index=True, default=False)
    is_repeated_signature = Column(Boolean, index=True, default=False)
    sig_repeat_count = Column(Integer, default=1)
    matched_project_id = Column(String(64), index=True, nullable=True)
    match_confidence = Column(Float, default=0.0)

    __table_args__ = (
        Index("idx_exp_vendor_amount", "vendor", "expenditure_amount"),
        Index("idx_exp_mp_date", "mp_name", "expenditure_date"),
    )

class MPSummaryModel(Base):
    __tablename__ = "mp_summaries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    mp_name = Column(String(256), index=True, nullable=False)
    constituency = Column(String(256), index=True, nullable=False)
    state = Column(String(128), index=True, nullable=False)
    house = Column(String(64), default="Lok Sabha")
    allocated_amount = Column(Float, default=0.0)
    total_expenditure = Column(Float, default=0.0)
    utilization_pct = Column(Float, default=0.0)
    completed_works = Column(Integer, default=0)
    recommended_works = Column(Integer, default=0)
    completion_rate_pct = Column(Float, default=0.0)
    unspent_amount = Column(Float, default=0.0)
    transaction_count = Column(Integer, default=0)
    successful_payments = Column(Integer, default=0)
    pending_payments = Column(Integer, default=0)
    average_rating = Column(Float, nullable=True)
    avg_risk_score = Column(Float, default=0.0)
    high_risk_projects_count = Column(Integer, default=0)
