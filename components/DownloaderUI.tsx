import React, { useState, useEffect, useRef } from 'react';
import { VideoFormat, VideoMetadata } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const BACKEND_CODE = `import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_size(bytes_size):
    if not bytes_size: return "N/A"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024: return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024
    return f"{bytes_size:.1f} TB"

@app.get("/api/info")
async def get_video_info(url: str):
    try:
        ydl_opts = {'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Filter and format formats
            formats = []
            seen_res = set()
            
            # Sort by resolution (high to low)
            raw_formats = sorted(
                [f for f in info['formats'] if f.get('ext') == 'mp4'],
                key=lambda x: x.get('height') or 0,
                reverse=True
            )

            for f in raw_formats:
                res = f.get('height')
                # Deduplicate based on resolution, prioritize video+audio if possible
                if res and res not in seen_res:
                    formats.append({
                        "id": f['format_id'],
                        "resolution": f"{res}p",
                        "format": f['ext'].upper(),
                        "size": format_size(f.get('filesize') or f.get('filesize_approx')),
                        "hasAudio": f.get('acodec') != 'none',
                        "type": "video"
                    })
                    seen_res.add(res)
            
            # Add Audio Only
            formats.append({
                "id": "bestaudio/best",
                "resolution": "Audio",
                "format": "MP3",
                "size": "Audio Only",
                "hasAudio": True,
                "type": "audio"
            })

            return {
                "title": info.get('title'),
                "thumbnailUrl": info.get('thumbnail'),
                "duration": info.get('duration_string'),
                "author": info.get('uploader'),
                "tags": info.get('tags', [])[:5],
                "formats": formats
            }
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/download")
async def download_video(url: str, format_id: str):
    try:
        filename = f"video_{format_id}.mp4" if format_id != "bestaudio/best" else "audio.mp3"
        ydl_opts = {
            'format': format_id,
            'outtmpl': filename,
            'quiet': True,
            # For audio conversion if needed
            'postprocessors': [{'key': 'FFmpegExtractAudio','preferredcodec': 'mp3'}] if "audio" in format_id else []
        }
        
        # Download locally first
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        # Serve file
        final_filename = filename if "audio" not in format_id else "audio.mp3"
        return FileResponse(final_filename, filename=final_filename, media_type='application/octet-stream')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

const DownloaderUI: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoMetadata & { formats: VideoFormat[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBackendGuide, setShowBackendGuide] = useState(true); // Default open so user sees they need code

  const handleFetch = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      // Real API Call
      const response = await fetch(`${API_BASE_URL}/api/info?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to connect to backend. Is the python server running?');
      }

      const data = await response.json();
      setVideoData(data);
      setShowBackendGuide(false); // Hide guide if connection successful
    } catch (err) {
      console.error(err);
      setError("Could not connect to http://localhost:8000. Please ensure the backend Python script is running.");
      setShowBackendGuide(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: VideoFormat) => {
    // Real Download Trigger
    // We redirect the window to the download URL. The browser handles the file download.
    const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(format.id)}`;
    window.location.href = downloadUrl;
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          High-Speed Video <span className="text-red-500">Extractor</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Paste a video link below. <span className="text-orange-400 font-medium">Requires local backend running on port 8000.</span>
        </p>
      </div>

      <div className="relative group z-10">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900 rounded-2xl p-2 border border-slate-800">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 px-4 py-3 text-lg"
          />
          <button
            onClick={handleFetch}
            disabled={isLoading || !url}
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </>
            ) : (
              'Fetch Video'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-4 animate-slide-up">
          <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-red-200 text-sm">
            <p className="font-bold">Connection Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {videoData && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 flex flex-col md:flex-row gap-6">
            <img 
              src={videoData.thumbnailUrl} 
              alt="Thumbnail" 
              className="w-full md:w-64 h-36 object-cover rounded-lg shadow-lg"
            />
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-white line-clamp-2">{videoData.title}</h3>
              <p className="text-slate-400 text-sm">by {videoData.author} • {videoData.duration}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {videoData.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {videoData.formats.map((format) => (
               <div key={format.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between hover:border-red-500/50 transition-colors group">
                 <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${format.type === 'video' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {format.type === 'video' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 10l12-3" />
                        </svg>
                      )}
                   </div>
                   <div>
                     <p className="text-white font-semibold">{format.resolution} <span className="text-slate-500 text-sm font-normal">.{format.format}</span></p>
                     <p className="text-slate-500 text-xs">{format.size}</p>
                   </div>
                 </div>
                 <button 
                  onClick={() => handleDownload(format)}
                  className="bg-slate-700 hover:bg-white hover:text-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                 >
                   Download
                 </button>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Backend Integration Guide */}
      <div className="mt-12 pt-12 border-t border-slate-800">
        <button 
          onClick={() => setShowBackendGuide(!showBackendGuide)}
          className="w-full flex items-center justify-between bg-slate-800/30 p-4 rounded-xl hover:bg-slate-800/50 transition-colors border border-slate-700/50"
        >
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${error ? 'bg-red-500/20 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
               </svg>
             </div>
             <div className="text-left">
               <h3 className="text-white font-semibold">Backend Server Code {error && <span className="text-red-400 text-xs ml-2">(Required)</span>}</h3>
               <p className="text-slate-400 text-sm">Python FastAPI + yt-dlp implementation</p>
             </div>
          </div>
          <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${showBackendGuide ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showBackendGuide && (
          <div className="mt-4 bg-[#0d1117] rounded-xl border border-slate-700 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
              <span className="text-xs text-slate-400">main.py</span>
              <span className="text-xs text-slate-500">Python 3.9+</span>
            </div>
            <div className="p-4 overflow-x-auto relative group">
              <pre className="text-sm font-mono text-blue-300 leading-relaxed">
                <code>{BACKEND_CODE}</code>
              </pre>
              <button 
                onClick={() => navigator.clipboard.writeText(BACKEND_CODE)}
                className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Copy Code
              </button>
            </div>
            <div className="bg-slate-800/50 p-4 border-t border-slate-700 text-sm text-slate-400">
              <p className="mb-2"><strong className="text-white">To run this locally:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create a folder and save the code above as <code className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">main.py</code></li>
                <li>Install dependencies: <code className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">pip install fastapi uvicorn yt-dlp</code></li>
                <li>Run server: <code className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">python main.py</code></li>
                <li>The server will start on <span className="text-indigo-400">http://localhost:8000</span></li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloaderUI;