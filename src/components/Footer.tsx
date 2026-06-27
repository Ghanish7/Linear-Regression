import React from 'react';
import { CheckSquare, BookOpen, AlertCircle, Info, GraduationCap } from 'lucide-react';

export default function Footer() {
  const learningOutcomes = [
    'Articulate Ordinary Least Squares (OLS) vs. regularized regression functions.',
    'Implement StandardScaler standardized offsets to control scaling gradients.',
    'Understand why datasets require 80/20 Train/Test partition distributions.',
    'Calculate MSE, RMSE, MAE, and evaluate fitting R² indicators.',
    'Formulate Lasso L1 sparsity boundaries to trigger automated variable elimination.',
    'Understand Ridge L2 penalty weight decay properties and regression hyperplanes.'
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 px-4 md:px-8 mt-12 text-slate-400">
      <div className="max-w-7xl mx-auto space-y-8" id="footer-container">
        {/* Upper Column: summary and check marks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                L²
              </div>
              <h3 className="text-white font-semibold font-sans text-sm">Linear Regression Lab</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed" id="footer-about">
              This interactive machine learning simulator was crafted as a comprehensive study tool demonstrating 
              OLS, Lasso, and Ridge regressions on real Boston Housing datasets. It runs 100% programmatically in the browser using custom linear algebraic calculations in TypeScript.
            </p>
            <div className="flex gap-2 flex-wrap text-[10px]">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono">React 19</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono">Vite + TS</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono">Tailwind CSS</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono">MIT License</span>
            </div>
          </div>

          {/* Outcomes checkmarks list */}
          <div className="lg:col-span-7 bg-slate-900/50 p-5 rounded-xl border border-slate-900 space-y-3.5">
            <h4 className="text-white font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> Syllabus & Learning Outcomes Completed
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" id="outcomes-grid">
              {learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2 text-[11px] leading-snug">
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Lower Column: Copyright and terms info */}
        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4" id="footer-bottom">
          <div>
            © 2026 Linear Regression Lab. Developed for AI Studio Machine Learning Portfolio.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-350 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Scikit-Learn Docs</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 font-mono transition-colors">github-repo-placeholder</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
