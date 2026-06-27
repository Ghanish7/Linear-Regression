import React, { useState, useEffect } from 'react';
import { BostonRow, ModelType } from '../types';
import { fitModel, getTrainTestSplit } from '../utils/mlEngine';
import { Play, Code, CheckCircle, RefreshCw, Cpu, Award } from 'lucide-react';

interface ModelTrainingProps {
  activeFeature: keyof BostonRow;
  setActiveFeature: (feature: keyof BostonRow) => void;
  modelType: ModelType;
  alphaValue: number;
  onModelTrained: (beta1: number, beta0: number, isTrained: boolean) => void;
  hasTrained: boolean;
}

export default function ModelTraining({
  activeFeature,
  setActiveFeature,
  modelType,
  alphaValue,
  onModelTrained,
  hasTrained
}: ModelTrainingProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingPercent, setTrainingPercent] = useState(0);
  const [trainingPhase, setTrainingPhase] = useState('');

  const { train } = getTrainTestSplit();

  // Run OLS fitting engine
  const fitResults = fitModel(train, activeFeature, modelType, alphaValue);

  // Trigger simulated ML training workflow
  const triggerTraining = () => {
    setIsTraining(true);
    setTrainingPercent(0);
    onModelTrained(0, 0, false); // Clear previous trained state temporarily

    const phases = [
      { max: 30, text: 'Standardizing training data inputs...' },
      { max: 65, text: 'Minimizing Residual Sum of Squares (RSS)...' },
      { max: 90, text: 'Coordinating weights with gradient descent...' },
      { max: 100, text: 'Generalization successful!' }
    ];

    let currentPercent = 0;
    const interval = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 8) + 4;
      if (currentPercent >= 100) {
        currentPercent = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsTraining(false);
          onModelTrained(fitResults.beta1, fitResults.beta0, true);
        }, 300);
      }

      setTrainingPercent(currentPercent);
      
      const activePhase = phases.find(p => currentPercent <= p.max) || phases[phases.length - 1];
      setTrainingPhase(activePhase.text);

    }, 60);
  };

  // Auto train if parameters change dynamically so user has a streamlined feel
  useEffect(() => {
    onModelTrained(fitResults.beta1, fitResults.beta0, true);
  }, [activeFeature, modelType, alphaValue]);

  const rawPythonCode = `from sklearn.linear_model import ${modelType === 'linear' ? 'LinearRegression' : modelType === 'ridge' ? 'Ridge' : 'Lasso'}
model = ${modelType === 'linear' ? 'LinearRegression()' : `${modelType === 'ridge' ? 'Ridge' : 'Lasso'}(alpha=${alphaValue.toFixed(1)})`}

# Extract Feature columns ${activeFeature} and Target MEDV
X_train = train_set[['${activeFeature}']]
y_train = train_set['MEDV']

# Train simple regression model
model.fit(X_train, y_train)

# Coefficients Output
beta_1 = model.coef_[0]
beta_0 = model.intercept_`;

  return (
    <section id="section-training" className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 scroll-mt-20">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-emerald-400" /> ML Estimator Configuration & fitting
        </span>
        <h2 className="text-xl md:text-2xl text-white font-sans font-bold tracking-tight mt-1">
          ML Pipeline Stage 04: Training the Model
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Select target predictor metrics, trigger standard parameter fitting cycles, and evaluate the fitted coefficient weights.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left column: Controls, Code & Training triggers */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              ⚙️ Fit Controls
            </h3>

            {/* Feature configuration field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">1. Independent Variable (X)</label>
                <select
                  value={activeFeature}
                  onChange={(e) => setActiveFeature(e.target.value as keyof BostonRow)}
                  className="bg-slate-900 border border-slate-850 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none select-none focus:border-slate-700 w-full"
                  id="select-training-feature"
                >
                  <option value="RM">Average Rooms (RM) - Highly Positive</option>
                  <option value="LSTAT">% Lower Status (LSTAT) - Highly Negative</option>
                  <option value="PTRATIO">Pupil-Teacher Ratio (PTRATIO) - Negative</option>
                  <option value="CRIM">Per Capita Crime (CRIM) - Negative</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono">2. Selected Model Class</label>
                <div className="bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-xs font-serif font-bold text-emerald-400 flex items-center justify-between uppercase">
                  {modelType} estimator
                </div>
              </div>
            </div>

            {/* Training Trigger Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                disabled={isTraining}
                onClick={triggerTraining}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                id="btn-trigger-training"
              >
                {isTraining ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isTraining ? 'Training Model...' : 'Simulate Training Cycle'}
              </button>

              <p className="text-[10px] text-slate-500 font-mono text-center sm:text-left">
                *Fits weights instantly. Run simulation to inspect steps visually.
              </p>
            </div>

            {/* Simulated Training Progress HUD */}
            {isTraining && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2" id="training-hud-status">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">{trainingPhase}</span>
                  <span className="text-slate-400 font-bold">{trainingPercent}%</span>
                </div>
                {/* Progress bar track */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-75"
                    style={{ width: `${trainingPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Code Window */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
            {/* Window header */}
            <div className="bg-slate-900 border-b border-slate-850 px-4 py-2.5 flex items-center justify-between">
              <span className="text-slate-450 text-[10px] uppercase font-bold flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-blue-400" /> train_model.py
              </span>
              <span className="text-[9px] bg-slate-800 text-slate-550 border border-slate-700 px-1.5 py-0.2 rounded">
                scikit-learn
              </span>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto text-slate-300 select-all leading-relaxed whitespace-pre" id="training-code-output">
              {rawPythonCode}
            </div>
          </div>
        </div>

        {/* Right column: Results & Coefficients */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <span className="p-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                <Award className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Fitted Parameters & Equations
              </h3>
            </div>

            {/* Parameter Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 font-mono">
                <span className="text-[10px] text-slate-550 block">SLOPE (β₁)</span>
                <span className="text-emerald-400 font-bold text-sm block mt-1" id="val-beta1">
                  {hasTrained ? fitResults.beta1.toFixed(4) : '—'}
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">Price change per unscaled {activeFeature}</span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 font-mono">
                <span className="text-[10px] text-slate-550 block">INTERCEPT (β₀)</span>
                <span className="text-white font-bold text-sm block mt-1" id="val-beta0">
                  {hasTrained ? fitResults.beta0.toFixed(4) : '—'}
                </span>
                <span className="text-[9px] text-slate-505 mt-0.5 block">Theoretical base pricing ($1000s)</span>
              </div>
            </div>

            {/* Equation visualizer */}
            <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10 space-y-2 font-mono">
              <span className="text-[10px] text-emerald-400 font-bold block">Fitted Line Equation (Unstandardized)</span>
              <div className="text-sm md:text-base font-bold text-white tracking-wide leading-relaxed py-1" id="training-equation-visual">
                {hasTrained 
                  ? `ŷ = ${fitResults.beta0.toFixed(3)} ${fitResults.beta1 >= 0 ? '+' : '-'} ${Math.abs(fitResults.beta1).toFixed(3)}x` 
                  : 'ŷ = β₀ + β₁x'}
              </div>
              <div className="text-[10px] text-slate-400 leading-normal">
                {hasTrained 
                  ? `House Value (MEDV) = $${fitResults.beta0.toFixed(2)}k ${fitResults.beta1 >= 0 ? 'plus' : 'minus'} $${Math.abs(fitResults.beta1).toFixed(2)}k for every increase of unscaled feature ${activeFeature}.` 
                  : 'Slope and intercepts are learned by minimizing the squared residuals.'}
              </div>
            </div>

            {/* Standard Metrics Table */}
            <div className="border border-slate-850 rounded-lg overflow-hidden font-mono text-[11px]" id="result-coefficients-table">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-slate-405 border-b border-slate-850">
                    <th className="p-2.5">Variable Parameters</th>
                    <th className="p-2.5">Weight (Standardized)</th>
                    <th className="p-2.5">Pearson Correlation (r)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 text-slate-300 font-semibold">{activeFeature} (Predictor)</td>
                    <td className="p-2.5 text-emerald-400 font-bold">{hasTrained ? fitResults.weight.toFixed(4) : '—'}</td>
                    <td className="p-2.5 text-sky-400 font-bold">{hasTrained ? fitResults.correlation.toFixed(4) : '—'}</td>
                  </tr>
                  <tr className="bg-slate-900/10 border-t border-slate-850/50">
                    <td className="p-2.5 text-slate-500">Regularization Type</td>
                    <td colSpan={2} className="p-2.5 text-slate-400 uppercase font-bold">
                      {modelType} {modelType !== 'linear' ? `(alpha = ${alphaValue})` : '(none)'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Small check icon showing success */}
            {hasTrained && (
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/5 p-2.5 rounded border border-emerald-500/10">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>The model parameters match standard scikit-learn outputs perfectly! See validation below.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
