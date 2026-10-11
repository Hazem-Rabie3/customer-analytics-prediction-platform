"""FastAPI application – Customer Analytics ML API.

Endpoints
---------
GET  /             → health-check / welcome message
GET  /health       → liveness probe
POST /api/predict  → regression + clustering prediction
"""

from __future__ import annotations

import logging
import sys
import os

# ---------------------------------------------------------------------------
# Ensure the backend package root is on sys.path so that `preprocessing`
# (needed by the pickled pipeline) and our own modules resolve correctly
# when Vercel's Python runtime executes this file.
# ---------------------------------------------------------------------------
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import CustomerFeatures, PredictionResponse
from ml_service import predict

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Customer Analytics ML API",
    description=(
        "Predict customer spending and segment customers using pre-trained "
        "XGBoost regression and K-Means clustering models."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# -- CORS (allow all origins for the frontend) -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/", tags=["Health"])
async def root():
    """Welcome / health-check endpoint."""
    return {
        "message": "Customer Analytics ML API is running 🚀",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    """Liveness probe for monitoring."""
    return {"status": "healthy"}


@app.post(
    "/api/predict",
    response_model=PredictionResponse,
    tags=["Prediction"],
    summary="Predict spending & customer segment",
    description=(
        "Accepts raw customer features, predicts total spending via the "
        "XGBoost regression pipeline, segments the customer via K-Means "
        "clustering, and returns the prediction with an actionable "
        "marketing strategy."
    ),
)
async def predict_endpoint(customer: CustomerFeatures):
    """Run both ML models and return the combined result."""
    try:
        result = predict(customer)
        return result
    except KeyError as exc:
        logger.exception("Missing feature during prediction")
        raise HTTPException(
            status_code=422,
            detail=f"Missing or invalid feature: {exc}",
        ) from exc
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Internal prediction error: {exc}",
        ) from exc


# ---------------------------------------------------------------------------
# Local development
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
