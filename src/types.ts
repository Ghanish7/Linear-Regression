export interface BostonRow {
  id: number;
  CRIM: number;
  ZN: number;
  INDUS: number;
  CHAS: number; // 0 or 1
  NOX: number;
  RM: number;
  AGE: number;
  DIS: number;
  RAD: number;
  TAX: number;
  PTRATIO: number;
  B: number;
  LSTAT: number;
  MEDV: number; // Median Value of owner-occupied homes (Target, in $1000s)
}

export interface DatasetStats {
  totalRows: number;
  featuresCount: number;
  targetName: string;
  missingValues: number;
}

export interface ModelMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface ModelCoefficients {
  feature: string;
  weight: number;
  correlation: number;
}

export type ModelType = 'linear' | 'ridge' | 'lasso';

export interface PreprocessingStats {
  trainSize: number;
  testSize: number;
  scaleBeforeMean: number;
  scaleBeforeStd: number;
  scaleAfterMean: number;
  scaleAfterStd: number;
}
