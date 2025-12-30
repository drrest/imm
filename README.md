# 📊 Financial Bubble Detection Tool

> A cloud-ready analytical framework for early detection of economic and financial bubbles at the company level

## 🎯 Overview

This project presents a **Google Cloud / BigQuery-based analytical framework** designed to identify situations where stock market valuation growth significantly outpaces underlying profitability growth. The system analyzes multi-year financial data to detect early-stage economic bubbles and elevated investment risks.

### Key Features

- 🔍 **Early Warning System** — Detects speculative price inflation before bubble formation
- ☁️ **Cloud-Native Architecture** — Built for Google Cloud Platform with BigQuery
- 📈 **Derivative Analytics** — Advanced financial metrics for risk assessment
- 🎨 **Interactive Visualization** — Cross-shaped analytical charts for decision support
- ⚡ **Scalable Design** — Handles datasets from thousands to millions of records

---

## 🏗️ Architecture

The system follows a cloud-native, three-tier architecture:

```
┌─────────────────────────────────────────┐
│         Data Ingestion Layer            │
│  (Forbes Global 2000, Bloomberg, etc.)  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      Google BigQuery (Data Warehouse)   │
│   • Scalable storage                    │
│   • Analytical processing               │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      Python Analytics Layer             │
│   • Metric calculation                  │
│   • Business logic                      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      Visualization Layer                │
│   • Analytical charts                   │
│   • Decision support dashboards         │
└─────────────────────────────────────────┘
```

> **Note**: The current implementation uses CSV files for simplicity, but the architecture is designed for seamless BigQuery integration.

---

## 📋 Data Schema

The system operates on public financial data from sources such as **Forbes Global 2000** and **Bloomberg**.

### Required Fields

| Column Name | Type | Description |
|------------|------|-------------|
| `id` | Integer | Unique company identifier |
| `rank` | Integer | Company rank |
| `name` | String | Company name |
| `country` | String | Country of incorporation |
| `sales` | Float | Total sales revenue |
| `profit` | Float | Net profit |
| `asset` | Float | Total assets |
| `market_value` | Float | Market capitalization |
| `year` | Integer | Fiscal year |

**Data File**: `export_dataset.csv`

---

## 🧮 Analytical Methodology

The core model is based on **derivative financial indicators** that compare profitability changes with market valuation sensitivity.

### Key Metrics

For each company and each pair of consecutive years, we calculate:

#### **N — Profitability Change** (X-axis)

```
N = (profit_current / sales_current) - (profit_previous / sales_previous)
```

Measures the year-over-year change in profit margin.

#### **M — Market Valuation Sensitivity** (Y-axis)

```
M = ((market_value_current - market_value_previous) / market_value_previous) / N
```

Measures how much the market value changed relative to the profitability change.

### 📊 Interpretation

| Scenario | Interpretation | Risk Level |
|----------|---------------|------------|
| **Synchronous growth** | Market value and profitability grow together | ✅ Healthy |
| **Excessive M value** | Market value grows faster than profitability | ⚠️ Warning |
| **High M, low N** | Speculative price inflation | 🚨 High Risk |

**Warning Signs:**
- Increasing unbacked liabilities
- Speculative price inflation
- Early-stage economic bubble formation

---

## 📈 Visualization

Results are displayed as a **cross-shaped (N–M) analytical chart**:

- **X-axis (N)**: Change in profitability
- **Y-axis (M)**: Stock price growth normalized by profitability change

**Risk Indicators:**
- Companies far from the origin → Higher risk
- Upper regions of the chart → Candidates for deeper analysis
- Clustering patterns → Sector-wide bubble formation

---

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Required Dependencies

```bash
pip install matplotlib google-cloud-bigquery pandas
```

### Optional (for BigQuery integration)

```bash
# Set up Google Cloud authentication
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

---

## 💻 Usage

### Current Implementation (CSV-based)

The provided Python script:

1. ✅ Reads financial data from CSV export (BigQuery-compatible format)
2. ✅ Filters companies with continuous data for 2017–2021
3. ✅ Allows interactive company selection
4. ✅ Computes N and M values
5. ✅ Generates analytical visualizations

This serves as a **local prototype** of the cloud-based system.

### BigQuery Integration (Production)

For production deployment, replace CSV reading with BigQuery queries:

```python
from google.cloud import bigquery

# Initialize BigQuery client
client = bigquery.Client()

# Query financial data
query = """
SELECT 
    name, 
    year, 
    sales, 
    profit, 
    market_value
FROM `project.dataset.financials`
WHERE year BETWEEN 2017 AND 2021
ORDER BY name, year
"""

# Load data into pandas DataFrame
df = client.query(query).to_dataframe()
```

---

## 🎯 Use Cases

| Industry | Application |
|----------|-------------|
| **Investment Management** | Cloud-based investment screening systems |
| **Risk Management** | Early warning tools for financial instability |
| **Research** | Quantitative research platforms |
| **Institutional Investing** | Decision-support dashboards |
| **Regulatory Compliance** | Market surveillance and monitoring |

---

## 💡 Strategic Value

By combining **BigQuery-scale data processing** with **financial derivative analytics**, the system enables:

- ⚡ **Scalable Risk Detection** — Process millions of records in real-time
- 🔍 **Transparent Decision-Making** — Data-driven investment strategies
- 🚨 **Early Bubble Identification** — Detect speculative bubbles before they burst
- 📊 **Institutional-Grade Analytics** — Professional-level financial analysis

---

## ⚠️ Disclaimer

> **Important**: This software is intended for research and analytical purposes only and does not constitute financial or investment advice. Always consult with qualified financial professionals before making investment decisions.

---

## 📄 License

This project is provided as-is for educational and research purposes.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

---

<div align="center">

**Built with ❤️ for financial transparency and risk management**

</div>