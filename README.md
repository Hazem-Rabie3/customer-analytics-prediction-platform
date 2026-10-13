# Customer Analytics and Prediction Platform

## Abstract

The Customer Analytics and Prediction Platform is an enterprise-level, full-stack machine learning solution designed to analyze customer behavior, predict lifetime financial spending, and identify strategic marketing segments. By combining demographic data, customer engagement across different channels, and historical responses to promotional campaigns, the platform provides a dual-stage machine learning inference process through a modern web-based interface.

The system tackles the practical challenge of deploying computationally intensive machine learning technologies, including XGBoost, Scikit-Learn, and Pandas, together with a modern web application. To achieve reliable and scalable deployment, it utilizes a hybrid architecture that combines Cloudflare Tunnels for secure connectivity with Vercel for efficient edge-based web delivery.

---

## Business Use Case and Value Proposition

Modern commerce requires granular allocation of promotional capital to maximize customer acquisition, retention, and return on investment (ROI). Traditional rule-based categorization often fails to identify non-linear spending patterns or latent behavioural characteristics across multiple purchasing channels.

### Key Capabilities and Business Impact

- **Optimized Capital Allocation:** Predicts monetary commitment per customer profile, preventing excessive discount distribution to segments willing to purchase at full price.
- **Automated Behavioral Segmentation:** Discovers natural clusters across multi-dimensional customer features, eliminating manual heuristic segmentation.
- **Targeted Campaign Strategies:** Maps each predicted cluster directly to actionable commercial protocols (e.g., VIP retention, high-priority reactivation, cross-category upselling, and cost-controlled automated outreach).
- **Reduced Customer Churn:** Flags low-engagement and churn-risk accounts early, enabling proactive re-engagement workflows before attrition occurs.

---

## Machine Learning Pipeline

The analytics engine executes a coordinated two-tier machine learning pipeline consisting of feature transformation, regression modeling, and unsupervised clustering.

```
+-------------------------------------------------------+
|                 Raw Customer Payload                  |
|    (Demographics, Web Activity, Campaign History)     |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|             Feature Engineering Pipeline              |
|  - Date parsing and customer tenure computation       |
|  - Demographic consolidation (Education, Status)      |
|  - Household size & purchasing distribution shares    |
|  - Missing value imputation & IQR outlier clipping    |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|       XGBoost Regression Model (Total Spending)       |
|         Estimates 2-year total expenditure ($)        |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|             K-Means Clustering Segmentation           |
|        Combines behavioral attributes with the        |
|          predicted spending metric to assign:         |
|                                                       |
|  - Cluster 0: VIP Segment                             |
|  - Cluster 1: High-Potential Segment                  |
|  - Cluster 2: Stable Mid-Tier Segment                 |
|  - Cluster 3: Low / Churn-Risk Segment                |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|              Actionable Commercial Policy             |
|         (Strategy mapping returned via REST API)      |
+-------------------------------------------------------+
```

### 1. Total Spending Prediction (XGBoost Regression)

The regression model predicts total customer spending over a two-year evaluation horizon across catalog, store, and digital channels.

- **Estimator:** Gradient Boosted Decision Trees (`XGBRegressor`).
- **Feature Engineering:**
  - Dynamic extraction of customer tenure (`Customer_Tenure_Days`), derived age, and household composition (`Household_Size`, `Total_Children`).
  - Channel concentration metrics (`Web_Purchase_Share`, `Catalog_Purchase_Share`, `Store_Purchase_Share`).
  - Total accepted promotional campaigns (`Total_Accepted_Campaigns`).
- **Data Transformation:** Numeric variables undergo median imputation, interquartile range (IQR) outlier bounds clipping, and standard scaling. Categorical attributes are normalized and one-hot encoded.

### 2. Customer Segmentation (K-Means Clustering)

The clustering engine categorizes the customer base into four distinct behavioural segments using demographic vectors, promotional responsiveness, and the predicted spending metric generated by the regression model.

- **Algorithm:** K-Means Clustering (`k=4`) with Euclidean distance computation across standardized feature space.
- **Segment Definitions and Policy Mapping:**
  - **Cluster 0 (VIP):** High-volume, discount-insensitive spenders. Recommended strategy: White-glove personal service, early access to new collections, elimination of unnecessary discounting.
  - **Cluster 1 (High-Potential):** Receptive prospects with moderate-to-high latent capacity. Recommended strategy: Priority campaign enrollment, strong introductory incentives, targeted reactivation outreach.
  - **Cluster 2 (Stable Mid):** Consistent spenders with average basket sizes. Recommended strategy: Product bundling, category-specific cross-selling, light loyalty rewards.
  - **Cluster 3 (Low / Churn Risk):** Infrequent buyers with limited interaction. Recommended strategy: Automated, low-overhead email communication to control marketing expenditure.

---

## System Architecture and Hybrid Deployment

Enterprise machine learning models frequently present operational challenges when deployed to serverless environments due to strict package bundle limitations.

