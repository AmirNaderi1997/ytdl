import React from 'react';
import { AppMode } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentMode, setMode }) => {
  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/20">
              T
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              TubeDash
            </span>
          </div>
          
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMode(AppMode.DOWNLOADER)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentMode === AppMode.DOWNLOADER
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Downloader
            </button>
            <button
              onClick={() => setMode(AppMode.AI_OPTIMIZER)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentMode === AppMode.AI_OPTIMIZER
                  ? 'bg-indigo-600 text-white shadow-indigo-500/25 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              AI Optimizer
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;