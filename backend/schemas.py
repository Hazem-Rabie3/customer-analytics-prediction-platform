"""Pydantic schemas for request validation and response serialization."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class CustomerFeatures(BaseModel):
    """Input payload representing a single customer's raw features.

    Field constraints are derived from the training data's observed ranges
    (see feature_schema.json).
    """

    Year_Birth: int = Field(
        ...,
        ge=1900,
        le=2010,
        description="Customer's birth year",
        examples=[1971],
    )
    Education: Literal[
        "2n Cycle", "Basic", "Graduation", "Master", "PhD"
    ] = Field(
        ...,
        description="Customer's education level",
        examples=["Master"],
    )
    Marital_Status: Literal[
        "Absurd", "Alone", "Divorced", "Married",
        "Single", "Together", "Widow", "YOLO",
    ] = Field(
        ...,
        description="Customer's marital status",
        examples=["Single"],
    )
    Income: Optional[float] = Field(
        None,
        ge=0,
        le=700_000,
        description="Customer's yearly household income (nullable)",
        examples=[33316.0],
    )
    Kidhome: int = Field(
        ...,
        ge=0,
        le=2,
        description="Number of small children in household",
        examples=[1],
    )
    Teenhome: int = Field(
        ...,
        ge=0,
        le=2,
        description="Number of teenagers in household",
        examples=[1],
    )
    Dt_Customer: str = Field(
        ...,
        pattern=r"^\d{2}-\d{2}-\d{4}$",
        description="Date of customer's enrollment (DD-MM-YYYY)",
        examples=["04-10-2013"],
    )
    Recency: int = Field(
        ...,
        ge=0,
        le=99,
        description="Number of days since last purchase",
        examples=[34],
    )
    NumDealsPurchases: int = Field(
        ...,
        ge=0,
        le=15,
        description="Number of purchases made with a discount",
        examples=[3],
    )
    NumWebPurchases: int = Field(
        ...,
        ge=0,
        le=27,
        description="Number of purchases made through the website",
        examples=[2],
    )
    NumCatalogPurchases: int = Field(
        ...,
        ge=0,
        le=28,
        description="Number of purchases made using a catalogue",
        examples=[1],
    )
    NumStorePurchases: int = Field(
        ...,
        ge=0,
        le=13,
        description="Number of purchases made directly in stores",
        examples=[4],
    )
    NumWebVisitsMonth: int = Field(
        ...,
        ge=0,
        le=20,
        description="Number of visits to company's website last month",
        examples=[6],
    )
    AcceptedCmp3: Literal[0, 1] = Field(
        ..., description="1 if accepted offer in campaign 3, else 0", examples=[0]
    )
    AcceptedCmp4: Literal[0, 1] = Field(
        ..., description="1 if accepted offer in campaign 4, else 0", examples=[0]
    )
    AcceptedCmp5: Literal[0, 1] = Field(
        ..., description="1 if accepted offer in campaign 5, else 0", examples=[0]
    )
    AcceptedCmp1: Literal[0, 1] = Field(
        ..., description="1 if accepted offer in campaign 1, else 0", examples=[0]
    )
    AcceptedCmp2: Literal[0, 1] = Field(
        ..., description="1 if accepted offer in campaign 2, else 0", examples=[0]
    )
    Complain: Literal[0, 1] = Field(
        ..., description="1 if customer complained in the last 2 years", examples=[0]
    )
    Response: Literal[0, 1] = Field(
        ..., description="1 if accepted offer in the last campaign", examples=[0]
    )

    # --- Optional spending breakdown for more accurate clustering ---------
    # If these are provided, the clustering model will compute real
    # per-category ratios. Otherwise, equal ratios (1/6) are assumed.
    MntWines: Optional[float] = Field(
        None, ge=0, description="Amount spent on wine products (last 2 years)"
    )
    MntFruits: Optional[float] = Field(
        None, ge=0, description="Amount spent on fruit products (last 2 years)"
    )
    MntMeatProducts: Optional[float] = Field(
        None, ge=0, description="Amount spent on meat products (last 2 years)"
    )
    MntFishProducts: Optional[float] = Field(
        None, ge=0, description="Amount spent on fish products (last 2 years)"
    )
    MntSweetProducts: Optional[float] = Field(
        None, ge=0, description="Amount spent on sweet products (last 2 years)"
    )
    MntGoldProds: Optional[float] = Field(
        None, ge=0, description="Amount spent on gold products (last 2 years)"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "Year_Birth": 1971,
                    "Education": "Master",
                    "Marital_Status": "Single",
                    "Income": 33316.0,
                    "Kidhome": 1,
                    "Teenhome": 1,
                    "Dt_Customer": "04-10-2013",
                    "Recency": 34,
                    "NumDealsPurchases": 3,
                    "NumWebPurchases": 2,
                    "NumCatalogPurchases": 1,
                    "NumStorePurchases": 4,
                    "NumWebVisitsMonth": 6,
                    "AcceptedCmp3": 0,
                    "AcceptedCmp4": 0,
                    "AcceptedCmp5": 0,
                    "AcceptedCmp1": 0,
                    "AcceptedCmp2": 0,
                    "Complain": 0,
                    "Response": 0,
                }
            ]
        }
    }


class PredictionResponse(BaseModel):
    """JSON response returned by the /api/predict endpoint."""

    predicted_spending: float = Field(
        ..., description="Predicted total spending (USD)", examples=[462.35]
    )
    cluster_id: int = Field(
        ..., ge=0, le=3, description="Cluster ID (0-3)", examples=[2]
    )
    customer_segment: str = Field(
        ...,
        description="Human-readable segment label",
        examples=["Stable Mid"],
    )
    marketing_strategy: str = Field(
        ...,
        description="Recommended marketing strategy for this segment",
    )