```
[ User Browser / Client ]
           |
           v
+-------------------------------------------------------+
|                 Frontend Deployment                   |
|                   (Vercel Edge)                       |
|                                                       |
|  - Next.js (App Router) Dashboard Interface           |
|  - Next.js Route Handler (/api/predict) Proxy         |
+-------------------------------------------------------+
                           |
                           | HTTPS (Secure Remote Call)
                           v
+-------------------------------------------------------+
|                  Cloudflare Tunnel                    |
|                (cloudflared daemon)                   |
|                                                       |
|  - Zero-Trust HTTPS Edge Ingress                      |
|  - Encrypted Tunnel to On-Premises Host               |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|             On-Premises Dedicated Machine             |
|                                                       |
|  - FastAPI Application Backend (Uvicorn)              |
|  - Full ML Runtime (Scikit-Learn, XGBoost, Pandas)    |
|  - Unconstrained memory and execution boundaries      |
+-------------------------------------------------------+
```

### Infrastructure Rationale

1. **Serverless Bundle Size Constraint:** The complete Python machine learning runtime (including XGBoost, Scikit-Learn, NumPy, Pandas, and compiled C++ dependencies) yields a deployment footprint of approximately 1.1 GB. This significantly exceeds the 500 MB maximum uncompressed bundle threshold enforced by Vercel Serverless Functions.
2. **Cost-Efficient Local Engine:** Rather than provisioning expensive continuous cloud GPU/CPU instances, the FastAPI backend is hosted on a dedicated local machine with native hardware performance.
3. **Secure Cloudflare Ingress:** The local backend is securely connected to the global internet via a Cloudflare Tunnel (`cloudflared`). This provides an encrypted, publicly addressable HTTPS endpoint without exposing public IP addresses, opening inbound firewall ports, or compromising local network security.
4. **Decoupled Client Interaction:** The Next.js frontend is deployed globally across Vercel's edge network, providing low-latency asset delivery. API calls are dispatched via an internal Next.js proxy route to the secure Cloudflare tunnel endpoint defined in `NEXT_PUBLIC_BACKEND_URL`.

---

## Tech Stack

### Frontend
- **Framework:** Next.js (App Router architecture)
- **UI Library:** React with TypeScript
- **Styling:** Tailwind CSS (Dark analytical interface)
- **Hosting:** Vercel

### Backend and Machine Learning
- **API Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Machine Learning Libraries:** XGBoost, Scikit-Learn
- **Data Manipulation:** Pandas, NumPy
- **Serialization:** Joblib, JSON
- **Validation:** Pydantic v2

### Infrastructure and Networking
- **Edge Routing & Ingress:** Cloudflare Tunnels (`cloudflared`)
- **Serverless Edge Delivery:** Vercel Edge Network

---

## Repository Structure

```
.
|-- backend/
|   |-- models/
|   |   |-- customer_clustering.pkl    # Pre-trained K-Means clustering bundle
|   |   |-- model_pipeline.pkl         # Pre-trained XGBoost regression pipeline
|   |-- main.py                        # FastAPI application definitions and routing
|   |-- ml_service.py                  # Model loading, inference, and strategy mapping
|   |-- preprocessing.py               # Custom Scikit-Learn transformers
|   |-- requirements.txt               # Backend Python dependencies
|   |-- schemas.py                     # Pydantic input and output validation models
|   `-- vercel.json                    # Configuration definition
|-- frontend/
|   |-- app/
|   |   |-- api/predict/route.ts       # Next.js proxy route handler
|   |   |-- globals.css                # Global stylesheet and Tailwind directives
|   |   |-- layout.tsx                 # Root layout specification
|   |   `-- page.tsx                   # Main analytics dashboard view
|   |-- components/
|   |   |-- CustomerForm.tsx           # Categorized profile input component
|   |   `-- ResultCard.tsx             # Analytical prediction display card
|   |-- .env.local                     # Environment variables definition
|   |-- package.json                   # Node.js dependencies and scripts
|   |-- tailwind.config.ts             # Tailwind CSS configuration
|   `-- types.ts                       # Shared TypeScript interfaces
|-- notebooks/
|   |-- Customer_Clustering_Only.ipynb # Unsupervised clustering research notebook
|   `-- ML_Project_Modeling_Complete.ipynb # Regression modeling and EDA notebook
|-- .gitignore                         # Repository tracking exclusion rules
`-- README.md                          # Project documentation
```

---

## Local Setup and Installation Instructions

Follow the steps below to configure and run the full-stack system locally.

### Prerequisites

- Node.js (version 18.17.0 or higher)
- Python (version 3.10 to 3.12 recommended)
- Git

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
```

---

### Step 2: Configure and Run the Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # On macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows:
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI application server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

The backend API will be accessible at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

---

### Step 3: Configure Cloudflare Tunnel (For Hybrid Remote Ingress)

To expose the locally running FastAPI backend to the public internet for Vercel deployment:

1. Install `cloudflared` on the host machine.
2. Run a tunnel pointing to the local FastAPI port:
   ```bash
   cloudflared tunnel --url http://127.0.0.1:8000
   ```
3. Copy the generated public HTTPS URL (e.g., `https://example-tunnel.trycloudflare.com`).

---

### Step 4: Configure and Run the Frontend (Next.js)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Configure the environment variables:
   Create or verify the `.env.local` file in the `frontend/` directory:
   ```env
   # For local development against local backend:
   NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

   # Or use the Cloudflare Tunnel URL when verifying hybrid connectivity:
   # NEXT_PUBLIC_BACKEND_URL=https://your-tunnel-name.trycloudflare.com
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Access the application in your browser at `http://localhost:3000`.

---

### Step 5: Production Build Verification

To verify that the frontend builds correctly for production:

```bash
cd frontend
npm run build
npm run start
```
