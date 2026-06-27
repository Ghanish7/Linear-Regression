import React, { useMemo } from 'react';
import { BostonRow, ModelType } from '../types';
import { getTrainTestSplit, evaluateModel } from '../utils/mlEngine';
import { AreaChart, TrendingUp, HelpCircle, CheckCircle, Info } from 'lucide-react';

interface ModelEvaluationProps {
  activeFeature: keyof BostonRow;
  beta1: number;
  beta0: number;
  hasTrained: boolean;
  modelType: ModelType;
}

export default function ModelEvaluation({
  activeFeature,
  beta1,
  beta0,
  hasTrained,
  modelType
}: ModelEvaluationProps) {
  const { test } = getTrainTestSplit();

  // Evaluate the trained regression line on the test partition
  const evalResults = useMemo(() => {
    return evaluateModel(test, activeFeature, beta1, beta0);
  }, [test, activeFeature, beta1, beta0]);

  const { metrics, predictions } = evalResults;

  // Determine R2 status badge colors
  const r2ColorClass = useMemo(() => {
    if (metrics.r2 > 0.7) {
      return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Excellent Fit (> 0.7)' };
    } else if (metrics.r2 >= 0.5) {
      return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Moderate Fit (0.5 - 0.7)' };
    } else {
      return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Weak Fit (< 0.5)' };
    }
  }, [metrics.r2]);

  // Actual vs Predicted Chart math helpers
  const actualVsPredPoints = useMemo(() => {
    if (predictions.length === 0) return [];
    const actuals = predictions.map(p => p.actual);
    const predicteds = predictions.map(p => p.predicted);

    // Dynamic bounding coordinates
    const minVal = Math.min(...actuals, ...predicteds) * 0.9;
    const maxVal = Math.max(...actuals, ...predicteds) * 1.1;

    return {
      points: predictions,
      min: Math.max(0, minVal),
      max: maxVal
    };
  }, [predictions]);

  // Residual Plot math helpers
  const residualPoints = useMemo(() => {
    if (predictions.length === 0) return [];
    const predicteds = predictions.map(p => p.predicted);
    const residuals = predictions.map(p => p.residual);

    const minX = Math.min(...predicteds) * 0.95;
    const maxX = Math.max(...predicteds) * 1.05;
    const absMaxResidual = Math.max(...residuals.map(Math.abs)) || 1.0;

    return {
      points: predictions,
      minX: Math.max(0, minX),
      maxX,
      minY: -absMaxResidual * 1.1,
      maxY: absMaxResidual * 1.1
    };
  }, [predictions]);

  return (
    <section id="section-metrics" className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 scroll-mt-20">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <AreaChart className="w-4 h-4" /> Evaluating Generalization Performance
        </span>
        <h2 className="text-xl md:text-2xl text-white font-sans font-bold tracking-tight mt-1">
          ML Pipeline Stage 05: Evaluation Metrics
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          See general regression performance assessed on the 20 Testing records.
        </p>
      </div>

      {hasTrained ? (
        <div className="space-y-8">
          {/* Metrics list */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="evaluation-metrics-cards">
            {/* R2 Score Card */}
            <div className={`p-4 rounded-xl border ${r2ColorClass.bg} ${r2ColorClass.border} flex flex-col justify-between font-mono gap-1`}>
              <div>
                <span className="text-[10px] text-slate-405 block">R² SCORE (COEFF OF DET)</span>
                <strong className={`text-xl md:text-2xl font-bold ${r2ColorClass.text} block mt-1`} id="metrics-r2">
                  {metrics.r2.toFixed(4)}
                </strong>
              </div>
              <span className={`text-[9px] ${r2ColorClass.text} uppercase font-bold tracking-wide mt-1`}>
                {r2ColorClass.label}
              </span>
            </div>

            {/* MSE Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">MEAN SQUARED ERROR (MSE)</span>
                <strong className="text-xl md:text-2xl font-bold text-slate-200 block mt-1" id="metrics-mse">
                  {metrics.mse.toFixed(4)}
                </strong>
              </div>
              <span className="text-[9px] text-slate-550 uppercase font-medium mt-1">
                Sum of Squared Errors / N
              </span>
            </div>

            {/* RMSE Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">ROOT MEAN SQUARED ERROR</span>
                <strong className="text-xl md:text-2xl font-bold text-sky-450 block mt-1" id="metrics-rmse">
                  {metrics.rmse.toFixed(4)}
                </strong>
              </div>
              <span className="text-[9px] text-sky-450 uppercase font-medium mt-1">
                Avg deviation: ±${(metrics.rmse).toFixed(2)}k
              </span>
            </div>

            {/* MAE Score Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">MEAN ABSOLUTE ERROR (MAE)</span>
                <strong className="text-xl md:text-2xl font-bold text-purple-400 block mt-1" id="metrics-mae">
                  {metrics.mae.toFixed(4)}
                </strong>
              </div>
              <span className="text-[9px] text-purple-400 uppercase font-medium mt-1">
                Average Absolute housing error
              </span>
            </div>
          </div>

          {/* Evaluation Plots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plot 1: Actual vs Predicted */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                🎯 Residual clustering: Actual vs. Predicted values
              </h3>

              <div className="relative w-full h-[220px]" id="evaluation-actualpred-plot">
                <svg viewBox="0 0 500 220" className="w-full h-full text-slate-700 bg-transparent overflow-visible">
                  {/* Axes & bounds */}
                  <line x1="45" y1="15" x2="45" y2="185" stroke="#334155" strokeWidth="1" />
                  <line x1="45" y1="185" x2="480" y2="185" stroke="#334155" strokeWidth="1" />

                  {/* Ideal diagonal (Actual = Predicted) */}
                  {actualVsPredPoints.min !== undefined && (
                    <line
                      x1="45"
                      y1="185"
                      x2="480"
                      y2="15"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      className="opacity-70 animate-pulse"
                    />
                  )}

                  {/* Scatter test points */}
                  {actualVsPredPoints.points && actualVsPredPoints.points.map((pt, idx) => {
                    const paddingLeft = 45;
                    const paddingRight = 480;
                    const paddingTop = 15;
                    const paddingBottom = 185;

                    const range = actualVsPredPoints.max - actualVsPredPoints.min || 1;

                    // Normalize predictions
                    const cx = paddingLeft + ((pt.predicted - actualVsPredPoints.min) / range) * (paddingRight - paddingLeft);
                    const cy = paddingBottom - ((pt.actual - actualVsPredPoints.min) / range) * (paddingBottom - paddingTop);

                    return (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r="5"
                        className="fill-sky-400 stroke-slate-950 stroke-[0.8] cursor-pointer hover:r-7 transition-all opacity-85"
                      >
                        <title>{`Test ID ${pt.id}: Actual=$${pt.actual.toFixed(1)}k, Predicted=$${pt.predicted.toFixed(1)}k, Err=$${pt.residual.toFixed(1)}k`}</title>
                      </circle>
                    );
                  })}

                  {/* Chart axis numbers */}
                  <text x="18" y="20" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">${actualVsPredPoints.max?.toFixed(1)}k</text>
                  <text x="18" y="105" className="fill-slate-550 font-mono text-[9px]" textAnchor="end">Actual Prices (y)</text>
                  <text x="18" y="185" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">${actualVsPredPoints.min?.toFixed(1)}k</text>

                  <text x="45" y="202" className="fill-slate-500 font-mono text-[9px]" textAnchor="start">${actualVsPredPoints.min?.toFixed(1)}k</text>
                  <text x="260" y="212" className="fill-slate-450 font-mono text-[9px]" textAnchor="middle">Predicted Median Values (ŷ)</text>
                  <text x="480" y="202" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">${actualVsPredPoints.max?.toFixed(1)}k</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-550 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-4 border-t border-dashed border-emerald-500 h-0.5 inline-block"></span>
                  Ideal Regression Diagonal (y = ŷ)
                </span>
                <span className="text-[10px] text-slate-500">Points closer to diagonal represent smaller errors.</span>
              </div>
            </div>

            {/* Plot 2: Residuals Plot */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                🔍 Residual Analysis: error vs predicted value
              </h3>

              <div className="relative w-full h-[220px]" id="evaluation-residuals-plot">
                <svg viewBox="0 0 500 220" className="w-full h-full text-slate-700 bg-transparent overflow-visible">
                  {/* Axes & reference bounds */}
                  <line x1="45" y1="15" x2="45" y2="185" stroke="#334155" strokeWidth="1" />
                  <line x1="45" y1="185" x2="480" y2="185" stroke="#334155" strokeWidth="1" />

                  {/* Horizontal zero reference line (No residual error) */}
                  <line x1="45" y1="100" x2="480" y2="100" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />

                  {/* Scatter error points */}
                  {residualPoints.points && residualPoints.points.map((pt, idx) => {
                    const paddingLeft = 45;
                    const paddingRight = 480;
                    const paddingTop = 15;
                    const paddingBottom = 185;

                    const rangeX = residualPoints.maxX - residualPoints.minX || 1;
                    const rangeY = residualPoints.maxY - residualPoints.minY || 1;

                    // Normalize X (Predicted value)
                    const cx = paddingLeft + ((pt.predicted - residualPoints.minX) / rangeX) * (paddingRight - paddingLeft);
                    // Normalize Y (Residual Error value)
                    // residualPoints minY is negative, maxY is positive, centered
                    const cy = paddingBottom - ((pt.residual - residualPoints.minY) / rangeY) * (paddingBottom - paddingTop);

                    return (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r="4.5"
                        className="fill-purple-400 stroke-slate-950 stroke-[0.8] cursor-pointer hover:r-6.5 transition-all opacity-85"
                      >
                        <title>{`Test ID ${pt.id}: Predicted=$${pt.predicted.toFixed(1)}k, Residual=$${pt.residual.toFixed(2)}k`}</title>
                      </circle>
                    );
                  })}

                  {/* Axes values */}
                  <text x="18" y="20" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">+{residualPoints.maxY?.toFixed(1)}k</text>
                  <text x="18" y="103" className="fill-rose-500 font-mono text-[9px]" textAnchor="end">0 Err</text>
                  <text x="18" y="185" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">{residualPoints.minY?.toFixed(1)}k</text>

                  <text x="45" y="202" className="fill-slate-500 font-mono text-[9px]" textAnchor="start">${residualPoints.minX?.toFixed(1)}k</text>
                  <text x="260" y="212" className="fill-slate-450 font-mono text-[9px]" textAnchor="middle">Fitted values (ŷ)</text>
                  <text x="480" y="202" className="fill-slate-500 font-mono text-[9px]" textAnchor="end">${residualPoints.maxX?.toFixed(1)}k</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-550 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-4 border-t border-dashed border-rose-500 h-0.5 inline-block"></span>
                  Baseline (Zero Error)
                </span>
                <span className="text-[10px] text-slate-500">Residuals randomized about zero suggest a clean linear dataset fit.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 p-12 text-center rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-600 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider font-mono">Awaiting regression calculations</h3>
            <p className="text-xs text-slate-500">Train the estimator in Pipeline Stage 04 above to map live test performance residuals.</p>
          </div>
        </div>
      )}
    </section>
  );
}
