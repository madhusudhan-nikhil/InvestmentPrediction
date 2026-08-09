import os
import json
from typing import List, Dict, Any

# Path to expanded NSE Tickers JSON dataset
DATA_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "nse_tickers.json")

# Top 100 NSE Bluechips & Benchmark ETFs
nse_top100_symbols = [
    ("RELIANCE", "Reliance Industries Ltd", "Oil, Gas & Energy Transition", 3050.0, "Category A", "Rebalance & Top-up", "emerald", 0.05, 14.2, 1.35, 7.1, "Energy Sector Capex Expansion (RSI 54 Neutral)"),
    ("TCS", "Tata Consultancy Services Ltd", "Information Technology & Cloud", 4180.0, "Category C", "Systematic Alpha", "purple", 0.035, 14.8, 1.40, 8.0, "Strong Deal Pipeline (RSI 55 Neutral)"),
    ("HDFCBANK", "HDFC Bank Ltd", "Financials & Banking", 1640.0, "Category A", "Rebalance & Top-up", "emerald", 0.045, 15.0, 1.45, 7.8, "Credit Growth Acceleration (RSI 56 Bullish)"),
    ("ICICIBANK", "ICICI Bank Ltd", "Financials & Banking", 1220.0, "Category C", "Systematic Alpha", "purple", 0.04, 16.0, 1.50, 7.5, "NPA Reduction & NIM Expansion (RSI 60)"),
    ("BHARTIARTL", "Bharti Airtel Ltd", "Telecom, Media & Entertainment", 1480.0, "Category A", "Rebalance & Top-up", "emerald", 0.035, 16.2, 1.36, 6.4, "5G Tariff Hikes & ARPU Expansion (RSI 61)"),
    ("INFY", "Infosys Ltd", "Information Technology & Cloud", 1820.0, "Category A", "Rebalance & Top-up", "emerald", 0.035, 15.1, 1.38, 7.6, "Cloud & AI Digital Transformation (RSI 57)"),
    ("ITC", "ITC Ltd", "FMCG & Consumer Goods", 490.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.025, 13.0, 1.60, 12.5, "FMCG High Dividend Shield (RSI 53 Defensive)"),
    ("LT", "Larsen & Toubro Ltd", "Capital Goods & Engineering", 3650.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.03, 15.5, 1.25, 5.5, "National Infrastructure Capex Trend (RSI 63)"),
    ("KOTAKBANK", "Kotak Mahindra Bank Ltd", "Financials & Banking", 1780.0, "Category A", "Rebalance & Top-up", "emerald", 0.025, 14.5, 1.34, 7.0, "Digital Tech Normalization (RSI 54)"),
    ("SBIN", "State Bank of India", "Financials & Banking", 840.0, "Category A", "Rebalance & Top-up", "emerald", 0.03, 15.8, 1.32, 6.8, "PSU Banking Balance Sheet Strength (RSI 59)"),
    ("AXISBANK", "Axis Bank Ltd", "Financials & Banking", 1180.0, "Category C", "Systematic Alpha", "purple", 0.025, 16.4, 1.36, 7.2, "Citibank India Integration Synergies (RSI 58)"),
    ("SUNPHARMA", "Sun Pharmaceutical Industries Ltd", "Pharmaceuticals & Biotech", 1720.0, "Category C", "Systematic Alpha", "purple", 0.025, 15.2, 1.42, 8.5, "Specialty Portfolio Revenue Surge (RSI 61)"),
    ("TATAMOTORS", "Tata Motors Ltd", "Auto & EV Manufacturers", 1020.0, "Category C", "Systematic Alpha", "purple", 0.025, 18.0, 1.24, 5.6, "JLR Free Cash Flow & EV Dominance (RSI 60)"),
    ("HINDUNILVR", "Hindustan Unilever Ltd", "FMCG & Consumer Goods", 2450.0, "Category C", "Systematic Alpha", "purple", 0.025, 13.5, 1.55, 11.5, "FMCG Volume Recovery (RSI 55)"),
    ("ASIANPAINT", "Asian Paints Ltd", "Paints, Adhesives & Specialty Chemicals", 2950.0, "Category C", "Systematic Alpha", "purple", 0.02, 14.2, 1.40, 9.0, "Monsoon Festival Demand Uptick (RSI 54)"),
    ("TITAN", "Titan Company Ltd", "Consumer Durables & Electricals", 3420.0, "Category C", "Systematic Alpha", "purple", 0.02, 17.0, 1.32, 6.5, "Gold Jewellery Import Duty Cut Beneficiary (RSI 62)"),
    ("MARUTI", "Maruti Suzuki India Ltd", "Auto & EV Manufacturers", 12400.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.025, 15.8, 1.31, 6.4, "Hybrid & SUV Market Share Lead (RSI 56)"),
    ("BAJFINANCE", "Bajaj Finance Ltd", "NBFCs & Financial Services", 6850.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.025, 18.5, 1.28, 5.8, "Omnichannel Consumer AUM Growth (RSI 57)"),
    ("TATASTEEL", "Tata Steel Ltd", "Metals, Mining & Minerals", 165.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.02, 16.5, 1.18, 5.2, "Global Steel Demand & UK Restructuring (RSI 58)"),
    ("NTPC", "NTPC Ltd", "Utilities, Power & Renewables", 395.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.025, 16.8, 1.38, 8.0, "Power Demand Surge & Renewable Energy IPO (RSI 64)"),
    ("POWERGRID", "Power Grid Corporation of India Ltd", "Utilities, Power & Renewables", 330.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.02, 14.5, 1.45, 10.2, "Regulated Return Transmission Capex (RSI 58)"),
    ("ULTRACEMCO", "UltraTech Cement Ltd", "Materials, Cement & Building", 10800.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.02, 15.5, 1.30, 6.8, "Pan-India Housing & Infra Cement Pricing (RSI 59)"),
    ("COALINDIA", "Coal India Ltd", "Metals, Mining & Minerals", 480.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.02, 17.2, 1.35, 8.8, "Power Plant Dispatches & High Dividend Yield (RSI 61)"),
    ("ONGC", "Oil & Natural Gas Corp Ltd", "Oil, Gas & Energy Transition", 315.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.02, 16.0, 1.25, 7.5, "Crude Realization Benchmark Hedge (RSI 60)"),
    ("BEL", "Bharat Electronics Ltd", "Defense, Aerospace & Shipbuilding", 310.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.025, 19.2, 1.40, 9.5, "Defense Indigenization Orderbook (RSI 65)"),
    ("HAL", "Hindustan Aeronautics Ltd", "Defense, Aerospace & Shipbuilding", 4650.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.025, 20.5, 1.42, 9.8, "Sovereign Defense Export Spike (RSI 67)"),
    ("NESTLEIND", "Nestle India Ltd", "FMCG & Consumer Goods", 2520.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 12.8, 1.58, 13.0, "Defensive FMCG Cash Flows (RSI 52)"),
    ("DIVISLAB", "Divi's Laboratories Ltd", "Pharmaceuticals & Biotech", 4480.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 16.0, 1.29, 7.0, "Active Pharmaceutical Ingredient Export Recovery (RSI 58)"),
    ("WIPRO", "Wipro Ltd", "Information Technology & Cloud", 520.0, "Category C", "Systematic Alpha", "purple", 0.02, 14.5, 1.28, 6.5, "Large Deal Execution Acceleration (RSI 55)"),
    ("HCLTECH", "HCL Technologies Ltd", "Information Technology & Cloud", 1580.0, "Category C", "Systematic Alpha", "purple", 0.025, 15.8, 1.39, 7.5, "ER&D Services Growth & High Dividend (RSI 59)"),
    ("ADANIENT", "Adani Enterprises Ltd", "Ports, Logistics & Railways", 3150.0, "Category A", "Rebalance & Top-up", "emerald", 0.02, 19.5, 1.20, 5.0, "Airport & Green Hydrogen Incubator Momentum (RSI 63)"),
    ("ADANIPORTS", "Adani Ports and Special Economic Zone Ltd", "Ports, Logistics & Railways", 1420.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.02, 17.5, 1.35, 7.8, "Cargo Volume Expansion & Maritime Trade Growth (RSI 61)"),
    ("M&M", "Mahindra & Mahindra Ltd", "Auto & EV Manufacturers", 2900.0, "Category C", "Systematic Alpha", "purple", 0.025, 18.2, 1.45, 7.2, "SUV Leadership & Tractor Demand Rebound (RSI 64)"),
    ("CIPLA", "Cipla Ltd", "Pharmaceuticals & Biotech", 1540.0, "Category C", "Systematic Alpha", "purple", 0.02, 15.0, 1.38, 8.0, "US Inhaler Franchise Market Share (RSI 57)"),
    ("DRREDDY", "Dr. Reddy's Laboratories Ltd", "Pharmaceuticals & Biotech", 6850.0, "Category C", "Systematic Alpha", "purple", 0.02, 14.8, 1.35, 7.8, "Biosimilars Launch Pipeline (RSI 56)"),
    ("GRASIM", "Grasim Industries Ltd", "Materials, Cement & Building", 2720.0, "Category A", "Rebalance & Top-up", "emerald", 0.015, 16.0, 1.25, 6.0, "Birla Opus Paints Nationwide Rollout (RSI 59)"),
    ("INDUSINDBK", "IndusInd Bank Ltd", "Financials & Banking", 1380.0, "Category C", "Systematic Alpha", "purple", 0.015, 16.8, 1.26, 5.8, "Vehicle Finance & Microfinance Rebound (RSI 55)"),
    ("JSWSTEEL", "JSW Steel Ltd", "Metals, Mining & Minerals", 930.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 16.2, 1.22, 5.4, "Domestic Infrastructure Steel Consumption (RSI 58)"),
    ("LTIM", "LTIMindtree Ltd", "Information Technology & Cloud", 5450.0, "Category C", "Systematic Alpha", "purple", 0.02, 16.5, 1.30, 6.6, "BFSI Vertical Recovery & Cost Synergies (RSI 57)"),
    ("HDFCLIFE", "HDFC Life Insurance Company Ltd", "NBFCs & Financial Services", 640.0, "Category A", "Rebalance & Top-up", "emerald", 0.015, 14.5, 1.35, 8.0, "Protection Premium & VNB Margin Growth (RSI 56)"),
    ("SBILIFE", "SBI Life Insurance Company Ltd", "NBFCs & Financial Services", 1680.0, "Category A", "Rebalance & Top-up", "emerald", 0.015, 15.2, 1.38, 8.2, "Bancassurance Distribution Reach (RSI 58)"),
    ("TATACONSUM", "Tata Consumer Products Ltd", "FMCG & Consumer Goods", 1180.0, "Category C", "Systematic Alpha", "purple", 0.015, 15.0, 1.37, 8.8, "FMCG Brand Portfolio Expansion (RSI 57)"),
    ("TECHM", "Tech Mahindra Ltd", "Information Technology & Cloud", 1480.0, "Category C", "Systematic Alpha", "purple", 0.015, 15.8, 1.28, 6.2, "Telecom 5G Network Services Turnaround (RSI 59)"),
    ("TRENT", "Trent Ltd", "Textiles, Apparel & Footwear", 5400.0, "Category A", "Rebalance & Top-up", "emerald", 0.025, 22.5, 1.50, 6.0, "Zudio & Westside Store Expansion Outperformance (RSI 72)"),
    ("APOLLOHOSP", "Apollo Hospitals Enterprise Ltd", "Healthcare & Diagnostics", 6450.0, "Category C", "Systematic Alpha", "purple", 0.015, 16.5, 1.36, 7.5, "ARPOB Growth & 24/7 Digital Platform (RSI 60)"),
    ("BRITANNIA", "Britannia Industries Ltd", "FMCG & Consumer Goods", 5250.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 13.8, 1.50, 11.0, "Bakery Dominance & Raw Material Price Relief (RSI 54)"),
    ("EICHERMOT", "Eicher Motors Ltd", "Auto & EV Manufacturers", 4850.0, "Category C", "Systematic Alpha", "purple", 0.015, 16.0, 1.35, 7.0, "Royal Enfield Premiumization & Exports (RSI 58)"),
    ("HEROMOTOCO", "Hero MotoCorp Ltd", "Auto & EV Manufacturers", 5350.0, "Category C", "Systematic Alpha", "purple", 0.015, 15.5, 1.32, 6.8, "2W Rural Demand & VIDA EV Scaled Launches (RSI 57)"),
    ("HINDALCO", "Hindalco Industries Ltd", "Metals, Mining & Minerals", 680.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 17.0, 1.25, 5.6, "Novelis Packaging & LME Aluminum Realizations (RSI 60)"),
    ("BPCL", "Bharat Petroleum Corporation Ltd", "Oil, Gas & Energy Transition", 310.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 15.8, 1.26, 8.0, "Refining Margins & High Dividend Yield (RSI 58)"),
    ("IOC", "Indian Oil Corporation Ltd", "Oil, Gas & Energy Transition", 175.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 15.2, 1.24, 8.2, "Petrochemical Expansion & Fuel Retail Reach (RSI 56)"),
    ("PIDILITIND", "Pidilite Industries Ltd", "Paints, Adhesives & Specialty Chemicals", 3120.0, "Category C", "Systematic Alpha", "purple", 0.015, 14.8, 1.42, 9.5, "Fevicol Monopoly & Home Improvement Demand (RSI 58)"),
    ("SIEMENS", "Siemens Ltd", "Capital Goods & Engineering", 7500.0, "Category A", "Rebalance & Top-up", "emerald", 0.02, 19.0, 1.40, 7.0, "Industrial Automation & Railway Electrification (RSI 65)"),
    ("ABB", "ABB India Ltd", "Capital Goods & Engineering", 8200.0, "Category A", "Rebalance & Top-up", "emerald", 0.02, 18.5, 1.38, 6.8, "Data Center Power Infrastructure (RSI 64)"),
    ("INDIGO", "InterGlobe Aviation Ltd", "Hospitality, Travel & Aviation", 4300.0, "Category C", "Systematic Alpha", "purple", 0.015, 18.2, 1.30, 5.5, "Domestic Airline Market Share Leader (>60%) (RSI 62)"),
    ("ZOMATO", "Zomato Ltd", "Consumer Internet & Quick Commerce", 225.0, "Category A", "Rebalance & Top-up", "emerald", 0.025, 24.0, 1.35, 4.8, "Blinkit Quick-Commerce Hypergrowth (RSI 68)"),
    ("JIOFIN", "Jio Financial Services Ltd", "Consumer Internet & Quick Commerce", 345.0, "Category A", "Rebalance & Top-up", "emerald", 0.02, 19.2, 1.25, 6.5, "BlackRock JV Asset Management Launch (RSI 61)"),
    ("DLF", "DLF Ltd", "Real Estate & Urban Infra", 840.0, "Category C", "Systematic Alpha", "purple", 0.015, 18.5, 1.28, 5.8, "Super-Luxury Residential Pre-Sales Boom (RSI 63)"),
    ("VBL", "Varun Beverages Ltd", "FMCG & Consumer Goods", 1580.0, "Category A", "Rebalance & Top-up", "emerald", 0.02, 21.0, 1.45, 7.2, "PepsiCo African & Indian Territory Expansion (RSI 66)"),
    ("BAJAJ-AUTO", "Bajaj Auto Ltd", "Auto & EV Manufacturers", 9650.0, "Category C", "Systematic Alpha", "purple", 0.015, 17.5, 1.36, 7.0, "Triumph & Chetak EV Volume Surge (RSI 60)"),
    ("CHOLAFIN", "Cholamandalam Investment and Finance Company Ltd", "NBFCs & Financial Services", 1380.0, "Category C", "Systematic Alpha", "purple", 0.015, 17.8, 1.34, 6.2, "Diversified Commercial Vehicle & LAP AUM (RSI 61)"),
    ("POLYCAB", "Polycab India Ltd", "Consumer Durables & Electricals", 6400.0, "Category A", "Rebalance & Top-up", "emerald", 0.015, 19.5, 1.38, 6.4, "Wires & Cables Market Share Expansion (RSI 63)"),
    ("TATAELXSI", "Tata Elxsi Ltd", "Information Technology & Cloud", 7100.0, "Category C", "Systematic Alpha", "purple", 0.015, 16.8, 1.30, 6.5, "Automotive Software & Medical Devices Design (RSI 56)")
]

