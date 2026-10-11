"""ML model loading and prediction logic.

Encapsulates both the regression pipeline and the clustering model behind
a clean service interface.  Models are loaded once at import time (cold-start)
and reused across requests.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd

from schemas import CustomerFeatures

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BASE_DIR = Path(__file__).resolve().parent
_MODELS_DIR = _BASE_DIR / "models"

_REGRESSION_PATH = _MODELS_DIR / "model_pipeline.pkl"
_CLUSTERING_PATH = _MODELS_DIR / "customer_clustering.pkl"

# ---------------------------------------------------------------------------
# Cluster-to-strategy mapping
# ---------------------------------------------------------------------------
SEGMENT_MAP: Dict[int, Dict[str, str]] = {
    0: {
        "segment": "VIP",
        "strategy": (
            "VIP program \u2013 stop discounts (they buy without them), "
            "early access to new products, personal service"
        ),
    },
    1: {
        "segment": "High-Potential",
        "strategy": (
            "Top priority: first to receive the next campaign \u2013 reactivation, "
            "strong welcome offer, direct outreach"
        ),
    },
    2: {
        "segment": "Stable Mid",
        "strategy": (
            "Upsell campaigns \u2013 raise basket value (bundles, cross-sell by "
            "favorite category), light loyalty offers"
        ),
    },
    3: {
        "segment": "Low",
        "strategy": (
            "Cheap automated campaigns (email only) \u2013 no meaningful budget, "
            "move to low-cost channel"
        ),
    },
}

# ---------------------------------------------------------------------------
# Singleton model holder (loaded once per cold-start)
# ---------------------------------------------------------------------------

class _ModelStore:
    """Lazy-loads models on first access and caches them."""

    def __init__(self) -> None:
        self._regression_pipeline: Any | None = None
        self._clustering_bundle: Dict[str, Any] | None = None

    # -- Regression ---------------------------------------------------------
    @property
    def regression_pipeline(self) -> Any:
        if self._regression_pipeline is None:
            logger.info("Loading regression pipeline from %s", _REGRESSION_PATH)
            self._regression_pipeline = joblib.load(_REGRESSION_PATH)
        return self._regression_pipeline

    # -- Clustering ---------------------------------------------------------
    @property
    def clustering_bundle(self) -> Dict[str, Any]:
        if self._clustering_bundle is None:
            logger.info("Loading clustering bundle from %s", _CLUSTERING_PATH)
            self._clustering_bundle = joblib.load(_CLUSTERING_PATH)
            _patch_imputers(self._clustering_bundle.get("preprocessor"))
        return self._clustering_bundle


def _patch_imputers(obj: Any) -> None:
    """Fix sklearn 1.7.2 → 1.8.0 compatibility for SimpleImputer.

    In sklearn 1.7.2 the fitted attribute was named ``_fit_dtype``; in 1.8.0
    the ``transform()`` method reads ``_fill_dtype`` (set during ``fit()``).
    If a model was pickled under 1.7.2, ``_fill_dtype`` will be missing.
    We copy ``_fit_dtype`` → ``_fill_dtype`` so ``.transform()`` works.
    """
    from sklearn.impute import SimpleImputer as _SI

    if obj is None:
        return

    # Walk nested structures (ColumnTransformer → Pipeline → transformer)
    transformers: list = []
    if hasattr(obj, "transformers_"):
        for _name, trans, _cols in obj.transformers_:
            transformers.append(trans)
    if hasattr(obj, "steps"):
        for _name, trans in obj.steps:
            transformers.append(trans)

    for trans in transformers:
        # Recurse into pipelines
        _patch_imputers(trans)
        if isinstance(trans, _SI):
            if hasattr(trans, "_fit_dtype") and not hasattr(trans, "_fill_dtype"):
                trans._fill_dtype = trans._fit_dtype
                logger.debug("Patched SimpleImputer _fit_dtype → _fill_dtype")



_store = _ModelStore()

# ---------------------------------------------------------------------------
# Purchase / spending column constants (mirrors the training notebook)
# ---------------------------------------------------------------------------
_CAMPAIGN_COLS = [
    "AcceptedCmp1", "AcceptedCmp2", "AcceptedCmp3",
    "AcceptedCmp4", "AcceptedCmp5", "Response",
]
_PURCHASE_COLS = [
    "NumDealsPurchases", "NumWebPurchases",
    "NumCatalogPurchases", "NumStorePurchases",
]
_MNT_COLS = [
    "MntWines", "MntFruits", "MntMeatProducts",
    "MntFishProducts", "MntSweetProducts", "MntGoldProds",
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def predict(payload: CustomerFeatures) -> Dict[str, Any]:
    """Run regression + clustering on a single customer payload.

    Returns a dict ready for the ``PredictionResponse`` schema.
    """

    # --- 1. Build raw DataFrame for the regression pipeline ----------------
    raw = payload.model_dump()

    # Exclude optional Mnt fields from the regression input (they are
    # leakage features — the regression pipeline never saw them).
    regression_input = {
        k: v for k, v in raw.items() if k not in _MNT_COLS
    }
    df_reg = pd.DataFrame([regression_input])

    # --- 2. Predict Total Spending -----------------------------------------
    predicted_spending: float = float(
        _store.regression_pipeline.predict(df_reg)[0]
    )
    # Clamp to non-negative (spending can't be negative)
    predicted_spending = max(0.0, predicted_spending)

    # --- 3. Prepare features for clustering --------------------------------
    cluster_id = _run_clustering(raw, predicted_spending)

    # --- 4. Map cluster → segment + strategy --------------------------------
    info = SEGMENT_MAP.get(cluster_id, SEGMENT_MAP[3])

    return {
        "predicted_spending": round(predicted_spending, 2),
        "cluster_id": int(cluster_id),
        "customer_segment": info["segment"],
        "marketing_strategy": info["strategy"],
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _run_clustering(raw: Dict[str, Any], predicted_spending: float) -> int:
    """Engineer clustering features and predict the cluster.

    Faithfully reproduces the notebook's feature-engineering pipeline:
      1. Age = reference_year − Year_Birth
      2. TotalCampaignsAccepted = sum of campaign acceptance columns
      3. Total_Spent = *predicted_spending* (from the regression model)
      4. Education consolidation  ("2n Cycle" → "Master")
      5. Marital_Status consolidation (Together→Married, Absurd/YOLO/Alone→Single)
      6. Total_Children, Has_Children, Household_Size
      7. Total_Purchases = sum of purchase count columns
      8. MntXxx_Ratio = MntXxx / (Total_Spent + 1e-6)
      9. Drop raw Mnt columns, Kidhome, Teenhome, Marital_Status, purchase counts
     10. Select exactly ``d["num_features"] + d["cat_features"]``
     11. Transform via the saved preprocessor, predict via the saved KMeans
    """
    d = _store.clustering_bundle

    df = pd.DataFrame([raw])

    # --- derived features (step 1-3) --------------------------------------
    df["Age"] = d["reference_year"] - df["Year_Birth"]
    df["TotalCampaignsAccepted"] = df[_CAMPAIGN_COLS].sum(axis=1)
    df["Total_Spent"] = predicted_spending

    # --- categorical consolidation (step 4-5) ------------------------------
    df["Education"] = df["Education"].replace({"2n Cycle": "Master"})
    df["Marital_Status"] = df["Marital_Status"].replace({
        "Together": "Married",
        "Absurd": "Single",
        "YOLO": "Single",
        "Alone": "Single",
    })

    # --- household features (step 6) --------------------------------------
    df["Total_Children"] = df["Kidhome"] + df["Teenhome"]
    df["Has_Children"] = (df["Total_Children"] > 0).astype(int)
    adult_count = df["Marital_Status"].isin(["Married", "Together"]).astype(int) + 1
    df["Household_Size"] = adult_count + df["Total_Children"]

    # --- purchase total (step 7) -------------------------------------------
    df["Total_Purchases"] = df[_PURCHASE_COLS].sum(axis=1)

    # --- spending ratios (step 8) ------------------------------------------
    total_spent_safe = predicted_spending + 1e-6

    # If the caller provided actual Mnt breakdowns, compute real ratios;
    # otherwise fall back to equal-share (1/6 each).
    has_mnt = all(raw.get(c) is not None for c in _MNT_COLS)
    if has_mnt:
        for col in _MNT_COLS:
            df[col + "_Ratio"] = df[col] / total_spent_safe
    else:
        for col in _MNT_COLS:
            df[col + "_Ratio"] = 1.0 / len(_MNT_COLS)

    # --- select model features (step 10) -----------------------------------
    feature_cols = d["num_features"] + d["cat_features"]
    X_new = df[feature_cols]

    # --- predict cluster (step 11) -----------------------------------------
    X_transformed = d["preprocessor"].transform(X_new)
    cluster_id: int = int(d["model"].predict(X_transformed)[0])

    return cluster_id
