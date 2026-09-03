"""
Pydantic Schemas for Request & Response Serialization
"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class ProjectSummary(BaseModel):
    project_id: str
    work_id: Optional[int] = None
    work_description: str
    category: str
    mp_name: str
    constituency: str
    state: str
    district: str
    house: Optional[str] = "Lok Sabha"
    recommended_amount: float
    final_amount: float
    recommendation_date: Optional[str] = None
    completed_date: Optional[str] = None
    completion_status: str
    cost_deviation_pct: float
    risk_score: int
    risk_level: str
    primary_reason: Optional[str] = None
    has_images: bool = False
    match_method: Optional[str] = None

class ProjectDetail(ProjectSummary):
    ida: Optional[str] = None
    average_rating: Optional[float] = None
    match_confidence: float = 0.0
    record_source: Optional[str] = None
    tx_count: int = 0
    tx_total_amount: float = 0.0
    tx_max_single_amount: float = 0.0
    tx_exact_duplicate_count: int = 0
    tx_repeated_signature_count: int = 0
    cost_deviation_amount: float = 0.0
    category_median_amount: float = 0.0
    category_cost_deviation_pct: float = 0.0
    project_duration_days: int = 0
    delay_status: str = "NORMAL"
    ml_anomaly_score: float = 0.0
    is_ml_anomaly: bool = False
    reasons: List[str] = []
    point_breakdown: Dict[str, Any] = {}
    advisory_actions: List[str] = []

class ProjectListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[ProjectSummary]

class TransactionItem(BaseModel):
    transaction_id: str
    mp_name: str
    constituency: str
    state: str
    work_description: str
    vendor: str
    ida: Optional[str] = None
    expenditure_amount: float
    expenditure_date: Optional[str] = None
    payment_status: str
    is_exact_duplicate: bool = False
    is_repeated_signature: bool = False
    sig_repeat_count: int = 1
    matched_project_id: Optional[Union[str, int, float]] = None

class DashboardSummary(BaseModel):
    total_allocated: float
    total_expenditure: float
    utilization_percentage: float
    total_mps: int
    total_projects: int
    completed_projects: int
    projects_requiring_verification: int
    completion_rate_percentage: float
    total_transactions: int
    risk_distribution: Dict[str, int]
    top_states_by_expenditure: List[Dict[str, Any]]
    top_categories_by_budget: List[Dict[str, Any]]
    top_high_risk_constituencies: List[Dict[str, Any]]
    data_timestamp: str

class AIQueryRequest(BaseModel):
    query: str
    context_project_id: Optional[str] = None

class AIQueryResponse(BaseModel):
    query: str
    answer: str
    grounding_data: List[Dict[str, Any]] = []
    cited_project_ids: List[str] = []
    timestamp: str

class RiskWeightsRequest(BaseModel):
    cost_anomaly_max: Optional[int] = 30
    completion_concern_max: Optional[int] = 25
    payment_anomaly_max: Optional[int] = 20
    duplicate_concern_max: Optional[int] = 15
    similarity_anomaly_max: Optional[int] = 10
