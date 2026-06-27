import React, { useState, useEffect } from 'react';
import { BostonRow } from '../types';
import { Home, Sliders, Info, ShieldAlert, DollarSign } from 'lucide-react';

interface PredictionToolProps {
  activeFeature: keyof BostonRow;
  beta1: number;
  beta0: number;
  rmse: number;
  hasTrained: boolean;
}

export default function PredictionTool({
  activeFeature,
  beta1,
  beta0,
  rmse,
  hasTrained
}: PredictionToolProps) {
  // Slider states for inputs
  const [rmVal, setRmVal] = useState(6.28);     // Average Rooms
  const [lstatVal, setLstatVal] = useState(12.65); // % Lower Status
  const [crimVal, setCrimVal] = useState(0.36);    // Crime Rate
  const [ptratioVal, setPtratioVal] = useState(18.4); // Pupil Teacher ratio

  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [triggerNotification, setTriggerNotification] = useState(false);

  // Sync active feature input slider for direct calculations
  const getActiveSliderValue = () => {
    switch (activeFeature) {
      case 'RM': return rmVal;
      case 'LSTAT': return lstatVal;
      case 'CRIM': return crimVal;
      case 'PTRATIO': return ptratioVal;
      default: return 6.28;
    }
  };

  // Run the linear algebra equation: y = beta1 * x + beta0
  const evaluatePrediction = () => {
    setIsCalculating(true);
    setTriggerNotification(false);

    const xVal = getActiveSliderValue();
    const rawEst = (beta1 * xVal) + beta0;
    
    // Bounds check to keep housing prices realistic (e.g. minimum $5,000, max $50,000 in dataset standard scale)
    const boundedEst = Math.max(5.0, Math.min(50.0, rawEst));

    setTimeout(() => {
      setPredictedPrice(boundedEst);
      setIsCalculating(false);
      setTriggerNotification(true);
    }, 450);
  };

  // Auto trigger prediction calculation on slider adjustments
  useEffect(() => {
    if (hasTrained) {
      const xVal = getActiveSliderValue();
      const rawEst = (beta1 * xVal) + beta0;
      const boundedEst = Math.max(5.0, Math.min(50.0, rawEst));
      setPredictedPrice(boundedEst);
    }
  }, [rmVal, lstatVal, crimVal, ptratioVal, activeFeature, beta1, beta0, hasTrained]);

  // Compute confidence range boundaries (Valuation +- RMSE)
  const confidenceMin = predictedPrice ? Math.max(5.0, predictedPrice - rmse) : 0;
  const confidenceMax = predictedPrice ? Math.min(50.0, predictedPrice + rmse) : 0;

  return (
    <section id="section-predict" className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8 scroll-mt-20">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.55">
          🔮 ML Generalization Playground
        </span>
        <h2 className="text-xl md:text-2xl text-white font-sans font-bold tracking-tight mt-1">
          Pipeline Stage 06: Live Prediction Tool
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Adjust predictor sliders to compute test house estimates using the trained linear model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Panels */}
        <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-500" /> Interactive Feature Sliders
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Current X Predictor: {activeFeature}</span>
          </div>

          <div className="space-y-5" style={{ contentVisibility: 'auto' }}>
            {/* Rooms Slider */}
            <div className={`p-3.5 rounded-lg border transition-colors ${activeFeature === 'RM' ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/30 border-transparent'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-300 font-semibold">Average Rooms per Dwelling (RM)</span>
                <strong className="text-emerald-400 text-sm">{rmVal.toFixed(2)} rooms</strong>
              </div>
              <input
                type="range"
                min="3.5"
                max="8.8"
                step="0.05"
                value={rmVal}
                onChange={(e) => setRmVal(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                id="slider-rm"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                <span>Lower Limit (3.5)</span>
                <span>Average (6.28)</span>
                <span>Upper Limit (8.8)</span>
              </div>
            </div>

            {/* LSTAT Slider */}
            <div className={`p-3.5 rounded-lg border transition-colors ${activeFeature === 'LSTAT' ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/30 border-transparent'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-300 font-semibold">Lower Status Population Ratio (LSTAT)</span>
                <strong className="text-emerald-400 text-sm">{lstatVal.toFixed(1)}%</strong>
              </div>
              <input
                type="range"
                min="1.70"
                max="37.9"
                step="0.1"
                value={lstatVal}
                onChange={(e) => setLstatVal(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                id="slider-lstat"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                <span>Lower Limit (1.7%)</span>
                <span>Average (12.6%)</span>
                <span>Upper Limit (37.9%)</span>
              </div>
            </div>

            {/* CRIM Slider */}
            <div className={`p-3.5 rounded-lg border transition-colors ${activeFeature === 'CRIM' ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/30 border-transparent'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-300 font-semibold">Per Capita Crime Rate (CRIM)</span>
                <strong className="text-emerald-400 text-sm">{crimVal.toFixed(3)}</strong>
              </div>
              <input
                type="range"
                min="0.006"
                max="10.0"
                step="0.01"
                value={crimVal}
                onChange={(e) => setCrimVal(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                id="slider-crim"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                <span>Low Crime (0.01)</span>
                <span>Moderate (0.36)</span>
                <span>High Crime (10.0)</span>
              </div>
            </div>

            {/* PTRATIO Slider */}
            <div className={`p-3.5 rounded-lg border transition-colors ${activeFeature === 'PTRATIO' ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/30 border-transparent'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-300 font-semibold">Pupil-Teacher Class Size Ratio (PTRATIO)</span>
                <strong className="text-emerald-400 text-sm">{ptratioVal.toFixed(1)}</strong>
              </div>
              <input
                type="range"
                min="12.6"
                max="22.0"
                step="0.1"
                value={ptratioVal}
                onChange={(e) => setPtratioVal(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                id="slider-ptratio"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                <span>Low density (12.6)</span>
                <span>Average (18.4)</span>
                <span>Dense (22.0)</span>
              </div>
            </div>
          </div>

          <button
            onClick={evaluatePrediction}
            disabled={!hasTrained || isCalculating}
            className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-extrabold text-xs tracking-wider rounded-lg uppercase transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
            id="btn-run-prediction"
          >
            {isCalculating ? (
              <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full"></span>
            ) : (
              <Home className="w-4 h-4" />
            )}
            {isCalculating ? 'Computing Linear Equations...' : 'Predict House Price'}
          </button>
        </div>

        {/* Prediction Outputs HUD */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6 text-center">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-left flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Valuation Forecast
            </h3>

            {hasTrained ? (
              <div className="space-y-6">
                {/* Large price display */}
                <div className="py-6 px-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-2 relative overflow-hidden" id="box-predicted-price">
                  {/* Subtle decorative background circle */}
                  <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-emerald-500/5 pointer-events-none"></div>

                  <span className="text-xs text-slate-400 font-mono block uppercase">Predicted Home Price</span>
                  <strong className="text-3xl md:text-4xl text-white font-sans tracking-tight font-extrabold block">
                    {predictedPrice !== null ? `$${(predictedPrice * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
                  </strong>
                  <div className="text-[10px] text-slate-550 font-mono">
                    Based on active {activeFeature} = <strong className="text-emerald-400">{getActiveSliderValue().toFixed(3)}</strong>
                  </div>
                </div>

                {/* Confidence ranges */}
                <div className="space-y-2 text-left font-mono text-xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">Model Confidence Interval (± RMSE)</span>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-2" id="prediction-confidence-range">
                    <div className="flex justify-between text-xs text-slate-350">
                      <span>Low Valuation Interval:</span>
                      <strong className="text-rose-400">${(confidenceMin * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-350">
                      <span>High Valuation Interval:</span>
                      <strong className="text-emerald-400">${(confidenceMax * 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                    </div>

                    {/* Progress Interval bar visual */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden relative">
                      <div 
                        className="bg-sky-500/40 h-full rounded-full absolute"
                        style={{ left: `${(confidenceMin / 50) * 100}%`, right: `${100 - (confidenceMax / 50) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-emerald-500 w-2.5 h-2.5 rounded-full absolute top-1/2 -translate-y-1/2 -ml-1.25"
                        style={{ left: `${((predictedPrice || 0) / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Info Note description */}
                <div className="flex gap-2 text-left p-3 bg-sky-500/5 rounded border border-sky-500/10 text-[10px] text-slate-400 leading-normal">
                  <Info className="w-3.5 h-3.5 shrink-0 text-sky-400 mt-0.5" />
                  <span>The confidence interval scales directly with the Model&apos;s Root Mean Squared Error (RMSE = <strong className="text-white">±{rmse.toFixed(3)}</strong>, representing approximately $N thousand absolute home pricing deviation values).</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <ShieldAlert className="w-10 h-10 text-yellow-500 animate-bounce" />
                <h4 className="text-xs text-slate-400 font-mono font-bold uppercase">Estimator requires training</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">Ensure you trigger the parameters in Pipeline Stage 04 before trying live house estimations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
