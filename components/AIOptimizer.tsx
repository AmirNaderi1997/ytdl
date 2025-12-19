import React, { useState } from 'react';
import { analyzeVideoMetadata } from '../services/geminiService';
import { AIAnalysisResult, AnalysisStatus } from '../types';

const AIOptimizer: React.FC = () => {
  const [inputTitle, setInputTitle] = useState('');
  const [context, setContext] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputTitle.trim()) return;

    setStatus(AnalysisStatus.LOADING);
    try {
      const data = await analyzeVideoMetadata(inputTitle, context);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          AI Content <span className="text-indigo-500">Optimizer</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Leverage Gemini 2.0 to generate viral titles, SEO tags, and summaries for your videos before you even upload them.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium ml-1">Video Title or Topic</label>
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="e.g. How to build a fast api site"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium ml-1">Additional Context (Optional)</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Targeted at beginner developers, using Python and React."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={status === AnalysisStatus.LOADING || !inputTitle}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === AnalysisStatus.LOADING ? 'Analyzing with Gemini...' : 'Generate Metadata'}
        </button>
      </div>

      {status === AnalysisStatus.ERROR && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
          Failed to analyze video. Please check your API key and try again.
        </div>
      )}

      {result && status === AnalysisStatus.SUCCESS && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
               </div>
               <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Optimized Title</h3>
               <p className="text-2xl font-bold text-white leading-tight">{result.optimizedTitle}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Summary</h3>
               <p className="text-slate-300 leading-relaxed">{result.summary}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">SEO Tags</h3>
               <div className="flex flex-wrap gap-2">
                 {result.seoTags.map((tag, i) => (
                   <span key={i} className="px-3 py-1.5 bg-slate-700/50 text-indigo-300 text-sm rounded-lg border border-slate-600/50">
                     #{tag}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 border border-indigo-500/30 text-center">
                <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Viral Potential</h3>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * result.viralScore) / 100} className="text-indigo-500 transition-all duration-1000 ease-out" />
                  </svg>
                  <span className="absolute text-2xl font-bold text-white">{result.viralScore}</span>
                </div>
             </div>

             <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-4">Suggestions</h3>
                <ul className="space-y-3">
                  {result.contentSuggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIOptimizer;