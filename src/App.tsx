/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import DatasetExplorer from './components/DatasetExplorer';
import Preprocessing from './components/Preprocessing';
import ModelTraining from './components/ModelTraining';
import ModelEvaluation from './components/ModelEvaluation';
import PredictionTool from './components/PredictionTool';
import Experiments from './components/Experiments';
import Footer from './components/Footer';

import { BostonRow, ModelType } from './types';
import { bostonDataset } from './data/bostonData';
import { fitModel, evaluateModel, getTrainTestSplit } from './utils/mlEngine';
import { ArrowRight, Activity, Cpu, Sliders, ChevronDown } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  
  // Independent feature for standard regressions
  const [activeFeature, setActiveFeature] = useState<keyof BostonRow>('RM');
  
  // Model Regularization controls
  const [modelType, setModelType] = useState<ModelType>('linear');
  const [alphaValue, setAlphaValue] = useState<number>(1.0);

  // Trained parameter state
  const [beta1, setBeta1] = useState<number>(0);
  const [beta0, setBeta0] = useState<number>(0);
  const [hasTrained, setHasTrained] = useState<boolean>(false);

  // Split calculations
  const { test } = getTrainTestSplit();

  // Instant continuous fit parameters for navbar status
  const currentOlsMetricR2 = useMemo(() => {
    const params = fitModel(bostonDataset, activeFeature, 'linear', 0);
    const evalStats = evaluateModel(test, activeFeature, params.beta1, params.beta0);
    return evalStats.metrics.r2;
  }, [activeFeature, test]);

  // Feed evaluation statistics down to live forecasting components
  const activeMetrics = useMemo(() => {
    const evalStats = evaluateModel(test, activeFeature, beta1, beta0);
    return evalStats.metrics;
  }, [beta1, beta0, activeFeature, test]);

  // Live scroll handler for navbar navigation
  const handleScrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    let targetId = sectionId;
    if (sectionId === 'predict') {
      targetId = 'section-predict';
    } else if (sectionId === 'dataset') {
      targetId = 'section-dataset';
    } else if (sectionId === 'preprocessing') {
      targetId = 'section-preprocessing';
    } else if (sectionId === 'training') {
      targetId = 'section-training';
    } else if (sectionId === 'experiments') {
      targetId = 'section-experiments';
    } else if (sectionId === 'overview') {
      targetId = 'section-overview';
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Callback once the fitting completes
  const handleModelTrained = (b1: number, b0: number, trained: boolean) => {
    setBeta1(b1);
    setBeta0(b0);
    setHasTrained(trained);
  };

  // Monitor element intercepts to update active navbar index dynamically
  useEffect(() => {
    const handleScrollDetect = () => {
      const sections = [
        { id: 'overview', element: document.getElementById('section-overview') },
        { id: 'dataset', element: document.getElementById('section-dataset') },
        { id: 'preprocessing', element: document.getElementById('section-preprocessing') },
        { id: 'training', element: document.getElementById('section-training') },
        { id: 'predict', element: document.getElementById('section-predict') },
        { id: 'experiments', element: document.getElementById('section-experiments') },
      ];

      const scrollPosition = window.scrollY + 250;
      for (const section of sections) {
        if (section.element) {
          const top = section.element.offsetTop;
          const height = section.element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollDetect);
    return () => window.removeEventListener('scroll', handleScrollDetect);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans tracking-tight flex flex-col justify-between" id="app-root">
      
      {/* Translucent Navbar */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={handleScrollToSection} 
        r2Score={currentOlsMetricR2}
      />

      {/* Hero Header Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 py-16 md:py-24 border-b border-slate-900 px-4">
        {/* Tech Grid Background Visuals */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono text-[11px] font-semibold tracking-wide uppercase"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Machine Learning Simulator
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl text-white font-sans font-black tracking-tight leading-none"
            id="hero-title"
          >
            Simple Linear Regression <br className="hidden md:inline" /> Model Playground
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-slate-400 text-sm md:text-base leading-relaxed"
            id="hero-subtitle"
          >
            Understand supervised estimators in real-time. Fit Ordinary Least Squares, Ridge, or Lasso models to predict Boston housing valuations directly in the browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full sm:w-auto"
          >
            <button
              onClick={() => handleScrollToSection('predict')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/10"
              id="btn-hero-cta"
            >
              Try Prediction Tool <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScrollToSection('dataset')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-lg border border-slate-800 transition-all flex items-center justify-center gap-2"
              id="btn-hero-secondary"
            >
              Explore Dataset <ChevronDown className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </header>

      {/* Main Single Page Contents */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-16 flex-grow w-full">
        {/* Module 1: Overview */}
        <Overview />

        {/* Module 2: Dataset Explorer */}
        <DatasetExplorer 
          dataset={bostonDataset} 
          activeFeature={activeFeature} 
          setActiveFeature={setActiveFeature}
        />

        {/* Module 3: Preprocessing & Scaling */}
        <Preprocessing activeFeature={activeFeature} />

        {/* Module 4: Model Training Controls */}
        <ModelTraining 
          activeFeature={activeFeature} 
          setActiveFeature={setActiveFeature}
          modelType={modelType}
          alphaValue={alphaValue}
          onModelTrained={handleModelTrained}
          hasTrained={hasTrained}
        />

        {/* Module 5: Metrics & Evaluation plots */}
        <ModelEvaluation 
          activeFeature={activeFeature}
          beta1={beta1}
          beta0={beta0}
          hasTrained={hasTrained}
          modelType={modelType}
        />

        {/* Module 6: Prediction Sandbox */}
        <PredictionTool 
          activeFeature={activeFeature}
          beta1={beta1}
          beta0={beta0}
          rmse={activeMetrics.rmse}
          hasTrained={hasTrained}
        />

        {/* Module 7: Regularization Experiments */}
        <Experiments 
          activeFeature={activeFeature}
          modelType={modelType}
          setModelType={setModelType}
          alphaValue={alphaValue}
          setAlphaValue={setAlphaValue}
        />
      </main>

      {/* Syllabus Outcome Footer */}
      <Footer />
    </div>
  );
}