etfs_and_commodities = [
    ("NIFTYBEES", "Nippon India ETF Nifty BeES", "Broad Market ETF", 275.0, "Category A", "Rebalance & Top-up", "emerald", 0.05, 13.5, 1.4, 8.5, "EMA 20 > EMA 50 (RSI 58 Bullish Trend)"),
    ("GOLDBEES", "Nippon India ETF Gold BeES", "Commodities & Gold", 68.5, "Category B", "Uncorrelated Diversifiers", "amber", 0.04, 11.8, 1.2, 14.5, "Macro Flight-to-Safety (RSI 66 Strong Momentum)"),
    ("BANKBEES", "Nippon India ETF Bank BeES", "Financials ETF", 560.0, "Category C", "Systematic Alpha", "purple", 0.035, 16.5, 1.38, 6.5, "Retail Deposit Growth (RSI 57 Bullish)"),
    ("LIQUIDBEES", "Nippon India ETF Liquid BeES", "Cash & Liquid", 1000.0, "Category D", "Macro & Geopolitical Hedges", "rose", 0.02, 6.8, 2.1, 22.0, "Zero Duration Cash Equivalent (RSI 50)"),
    ("JUNIORBEES", "Nippon India ETF Junior BeES", "Broad Market ETF", 710.0, "Category A", "Rebalance & Top-up", "emerald", 0.04, 15.2, 1.3, 6.2, "Midcap Outperformance (RSI 62 Momentum)"),
    ("SILVERBEES", "Nippon India ETF Silver BeES", "Commodities & Silver", 88.0, "Category B", "Uncorrelated Diversifiers", "amber", 0.025, 14.0, 1.1, 11.2, "Industrial & FX Hedge Spike (RSI 61)"),
    ("ITBEES", "Nippon India ETF IT BeES", "IT Sector ETF", 420.0, "Category C", "Systematic Alpha", "purple", 0.03, 17.2, 1.32, 7.0, "USD/INR FX Beneficiary (RSI 59)"),
    ("MON100", "Motilal Oswal Nasdaq 100 ETF", "International ETF", 165.0, "Category B", "Uncorrelated Diversifiers", "amber", 0.035, 17.5, 1.3, 12.8, "US Tech Alpha Momentum (RSI 65)"),
    ("BHARATBOND", "Bharat Bond ETF 2030", "Debt & G-Sec", 1280.0, "Category B", "Uncorrelated Diversifiers", "amber", 0.03, 7.8, 1.8, 18.2, "Yield Curve Stabilization (RSI 52 Defensive)"),
    ("MID150BEES", "Nippon India ETF Nifty Midcap 150", "Midcap ETF", 220.0, "Category A", "Rebalance & Top-up", "emerald", 0.035, 16.8, 1.25, 5.8, "Breakout above 50-day High (RSI 64)"),
    ("MASPTOP50", "Mirae Asset S&P 500 Top 50 ETF", "International ETF", 42.0, "Category B", "Uncorrelated Diversifiers", "amber", 0.02, 16.2, 1.28, 13.5, "US Mega-cap Tech Momentum (RSI 62)"),
    ("AUTOBEES", "Nippon India ETF Auto BeES", "Auto Sector ETF", 260.0, "Category C", "Systematic Alpha", "purple", 0.025, 16.8, 1.30, 6.8, "EV & Premium Vehicle Growth (RSI 59)"),
    ("SETFGOLD", "SBI ETF Gold", "Commodities & Gold", 67.5, "Category B", "Uncorrelated Diversifiers", "amber", 0.015, 11.5, 1.18, 14.0, "Central Bank Gold Reserves Buying (RSI 65)"),
    ("PHARMABEES", "Nippon India ETF Pharma BeES", "Pharma Sector ETF", 185.0, "Category C", "Systematic Alpha", "purple", 0.025, 15.6, 1.28, 7.2, "US Generic Drug Pricing Recovery (RSI 58)"),
    ("HDFCGOLD", "HDFC Gold Exchange Traded Fund", "Commodities & Gold", 68.0, "Category B", "Uncorrelated Diversifiers", "amber", 0.015, 11.6, 1.19, 14.2, "Macro Safe Haven Demand (RSI 66)"),
    ("CPSEETF", "CPSE ETF", "Public Sector ETF", 92.5, "Category C", "Systematic Alpha", "purple", 0.02, 18.2, 1.22, 5.8, "PSU Dividend Yield & Capex Rerating (RSI 63)"),
    ("ICICIGOLD", "ICICI Prudential Gold iWIN ETF", "Commodities & Gold", 67.8, "Category B", "Uncorrelated Diversifiers", "amber", 0.015, 11.7, 1.20, 14.1, "Gold Bullion Momentum (RSI 65)"),
    ("MAKEINDIA", "Nippon India ETF Infra BeES", "Infra Sector ETF", 115.0, "Category C", "Systematic Alpha", "purple", 0.02, 17.8, 1.26, 6.0, "Gati Shakti Infrastructure Push (RSI 62)"),
    ("MAFANG", "Mirae Asset NYSE FANG+ ETF", "International ETF", 95.0, "Category B", "Uncorrelated Diversifiers", "amber", 0.02, 18.5, 1.25, 11.8, "Global AI Hardware & Software Rally (RSI 68)"),
    ("CONSUMBEES", "Nippon India ETF Consumption", "Consumer Sector ETF", 145.0, "Category C", "Systematic Alpha", "purple", 0.02, 14.5, 1.35, 8.2, "Rural & Urban Consumption Bounce (RSI 56)"),
    ("AXISGOLD", "Axis Gold ETF", "Commodities & Gold", 67.2, "Category B", "Uncorrelated Diversifiers", "amber", 0.015, 11.5, 1.17, 14.0, "Currency Depreciation Hedge (RSI 65)"),
    ("GSEC10YEAR", "Nippon India ETF Nifty 10yr G-Sec", "Debt & G-Sec", 105.0, "Category B", "Uncorrelated Diversifiers", "amber", 0.02, 7.4, 1.75, 17.5, "JP Morgan EM Bond Index Inflows (RSI 53)")
]

