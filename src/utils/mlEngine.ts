import { BostonRow, ModelMetrics, ModelCoefficients, ModelType, PreprocessingStats } from '../types';
import { bostonDataset } from '../data/bostonData';

/**
 * Deterministic Train/Test Split (80/20)
 * Records with id % 5 !== 0 (80 records) -> Train
 * Records with id % 5 === 0 (20 records) -> Test
 */
export function getTrainTestSplit(): { train: BostonRow[]; test: BostonRow[] } {
  const train: BostonRow[] = [];
  const test: BostonRow[] = [];
  
  bostonDataset.forEach(row => {
    if (row.id % 5 !== 0) {
      train.push(row);
    } else {
      test.push(row);
    }
  });

  return { train, test };
}

/**
 * Calculates mean and standard deviation of a feature in a dataset section
 */
export function getStats(data: BostonRow[], feature: keyof BostonRow): { mean: number; std: number } {
  const values = data.map(r => r[feature] as number);
  const n = values.length;
  if (n === 0) return { mean: 0, std: 1 };
  
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const std = Math.sqrt(variance) || 1;
  
  return { mean, std };
}

/**
 * Standardizes a value
 */
export function scaleValue(v: number, mean: number, std: number): number {
  return (v - mean) / std;
}

/**
 * Unstandardizes a value (for target MEDV)
 */
export function unscaleValue(scaled: number, mean: number, std: number): number {
  return (scaled * std) + mean;
}

/**
 * Fits a simple linear model: y = b0 + b1 * x
 * Supporting ordinary linear, ridge (L2), or lasso (L1) regularization
 * We scale x and y internally for stability (and to demonstrate standardization!)
 */
export function fitModel(
  trainData: BostonRow[],
  feature: keyof BostonRow,
  modelType: ModelType,
  alphaValue: number // alpha penalty (e.g. 0 to 10)
): {
  beta1: number; // raw coefficient
  beta0: number; // raw intercept
  weight: number; // scaled coefficient (for display/importance)
  correlation: number; // Pearson correlation coefficient
  xMean: number;
  xStd: number;
  yMean: number;
  yStd: number;
} {
  const X_raw = trainData.map(r => r[feature] as number);
  const y_raw = trainData.map(r => r.MEDV);
  const n = trainData.length;

  // Standardization params
  const { mean: xMean, std: xStd } = getStats(trainData, feature);
  const { mean: yMean, std: yStd } = getStats(trainData, 'MEDV');

  // Scale data
  const X_scaled = X_raw.map(x => scaleValue(x, xMean, xStd));
  const y_scaled = y_raw.map(y => scaleValue(y, yMean, yStd));

  // Compute pearson correlation on raw / scaled (it's identical)
  let sumProductDiff = 0;
  let sumXDiffSq = 0;
  let sumYDiffSq = 0;
  for (let i = 0; i < n; i++) {
    const xDiff = X_scaled[i]; // mean is 0
    const yDiff = y_scaled[i]; // mean is 0
    sumProductDiff += xDiff * yDiff;
    sumXDiffSq += xDiff * xDiff;
    sumYDiffSq += yDiff * yDiff;
  }
  const correlation = sumProductDiff / (Math.sqrt(sumXDiffSq) * Math.sqrt(sumYDiffSq) || 1);

  // Fit model: we minimize sum((y_scaled - w * X_scaled)^2) + penalty
  let w = 0;

  if (modelType === 'linear') {
    // Ordinary Least Squares
    // w = sum(X_scaled * y_scaled) / sum(X_scaled^2)
    // Since X_scaled is standardized, sum(X_scaled^2) is around N
    const numerator = X_scaled.reduce((sum, x, idx) => sum + x * y_scaled[idx], 0);
    const denominator = X_scaled.reduce((sum, x) => sum + x * x, 0) || 1;
    w = numerator / denominator;
  } else if (modelType === 'ridge') {
    // Ridge: w = sum(X_scaled * y_scaled) / (sum(X_scaled^2) + alpha)
    // We adjust alpha scale so it performs visible shrinking on our small N
    const numerator = X_scaled.reduce((sum, x, idx) => sum + x * y_scaled[idx], 0);
    const denominator = (X_scaled.reduce((sum, x) => sum + x * x, 0)) + (alphaValue * 4.0);
    w = numerator / denominator;
  } else if (modelType === 'lasso') {
    // Lasso Soft Thresholding
    // Objective: min 0.5 * sum((y_scaled - w * X_scaled)^2) + alpha*|w|
    // For single standardized feature: w_lasso = sign(w_ols) * max(0, |w_ols| - alpha / sum(x^2))
    const numerator = X_scaled.reduce((sum, x, idx) => sum + x * y_scaled[idx], 0);
    const denominator = X_scaled.reduce((sum, x) => sum + x * x, 0) || 1;
    const w_ols = numerator / denominator;
    
    const penaltyRatio = (alphaValue * 15.0) / denominator; // Scale alpha appropriately for display
    const abs_w_ols = Math.abs(w_ols);
    const sign = w_ols >= 0 ? 1 : -1;
    
    w = sign * Math.max(0, abs_w_ols - penaltyRatio);
  }

  // Convert scaled weight back to original scale coefficients:
  // y_scaled = w * x_scaled 
  // => (y - yMean) / yStd = w * (x - xMean) / xStd
  // => y = w * (yStd / xStd) * x + [ yMean - w * (yStd / xStd) * xMean ]
  const beta1 = w * (yStd / xStd);
  const beta0 = yMean - (beta1 * xMean);

  return {
    beta1,
    beta0,
    weight: w,
    correlation,
    xMean,
    xStd,
    yMean,
    yStd
  };
}

