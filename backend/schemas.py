from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class HoldingItem(BaseModel):
    ticker: str = Field(..., description="NSE Ticker symbol e.g., RELIANCE.NS")
    raw_ticker: Optional[str] = None
    quantity: float = Field(..., gt=0)
    purchase_price: float = Field(..., ge=0)
    current_price: Optional[float] = 0.0
    current_value_inr: Optional[float] = 0.0
    weight_pct: Optional[float] = 0.0
    sector: Optional[str] = "Other"
    unrealized_pnl_inr: Optional[float] = 0.0
    unrealized_pnl_pct: Optional[float] = 0.0

class PortfolioParseRequest(BaseModel):
    holdings: List[Dict[str, Any]]

class PortfolioDiagnostics(BaseModel):
    total_value_inr: float
    total_invested_inr: float
    total_pnl_inr: float
    total_pnl_pct: float
    health_score: float  # 1 to 100
    hhi_index: float     # Herfindahl-Hirschman Index sum(w_i^2)
    hhi_status: str      # Low, Moderate, High Concentration
    sortino_ratio: float
    calmar_ratio: float
    value_at_risk_95_pct: float  # VaR (95%)
    cvar_95_pct: float           # CVaR (95%)
    max_drawdown_pct: float
    sector_breakdown: Dict[str, float]
    holdings_normalized: List[HoldingItem]
    top_concentrations: List[Dict[str, Any]]
    correlation_matrix: Dict[str, Dict[str, float]]

class MacroPulseResponse(BaseModel):
    threat_score: float  # 0 to 100
    active_regime: str
    regime_description: str
    brent_crude_usd: float
    brent_crude_change_pct: float
    usd_inr: float
    usd_inr_change_pct: float
    india_vix: float
    india_vix_change_pct: float
    fii_net_flow_cr: float  # In Crore INR
    dii_net_flow_cr: float  # In Crore INR
    rbi_repo_rate: float    # Percentage (e.g. 6.5)
    gdelt_tension_index: float
    dxy_index: float
    threat_factors: List[Dict[str, Any]]
    updated_at: str

class RecommendationRequest(BaseModel):
    holdings: Optional[List[Dict[str, Any]]] = []
    available_capital_inr: float = Field(100000.0, ge=1000)
    risk_profile: str = Field("Moderate", description="Conservative, Moderate, or Aggressive")
    count: Optional[int] = Field(None, description="Optional override recommendation count")

class RecommendationCard(BaseModel):
    id: int
    ticker: str
    instrument_name: str
    category: str  # Category A, B, C, D
    category_name: str
    category_badge_color: str
    allocation_inr: float
    allocation_pct: float
    suggested_quantity: int
    sharpe_uplift: float
    hrp_risk_reduction_pct: float
    technical_momentum_signal: str # e.g., "EMA Bullish Cross (RSI 58)"
    quantitative_rationale: str
    macro_rationale: str
    expected_return_pct: float

class RecommendationResponse(BaseModel):
    total_capital_inr: float
    risk_profile: str
    recommendation_count: int
    recommendations: List[RecommendationCard]
    portfolio_health_before: float
    portfolio_health_after: float
    category_summary: Dict[str, float]
    optimization_method: str = "Hierarchical Risk Parity (HRP) + Black-Litterman World Monitor Macro Tilt"

class StressTestRequest(BaseModel):
    crude_oil_spike_pct: float = 0.0    # e.g. +20%
    usd_inr_depreciation_pct: float = 0.0 # e.g. +5%
    fii_outflow_spike_cr: float = 0.0    # e.g. -5000 Cr
    vix_spike_pct: float = 0.0          # e.g. +30%
    holdings: List[Dict[str, Any]] = []

class StressTestResponse(BaseModel):
    simulated_threat_score: float
    simulated_regime: str
    estimated_portfolio_impact_pct: float
    high_vulnerability_sectors: List[str]
    defensive_recommendations: List[str]

class BrokerExecuteRequest(BaseModel):
    broker_name: str = Field("Zerodha Kite", description="Zerodha Kite, Angel One, or Upstox")
    api_key: Optional[str] = None
    access_token: Optional[str] = None
    orders: List[Dict[str, Any]]

class BrokerExecuteResponse(BaseModel):
    status: str
    broker_name: str
    executed_count: int
    total_executed_value_inr: float
    orders_summary: List[Dict[str, Any]]
    timestamp: str
