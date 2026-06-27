import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Info, HelpCircle, Layers, Cpu, Code, CheckCircle, ArrowRight } from 'lucide-react';

export default function Overview() {
  const [selectedFormula, setSelectedFormula] = useState<'ols' | 'ridge' | 'lasso'>('ols');

  const formulaInfo = {
    ols: {
      name: 'Ordinary Least Squares (OLS)',
      formula: 'ŷ = β₀ + β₁x₁',
      loss: 'Loss = ∑ (yᵢ - ŷᵢ)²',
      desc: 'OLS fits a line by finding the exact intercept (β₀) and slope (β₁) that minimize the sum of squared residuals between the predicted values & actual observations. It contains no penalty on coefficient size.',
      stats: 'Tends to have high variance if features are highly correlated.'
    },
    ridge: {
      name: 'Ridge Regression (L2 Regularization)',
      formula: 'ŷ = β₀ + β₁x₁',
      loss: 'Loss = ∑ (yᵢ - ŷᵢ)² + α ∑ βⱼ²',
      desc: 'Ridge works by adding a penalty proportional to the square of the coefficients (L2 penalty). This forces coefficients (β) closer to zero, shrinking them to reduce overfitting on noisy datasets.',
      stats: 'Shrinks coefficients toward zero, but never makes them exactly zero.'
    },
    lasso: {
      name: 'Lasso Regression (L1 Regularization)',
      formula: 'ŷ = β₀ + β₁x₁',
      loss: 'Loss = ½ ∑ (yᵢ - ŷᵢ)² + α ∑ |βⱼ|',
      desc: 'Lasso (Least Absolute Shrinkage and Selection Operator) applies a penalty proportional to the absolute values of the coefficients (L1 penalty). This can force some coefficients to become exactly zero.',
      stats: 'Provides automatic feature selection by zeroing out weak predictors.'
    }
  };

  const pipelineSteps = [
    { id: 1, title: 'Dataset Acquisition', desc: 'Acquire real-world Boston housing stats showing home variables vs price.', icon: Layers, status: 'Completed' },
    { id: 2, title: 'Preprocessing & Scaling', desc: 'Clean features & standardize inputs to μ = 0, σ = 1 using StandardScaler.', icon: HelpCircle, status: 'Active' },
    { id: 3, title: 'Deterministic Split', desc: 'Securely partition datasets into an 80/20 train/test split.', icon: Cpu, status: 'Active' },
    { id: 4, title: 'Regression Fit', desc: 'Train an estimator utilizing Least Squares or regularized shrinkage weights.', icon: Code, status: 'Active' },
    { id: 5, title: 'Metric Assessment', desc: 'Test accuracy using standard MSE, RMSE, R² scores, and residual graphs.', icon: CheckCircle, status: 'Active' }
  ];

  return (
    <section id="section-overview" className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 scroll-mt-20">
      {/* Overview Intro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            Supervised Machine Learning
          </div>
          <h2 className="text-2xl md:text-3xl text-white font-sans font-bold tracking-tight">
            Understanding Simple Linear Regression
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Simple Linear Regression is a fundamental machine learning algorithm used to predict a quantitative target 
            variable (<strong className="text-white">y</strong>) based on a single predictor feature (<strong className="text-white">x</strong>). 
            By drawing the optimal straight line through data, we find a direct mathematical relationship to make 
            high-fidelity numerical predictions.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            In our lab, we examine the famous <span className="text-white font-medium">Boston Housing Dataset</span>, 
            learning how attributes like the average number of rooms (<span className="text-emerald-400">RM</span>) or status of 
            the neighborhood (<span className="text-sky-400">LSTAT</span>) can mathematically estimate median home valuations (<span className="text-purple-400">MEDV</span>).
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="px-3 py-1 bg-slate-800 rounded-md text-xs text-slate-300 font-mono border border-slate-700">Python 3.10</span>
            <span className="px-3 py-1 bg-slate-800 rounded-md text-xs text-emerald-400 font-mono border border-emerald-950">scikit-learn 1.3</span>
            <span className="px-3 py-1 bg-slate-800 rounded-md text-xs text-sky-400 font-mono border border-sky-950">NumPy & Pandas</span>
            <span className="px-3 py-1 bg-slate-800 rounded-md text-xs text-purple-400 font-mono border border-purple-950">StdScaler (L1/L2)</span>
          </div>
        </div>

        {/* Interactive Math box */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3" id="formula-toggles">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-emerald-500" /> Mathematical Objective
            </h3>
            <div className="flex gap-1">
              {(['ols', 'ridge', 'lasso'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFormula(type)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded uppercase transition-colors ${
                    selectedFormula === type
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                  id={`btn-formula-${type}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={selectedFormula}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 font-mono"
            style={{ contentVisibility: 'auto' }}
          >
            <div className="text-center py-4 bg-slate-900/50 rounded-lg border border-slate-900">
              <span className="text-xs text-slate-500">Estimating Equation:</span>
              <p className="text-xl md:text-2xl font-bold text-white tracking-wide mt-1">
                {formulaInfo[selectedFormula].formula}
              </p>
            </div>

            <div className="py-2.5 px-3 bg-red-500/5 rounded-md border border-red-500/10 text-xs">
              <span className="text-slate-400">Minimization Goal (Loss Formula):</span>
              <p className="text-red-400 font-semibold tracking-wide mt-1">
                {formulaInfo[selectedFormula].loss}
              </p>
            </div>

            <div className="text-xs leading-relaxed text-slate-400 pt-1" id="formula-description">
              <strong className="text-slate-200 block mb-1">{formulaInfo[selectedFormula].name}</strong>
              {formulaInfo[selectedFormula].desc}
            </div>

            <div className="text-[11px] text-emerald-400/80 bg-emerald-500/5 px-2.5 py-1.5 rounded border border-emerald-500/10 flex gap-1.5 items-center">
              <Info className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{formulaInfo[selectedFormula].stats}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Visual Pipeline Section */}
      <div className="border-t border-slate-800 pt-8">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" /> Interactive Machine Learning Pipeline
          </h3>
          <p className="text-xs text-slate-400">
            A linear model undergoes structured transitions before rendering live house calculations. Move through our visual pipeline.
          </p>
        </div>

        {/* Pipeline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3" id="pipeline-pipeline">
          {pipelineSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.id}
                id={`step-card-${step.id}`}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative group hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Phase number */}
                  <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                    <span className="text-emerald-400 font-semibold">STAGE 0{step.id}</span>
                    <span className="text-slate-600">Step {idx + 1}/5</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded bg-slate-850 border border-slate-700 text-slate-300 group-hover:text-emerald-400 transition-colors">
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs text-slate-200 font-semibold leading-tight">{step.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{step.desc}</p>
                </div>

                {/* Connection arrows on desktop */}
                {idx < 4 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 text-slate-700 group-hover:text-emerald-500/50 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
