import React from 'react';
import { BostonRow } from '../types';
import { getStats, getTrainTestSplit, scaleValue } from '../utils/mlEngine';
import { ShieldCheck, Scale, Split, Info } from 'lucide-react';

interface PreprocessingProps {
  activeFeature: keyof BostonRow;
}

export default function Preprocessing({ activeFeature }: PreprocessingProps) {
  const { train, test } = getTrainTestSplit();
  const { mean, std } = getStats(train, activeFeature);

  // Take first 3 rows of training set for standardization example
  const samples = train.slice(0, 3);

  return (
    <section id="section-preprocessing" className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 scroll-mt-20">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          🧹 Preparing Data for Linear Estimator
        </span>
        <h2 className="text-xl md:text-2xl text-white font-sans font-bold tracking-tight mt-1">
          ML Pipeline Stage 02: Preprocessing
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Examine standard scaling data transformations and partitions necessary for OLS, Ridge, and Lasso parameters.
        </p>
      </div>

      {/* Row of steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="preprocessing-steps-grid">
        {/* Step 1 */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="w-9 h-9 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            1. Missing Values Handling
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Machine learning estimators throw exceptions if input rows contain NaNs or missing elements. We scan all columns: 0 nulls detected. No imputation is necessary.
          </p>
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 rounded border border-emerald-500/20">
            Status: Fully Cleaned
          </span>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="w-9 h-9 rounded bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-450">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            2. Feature Scaling (StandardScaler)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Variables have different scales (e.g. rooms range from 3-9; taxes from 180-700). We standardize features to have mean μ=0 and standard dev σ=1 to prevent large values from skewing gradients.
          </p>
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono text-sky-400 bg-sky-500/5 rounded border border-sky-500/20">
            Formula: (x - μ) / σ
          </span>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="w-9 h-9 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
            <Split className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            3. Train / Test Split (80/20)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            To prevent overfitting, we split data into an 80% Training set (fitting parameters β₀ and β₁) and a 20% Testing set (assessing final generalization performance).
          </p>
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono text-purple-400 bg-purple-500/5 rounded border border-purple-500/20">
            Ratio: 80 Train / 20 Test split
          </span>
        </div>
      </div>

      {/* Before / After Scaling Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Scaling Details Table */}
        <div className="lg:col-span-8 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              ⚖️ Live StandardScaler comparison: feature key &quot;{activeFeature}&quot;
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Calculated on 80 Training rows</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-3 text-slate-300">House Sample</th>
                  <th className="p-3 text-red-400">Raw Input (Unscaled)</th>
                  <th className="p-3 text-slate-400">Dataset Mean (μ)</th>
                  <th className="p-3 text-slate-400">Dataset StdDev (σ)</th>
                  <th className="p-3 text-emerald-400 bg-emerald-500/5">Standardized Value (Z-Score)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {samples.map((row, index) => {
                  const rawVal = row[activeFeature] as number;
                  const scaledVal = scaleValue(rawVal, mean, std);
                  return (
                    <tr key={row.id} className="hover:bg-slate-905">
                      <td className="p-3 text-slate-300">House Row #{row.id}</td>
                      <td className="p-3 text-red-400 font-semibold">{rawVal.toFixed(3)}</td>
                      <td className="p-3 text-slate-405">{mean.toFixed(4)}</td>
                      <td className="p-3 text-slate-405">{std.toFixed(4)}</td>
                      <td className="p-3 text-emerald-400 bg-emerald-500/5 font-bold">
                        {scaledVal >= 0 ? '+' : ''}{scaledVal.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-2.5 bg-slate-900/50 rounded text-[10px] text-slate-400 leading-normal flex gap-1.5 items-start">
            <Info className="w-3.5 h-3.5 shrink-0 text-sky-400 mt-0.5" />
            <span>Standardizing translates inputs into standard deviations from the dataset average. For example, a Z-score of <strong className="text-white">+1.20</strong> means that sample&apos;s variable is 1.20 standard deviations above the average Boston housing record. This bounds weights stably!</span>
          </div>
        </div>

        {/* Train/Test Split Graphic readout */}
        <div className="lg:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 text-center">
          <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-widest text-left">
            🔀 Dataset Split metrics
          </h3>

          <div className="flex h-12 w-full rounded-lg overflow-hidden border border-slate-800">
            <div 
              className="bg-emerald-500/20 text-emerald-400 border-r border-emerald-500/40 font-mono text-xs font-bold flex items-center justify-center transition-all hover:bg-emerald-500/30"
              style={{ width: '80%' }}
            >
              80% Train
            </div>
            <div 
              className="bg-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center transition-all hover:bg-purple-500/30"
              style={{ width: '20%' }}
            >
              20% Test
            </div>
          </div>

          <div className="text-left font-mono text-xs space-y-2 border-t border-slate-900 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Training Partition Size:</span>
              <strong className="text-emerald-400">{train.length} houses</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Testing Partition Size:</span>
              <strong className="text-purple-400">{test.length} houses</strong>
            </div>
            <div className="flex items-center justify-between border-t border-slate-900 pt-2">
              <span className="text-slate-500">Target Feature column:</span>
              <strong className="text-white">MEDV ($1000s)</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