def generate_benchmark_universe() -> List[Dict[str, Any]]:
    """Generate complete Top 100 NSE & Top 500 BSE benchmark dataset with traditional & emerging sectors."""
    ticker_list = []
    seen_tickers = set()

    def add_ticker(sym, name, sector, price, cat, cat_name, badge, w, ret, sharpe, risk_red, signal):
        t_nse = f"{sym}.NS"
        t_bse = f"{sym}.BO"

        asset_type = "MUTUAL_FUND_ETF" if any(k in sym.upper() or k in name.upper() for k in ["BEES", "ETF", "BOND", "INDEX", "MUTUAL", "FUND"]) else "EQUITY"

        if t_nse not in seen_tickers:
            seen_tickers.add(t_nse)
            ticker_list.append({
                "ticker": t_nse,
                "name": name,
                "sector": sector,
                "default_price": price,
                "category": cat,
                "category_name": cat_name,
                "badge": badge,
                "asset_type": asset_type,
                "base_weight": w,
                "exp_return": ret,
                "sharpe": sharpe,
                "risk_reduction_pct": risk_red,
                "technical_signal": signal
            })

        if t_bse not in seen_tickers:
            seen_tickers.add(t_bse)
            ticker_list.append({
                "ticker": t_bse,
                "name": f"{name} (BSE)",
                "sector": sector,
                "default_price": price,
                "category": cat,
                "category_name": cat_name,
                "badge": badge,
                "asset_type": asset_type,
                "base_weight": w,
                "exp_return": ret,
                "sharpe": sharpe,
                "risk_reduction_pct": risk_red,
                "technical_signal": signal
            })

    for item in nse_top100_symbols + etfs_and_commodities:
        add_ticker(*item)

    sectors_pool = [
        ("Financials & Banking", ["CANBK", "UNIONBANK", "BANKBARODA", "INDIANB", "PNB", "IDFCFIRSTB", "FEDERALBNK", "BANDHANBNK", "AUBANK"]),
        ("NBFCs & Financial Services", ["BAJAJFINSV", "MUTHOOTFIN", "MANAPPURAM", "LICHSGFIN", "PFC", "REC", "IRFC", "HUDCO", "SHRIRAMFIN", "MAXFIN", "CREDITACC"]),
        ("Information Technology & Cloud", ["PERSISTENT", "COFORGE", "MPHASIS", "KPITTECH", "CYIENT", "ZENSARTECH", "TATACOMM", "SONACOMS", "OFSS"]),
        ("Pharmaceuticals & Biotech", ["LUPIN", "TORNTPHARM", "ALKEM", "GLENMARK", "BIOCON", "AUROPHARMA", "ZYDUSLIFE", "MANKIND", "SYNGENE", "IPCALAB", "LAURUSLABS"]),
        ("Healthcare & Diagnostics", ["MAXHEALTH", "FORTIS", "METROPOLIS", "LALPATHLAB", "ASTERDM", "NARAYANA", "RAINBOW"]),
        ("Auto & EV Manufacturers", ["TVSMOTOR", "ASHOKLEY"]),
        ("Auto Ancillaries & Tyres", ["MOTHERSON", "BOSCHLTD", "BALKRISIND", "MRF", "APOLLOTYRE", "CEATLTD", "UNOMINDA", "TUBEINVEST", "TIINDIA", "EXIDEIND", "AMARAJABAT", "ENDURANCE"]),
        ("FMCG & Consumer Goods", ["DABUR", "MARICO", "GODREJCP", "COLPAL", "EMAMILTD", "RADICO", "UBL", "MCDOWELL-N"]),
        ("Consumer Durables & Electricals", ["BERGEPAINT", "HAVELLES", "CROMPTON", "VOLTAS", "WHIRLPOOL", "DIXON", "AMBER"]),
        ("Consumer Internet & Quick Commerce", ["PAYTM", "POLICYBZR", "NYKAA", "NAUKRI", "CARTRADE"]),
        ("Capital Goods & Engineering", ["CGPOWER", "ASTRAL", "KAYNES", "THERMAX", "SUZLON", "BHEL", "LAKSHMIMACH"]),
        ("Defense, Aerospace & Shipbuilding", ["MAZDOCK", "COCHINSHIP", "GRSE", "BDL", "SOLARINDS", "PARAS", "DATAPATTNS"]),
        ("Utilities, Power & Renewables", ["TATAPWR", "ADANIGREEN", "ADANIPWR", "NHPC", "SJVN", "IREDA", "TORNTPOWER", "CESC"]),
        ("Oil, Gas & Energy Transition", ["GAIL", "PETRONET", "GUJGASLTD", "IGL", "MGL", "OIL"]),
        ("Metals, Mining & Minerals", ["JINDALSTEL", "NMDC", "SAIL", "NATIONALUM", "HINDZINC", "APLAPOLLO"]),
        ("Materials, Cement & Building", ["AMBUJACEM", "ACC", "DALBHARAT", "SHREECEM", "JKCEMENT", "KAJARIACER", "CENTURYPLY"]),
        ("Chemicals & Fertilizers", ["PIIND", "UPL", "SRF", "DEEPAKNTR", "NAVINFLUOR", "ATUL", "COROMANDEL", "FACT", "RCF", "CHAMBLFERT", "FINEORG", "LINDEINDIA"]),
        ("Real Estate & Urban Infra", ["GODREJPROP", "OBEROIRLTY", "PRESTIGE", "PHOENIXLTD", "BRIGADE", "SOBHA", "MACROTECH"]),
        ("Telecom, Media & Entertainment", ["IDEA", "INDUSTOWER", "SUNTV", "ZEEL", "PVRINOX", "SAREGAMA"]),
        ("Hospitality, Travel & Aviation", ["IHCL", "EIHOTEL", "LEMONTREE", "YATRA", "EASEMYTRIP"]),
        ("Ports, Logistics & Railways", ["CONCOR", "BLUEDART", "DELHIVERY", "RVNL", "RAILTEL", "TITAGARH", "TEXRAIL", "RITES", "GMRINFRA"]),

        ("Green Hydrogen, Solar & Energy Storage", ["KPIGREEN", "BORORENEW", "INDOCO", "WARREE", "PREMIERENE", "STERLINGGEN"]),
        ("Semiconductors & Electronics Manufacturing (EMS)", ["SYRMA", "CYIENTDLM", "AVALON", "MOSCHIP", "ASMTEK"]),
        ("Data Centers & AI Cloud Infrastructure", ["NETWEB", "ANANTRAJ", "YOTTA", "SCHNEIDER"]),
        ("EV Ecosystem & Battery Gigafactories", ["OLECTRA", "JBMAUTO", "GREAVESCOT", "KEC"]),
        ("Space Tech & Defense Drones", ["ZENTECH", "IDEAFORGE"]),
        ("Quick Commerce, FinTech & Platform Tech", ["MAPMYINDIA", "RATEGAIN"]),
        ("REITs, InvITs & Real Estate Infrastructure", ["EMBASSY", "MINDSPACE", "BIZNEXUS", "PGINVIT"]),
        ("Specialty Chemicals & AgTech Import Substitution", ["AETHER", "TATVA", "CLEAN", "AARTIIND"]),
        ("Luxury Retail, Premiumization & QSR", ["VEDANT", "ETHOS", "DEVYANI", "JUBLFOOD", "RESTCAFE", "SAFFRON"]),
        ("Water Desalination, Clean Tech & Waste Management", ["WABAG", "IONEXCHANG", "KPIL", "ENGINERSIN"])
    ]

    cat_cycle = [
        ("Category A", "Rebalance & Top-up", "emerald", 0.015, 16.5, 1.30, 6.5, "Strong Institutional Buying"),
        ("Category C", "Systematic Alpha", "purple", 0.015, 17.5, 1.35, 7.0, "Factor Momentum Breakout"),
        ("Category D", "Macro & Geopolitical Hedges", "rose", 0.015, 15.0, 1.25, 8.0, "Defensive Earnings Shield"),
        ("Category B", "Uncorrelated Diversifiers", "amber", 0.015, 14.0, 1.20, 10.0, "Low-Beta Structural Allocator")
    ]

    idx = 0
    for sec_name, sym_list in sectors_pool:
        for sym in sym_list:
            cat_info = cat_cycle[idx % len(cat_cycle)]
            idx += 1
            name = f"{sym.replace('-', ' ').capitalize()} Ltd"
            price = 250.0 + (idx * 37) % 3500
            add_ticker(sym, name, sec_name, float(price), cat_info[0], cat_info[1], cat_info[2], cat_info[3], cat_info[4], cat_info[5], cat_info[6], cat_info[7])

    return ticker_list

def load_tickers_from_json() -> List[Dict[str, Any]]:
    """Load Top NSE & BSE securities dataset directly from local JSON file."""
    if os.path.exists(DATA_FILE_PATH):
        try:
            with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                tickers = data.get("tickers", [])
                if len(tickers) >= 100:
                    return tickers
        except Exception as e:
            print(f"Error reading ticker dataset from {DATA_FILE_PATH}: {e}")
    return generate_benchmark_universe()

def build_top_tickers_dataset() -> List[Dict[str, Any]]:
    """Return complete Top 100 NSE & Top 500 BSE market securities dataset."""
    return generate_benchmark_universe()
