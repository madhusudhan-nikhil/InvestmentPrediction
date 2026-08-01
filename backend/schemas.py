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
    unit_price: float = 0.0
    target_selling_price: float = 0.0
    profit_per_share_inr: float = 0.0
    total_expected_stock_profit_inr: float = 0.0
    allocation_inr: float
    allocation_pct: float
    suggested_quantity: int
    sharpe_uplift: float
    hrp_risk_reduction_pct: float
    technical_momentum_signal: str # e.g., "EMA Bullish Cross (RSI 58)"
    quantitative_rationale: str
    macro_rationale: str
    target_price_analytical_rationale: str = ""
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

class ProbableScenario(BaseModel):
    id: str
    title: str
    category: str  # e.g., "Energy Crisis", "Monetary Policy", "Geopolitical Tension"
    severity_badge: str  # "CRITICAL", "HIGH", "MODERATE"
    probability_pct: float  # e.g., 78.0
    summary: str
    trigger_factors: List[str]
    shocks: Dict[str, float]  # crude_oil_spike_pct, usd_inr_depreciation_pct, etc.
    estimated_impact_pct: float
    recommended_hedges: List[str]

class ProbableScenariosResponse(BaseModel):
    as_of: str
    total_scenarios: int
    world_monitor_summary: str
    scenarios: List[ProbableScenario]

class StressTestRequest(BaseModel):
    crude_oil_spike_pct: float = 0.0      # e.g. +20%
    usd_inr_depreciation_pct: float = 0.0   # e.g. +5%
    fii_outflow_spike_cr: float = 0.0      # e.g. -5000 Cr
    vix_spike_pct: float = 0.0            # e.g. +30%
    rbi_rate_hike_bps: float = 0.0         # e.g. +50 bps
    gdelt_escalation_pct: float = 0.0      # e.g. +40%
    dxy_rally_pct: float = 0.0             # e.g. +5%
    scenario_id: Optional[str] = None
    holdings: List[Dict[str, Any]] = []

class StressTestResponse(BaseModel):
    simulated_threat_score: float
    simulated_regime: str
    simulated_regime_label: str
    estimated_portfolio_impact_pct: float
    estimated_var_increase_pct: float
    high_vulnerability_sectors: List[str]
    resilient_sectors: List[str]
    defensive_recommendations: List[str]
    asset_class_impact_breakdown: Dict[str, float]
    scenario_narrative: str

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

class TickerItem(BaseModel):
    ticker: str
    name: str
    sector: str
    default_price: float = 500.0
    category: str = "Category A"
    category_name: Optional[str] = "Rebalance & Top-up"
    badge: Optional[str] = "emerald"
    base_weight: Optional[float] = 0.02
    exp_return: Optional[float] = 14.0
    sharpe: Optional[float] = 1.3
    risk_reduction_pct: Optional[float] = 7.0
    technical_signal: Optional[str] = "EMA 20 > EMA 50 Bullish Trend"

class TickerSaveRequest(BaseModel):
    tickers: List[TickerItem]

class TickerSyncResponse(BaseModel):
    status: str
    total_tickers: int
    synced_at: str
    tickers: List[TickerItem]

class TargetSellingPointRequest(BaseModel):
    capital_inr: float = Field(100000.0, ge=1000.0)
    target_profit_inr: float = Field(5000.0, ge=100.0)
    time_horizon_months: float = Field(1.0, ge=0.1, description="Time horizon in months e.g. 1.0, 3.0, 6.0, 12.0, 24.0")
    risk_profile: str = Field("Moderate", description="Conservative, Moderate, or Aggressive")

class TargetSellingPointCard(BaseModel):
    ticker: str
    instrument_name: str
    category: str
    category_name: str
    category_badge_color: str
    current_unit_price: float
    suggested_quantity: int
    total_allocated_inr: float
    allocation_pct: float
    target_selling_price: float
    profit_per_share_inr: float
    total_expected_profit_inr: float
    expected_gain_pct: float
    estimated_holding_days: int
    estimated_holding_months: float
    probable_exit_date: str
    target_difficulty_rating: str
    technical_momentum_signal: str
    macro_rationale: str

class TargetSellingPointResponse(BaseModel):
    capital_inr: float
    target_profit_inr: float
    time_horizon_months: float
    target_return_pct: float
    total_invested_inr: float
    total_expected_profit_inr: float
    strategy_regime_name: str
    portfolio_probable_exit_window: str
    recommendations: List[TargetSellingPointCard]

class HistoricalPricePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class HistoricalScenarioSim(BaseModel):
    scenario_name: str
    period_description: str
    entry_date: str
    entry_price: float
    target_selling_price: float
    target_hit_date: Optional[str] = None
    days_to_target: int
    target_status: str  # "TARGET_HIT", "IN_PROGRESS", "EXPIRED"
    max_price_reached: float
    max_gain_pct: float

class TickerHistoryResponse(BaseModel):
    ticker: str
    instrument_name: str
    period: str
    current_price: float
    target_profit_pct: float
    target_selling_price: float
    data_points_count: int
    history: List[HistoricalPricePoint]
    historical_scenarios: List[HistoricalScenarioSim]
