export type EducationLevel =
  | "2n Cycle"
  | "Basic"
  | "Graduation"
  | "Master"
  | "PhD";

export type MaritalStatus =
  | "Absurd"
  | "Alone"
  | "Divorced"
  | "Married"
  | "Single"
  | "Together"
  | "Widow"
  | "YOLO";

export interface CustomerData {
  Year_Birth: number;
  Education: EducationLevel;
  Marital_Status: MaritalStatus;
  Income: number | null;
  Kidhome: number;
  Teenhome: number;
  Dt_Customer: string; // DD-MM-YYYY
  Recency: number;
  NumDealsPurchases: number;
  NumWebPurchases: number;
  NumCatalogPurchases: number;
  NumStorePurchases: number;
  NumWebVisitsMonth: number;
  AcceptedCmp1: 0 | 1;
  AcceptedCmp2: 0 | 1;
  AcceptedCmp3: 0 | 1;
  AcceptedCmp4: 0 | 1;
  AcceptedCmp5: 0 | 1;
  Response: 0 | 1;
  Complain: 0 | 1;
}

export interface PredictionResult {
  predicted_spending: number;
  cluster_id: 0 | 1 | 2 | 3 | number;
  customer_segment: string;
  marketing_strategy: string;
}
