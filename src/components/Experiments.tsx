import React from 'react';
import { BostonRow, ModelType } from '../types';
import { fitModel, evaluateModel, getTrainTestSplit } from '../utils/mlEngine';
import { Sliders, Shield, Scale, Grid, HelpCircle } from 'lucide-react';

interface ExperimentsProps {
  activeFeature: keyof BostonRow;
  modelType: ModelType;
  setModelType: (type: ModelType) => void;
  alphaValue: number;
  setAlphaValue: (val: number) => void;
}

export default function Experiments({
  activeFeature,
  modelType,
  setModelType,
  alphaValue,
  setAlphaValue
}: ExperimentsProps) {
  const { train, test } = getTrainTestSplit();

  // Calculate live statistics for all three models side-by-side to render comparison table
  const olsParams = fitModel(train, activeFeature, 'linear', 0);
  const olsEval = evaluateModel(test, activeFeature, olsParams.beta1, olsParams.beta0);

  const ridgeParams = fitModel(train, activeFeature, 'ridge', alphaValue);
  const ridgeEval = evaluateModel(test, activeFeature, ridgeParams.beta1, ridgeParams.beta0);

  const lassoParams = fitModel(train, activeFeature, 'lasso', alphaValue);
  const lassoEval = evaluateModel(test, activeFeature, lassoParams.beta1, lassoParams.beta0);

  return (
    <section id="section-experiments" className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 scroll-mt-20">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="w-4 h-4" /> Machine Learning Regularization Lab
        </span>
        <h2 className="text-xl md:text-2xl text-white font-sans font-bold tracking-tight mt-1">
          ML Pipeline Stage 07: Regularization Experiments
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Benchmark Plain Ordinary Least Squares against L1 Lasso and L2 Ridge regularization methods interactively.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left column: Controls & Sliders */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              🎮 Experiment Control Board
            </h3>

            {/* Model Type Selector Toggles */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-405 font-mono">1. Select Active Estimator</label>
              <div className="grid grid-cols-3 gap-2" id="experiments-type-toggles">
                {(['linear', 'ridge', 'lasso'] as ModelType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setModelType(type)}
                    className={`px-3 py-2 text-[11px] font-mono font-bold uppercase rounded-lg border transition-all ${
                      modelType === type
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold'
                        : 'text-slate-400 hover:text-white bg-slate-900 border-slate-850'
                    }`}
                  >
                    {type === 'linear' ? 'Plain OLS' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Alpha Penalty weight Slider */}
            {modelType !== 'linear' ? (
              <div className="space-y-2 border-t border-slate-900 pt-4 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Regularization Penalty Strength (Alpha α):</span>
                  <strong className="text-emerald-400 font-bold text-sm bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/20 rounded">
                    α = {alphaValue.toFixed(1)}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={alphaValue}
                  onChange={(e) => setAlphaValue(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                  id="slider-alpha"
                />
                <div className="flex justify-between text-[10px] text-slate-605">
                  <span>Weak Penalty (0.1)</span>
                  <span>Moderate (5.0)</span>
                  <span>Severe Penalty (10.0)</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-900/40 rounded-lg border border-slate-850 text-[10.5px] text-slate-500 font-mono leading-relaxed" id="ols-penalty-disabled">
                ℹ️ Regularization penalty is disabled for Plain OLS Linear models. Switch to **Ridge** or **Lasso** toggles above to adjust penalty alpha coefficients.
              </div>
            )}

            {/* Model Explanation */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-850 space-y-2 text-xs leading-normal text-slate-400">
              <h4 className="font-mono text-slate-200 font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> Regularization Explained
              </h4>
              <p className="text-[11px]" id="experiments-explanation">
                Regularization avoids overfitting by penalizing high-value slopes during training.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong className="text-white">L2 Ridge</strong> shrinks slopes smoothly. It reduces noisy outliers without removing them entirely.</li>
                <li><strong className="text-white">L1 Lasso</strong> shrinks parameters aggressively to absolute zero. Lasso acts as an automated feature-elimination tool.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right column: Comparison Tables */}
        <div className="xl:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              📊 Real-time side-by-side benchmark comparison
            </h3>
            <span className="text-[10px] font-mono text-slate-555">Recalculates on change</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg" id="comparison-benchmark-table">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-405">
                  <th className="p-3">Model Estimator</th>
                  <th className={`p-3 text-center ${modelType === 'linear' ? 'bg-emerald-500/5 text-emerald-400 font-bold border-l border-r border-emerald-500/20' : 'text-slate-300'}`}>
                    1. Plain OLS Linear
                  </th>
                  <th className={`p-3 text-center ${modelType === 'ridge' ? 'bg-emerald-500/5 text-emerald-400 font-bold border-l border-r border-emerald-500/20' : 'text-slate-300'}`}>
                    2. Ridge (L2 Penalty)
                  </th>
                  <th className={`p-3 text-center ${modelType === 'lasso' ? 'bg-emerald-500/5 text-emerald-400 font-bold border-l border-r border-emerald-500/20' : 'text-slate-300'}`}>
                    3. Lasso (L1 Penalty)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-[11px] text-slate-300">
                {/* Penalty parameter Row */}
                <tr className="hover:bg-slate-900/20">
                  <td className="p-3 font-semibold text-slate-400">Regularization Weight (α)</td>
                  <td className={`p-3 text-center ${modelType === 'linear' ? 'bg-emerald-500/5' : ''}`}>0.0 (unregularized)</td>
                  <td className={`p-3 text-center font-bold ${modelType === 'ridge' ? 'bg-emerald-500/5 text-emerald-400' : ''}`}>α = {alphaValue.toFixed(1)}</td>
                  <td className={`p-3 text-center font-bold ${modelType === 'lasso' ? 'bg-emerald-500/5 text-emerald-400' : ''}`}>α = {alphaValue.toFixed(1)}</td>
                </tr>

                {/* R2 Row */}
                <tr className="hover:bg-slate-900/20">
                  <td className="p-3 font-semibold text-slate-400">R² Accuracy (higher is better)</td>
                  <td className={`p-3 text-center ${modelType === 'linear' ? 'bg-emerald-500/5 font-bold text-emerald-450' : ''}`}>{olsEval.metrics.r2.toFixed(4)}</td>
                  <td className={`p-3 text-center ${modelType === 'ridge' ? 'bg-emerald-500/5 font-extrabold text-emerald-400' : ''}`}>{ridgeEval.metrics.r2.toFixed(4)}</td>
                  <td className={`p-3 text-center ${modelType === 'lasso' ? 'bg-emerald-500/5 font-extrabold text-emerald-400' : ''}`}>{lassoEval.metrics.r2.toFixed(4)}</td>
                </tr>

                {/* MSE Row */}
                <tr className="hover:bg-slate-900/20">
                  <td className="p-3 font-semibold text-slate-400">Mean Squared Error (lower is better)</td>
                  <td className={`p-3 text-center ${modelType === 'linear' ? 'bg-emerald-500/5 text-slate-105 font-bold' : ''}`}>{olsEval.metrics.mse.toFixed(3)}</td>
                  <td className={`p-3 text-center ${modelType === 'ridge' ? 'bg-emerald-500/5 text-slate-105 font-bold' : ''}`}>{ridgeEval.metrics.mse.toFixed(3)}</td>
                  <td className={`p-3 text-center ${modelType === 'lasso' ? 'bg-emerald-500/5 text-slate-105 font-bold' : ''}`}>{lassoEval.metrics.mse.toFixed(3)}</td>
                </tr>

                {/* Coefficient Weight Row */}
                <tr className="hover:bg-slate-900/20">
                  <td className="p-3 font-semibold text-slate-400">Coefficient Weight (β₁ unscaled)</td>
                  <td className={`p-3 text-center ${modelType === 'linear' ? 'bg-emerald-500/5' : ''}`}>{olsParams.beta1.toFixed(3)}</td>
                  <td className={`p-3 text-center font-bold ${modelType === 'ridge' ? 'bg-emerald-500/5 text-sky-400' : 'text-sky-500/70'}`}>{ridgeParams.beta1.toFixed(3)}</td>
                  <td className={`p-3 text-center font-bold ${modelType === 'lasso' ? 'bg-emerald-500/5 text-purple-400' : 'text-purple-500/70'}`}>
                    {Math.abs(lassoParams.beta1) < 1e-5 ? '0.000 (sparsity reached)' : lassoParams.beta1.toFixed(3)}
                  </td>
                </tr>

                {/* Intercept Row */}
                <tr className="hover:bg-slate-900/20">
                  <td className="p-3 font-semibold text-slate-400">Intercept Variable (β₀)</td>
                  <td className={`p-3 text-center ${modelType === 'linear' ? 'bg-emerald-500/5' : ''}`}>{olsParams.beta0.toFixed(2)}</td>
                  <td className={`p-3 text-center ${modelType === 'ridge' ? 'bg-emerald-500/5' : ''}`}>{ridgeParams.beta0.toFixed(2)}</td>
                  <td className={`p-3 text-center ${modelType === 'lasso' ? 'bg-emerald-500/5' : ''}`}>{lassoParams.beta0.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SparseIntrusion helper */}
          {modelType === 'lasso' && Math.abs(lassoParams.beta1) < 1e-5 && (
            <div className="p-3.5 bg-rose-500/10 rounded-lg text-[10px] text-rose-400 border border-rose-500/20 font-mono leading-relaxed" id="lasso-sparsity-notification">
              🔥 <strong className="text-white">Lasso Feature Sparsity Reached!</strong> The penalty weight α is set high enough that Lasso has shrunk the feature&apos;s coefficient to **exactly zero**. This eliminates {activeFeature} as a predictor: outputting a flat-average baseline price line (β₀).
            </div>
          )}

          {modelType === 'ridge' && (
            <div className="p-3.5 bg-emerald-500/5 rounded-lg text-[10px] text-emerald-400 border border-emerald-500/10 font-mono leading-relaxed" id="ridge-decay-notification">
              🛡️ <strong className="text-white">Ridge Slope Attenuation Active!</strong> Notice that as you scale the penalty higher, the coefficient β₁ decays asymptoticly toward zero, but and stays non-zero, avoiding abrupt feature elimination.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
