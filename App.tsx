import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DownloaderUI from './components/DownloaderUI';
import AIOptimizer from './components/AIOptimizer';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DOWNLOADER);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 pb-20 selection:bg-red-500/30">
      <Navbar currentMode={mode} setMode={setMode} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {mode === AppMode.DOWNLOADER ? (
          <DownloaderUI />
        ) : (
          <AIOptimizer />
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-slate-900/80 backdrop-blur border-t border-slate-800 py-4 text-center text-slate-500 text-sm z-40">
        <p>TubeDash AI • Built for educational purposes • Gemini 2.0 Integration</p>
      </footer>
    </div>
  );
};

export default App;