/**
 * Evaluate the linear model on a dataset
 */
export function evaluateModel(
  data: BostonRow[],
  feature: keyof BostonRow,
  beta1: number,
  beta0: number
): {
  metrics: ModelMetrics;
  predictions: { id: number; actual: number; predicted: number; residual: number; x: number }[];
} {
  const n = data.length;
  let sse = 0; // Sum of squared errors
  let sae = 0; // Sum of absolute errors
  let sst = 0; // Total sum of squares (sum((y - mean_y)^2))
  
  // Calculate average y
  const yValues = data.map(r => r.MEDV);
  const meanY = yValues.reduce((sum, v) => sum + v, 0) / n;

  const predictions = data.map(row => {
    const x = row[feature] as number;
    const actual = row.MEDV;
    const predicted = (beta1 * x) + beta0;
    const residual = actual - predicted;

    sse += Math.pow(residual, 2);
    sae += Math.abs(residual);
    sst += Math.pow(actual - meanY, 2);

    return {
      id: row.id,
      actual,
      predicted,
      residual,
      x
    };
  });

  const mse = sse / n;
  const rmse = Math.sqrt(mse);
  const mae = sae / n;
  
  // R2 = 1 - (SSE / SST)
  const r2 = sst === 0 ? 0 : 1 - (sse / sst);

  return {
    metrics: {
      mse,
      rmse,
      mae,
      r2
    },
    predictions
  };
}

/**
 * Returns static stats about pre-processing steps
 */
export function getPreprocessingStats(
  feature: keyof BostonRow
): PreprocessingStats {
  const { train, test } = getTrainTestSplit();
  const { mean, std } = getStats(train, feature);
  
  // Hardcoded values or dynamic calculation to show standard scaler before/after
  return {
    trainSize: train.length,
    testSize: test.length,
    scaleBeforeMean: parseFloat(mean.toFixed(4)),
    scaleBeforeStd: parseFloat(std.toFixed(4)),
    scaleAfterMean: 0.0, // Scaled mean is always 0
    scaleAfterStd: 1.0   // Scaled std dev is always 1
  };
}
