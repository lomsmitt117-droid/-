import React, { useState, useCallback } from 'react';
import { VideoProject, Clip, ViewState, GeminiClipSchema } from './types';
import { analyzeVideoForClips, mockAnalyzeYoutubeUrl } from './services/geminiService';
import { LogoIcon, UploadIcon, YoutubeIcon, ScissorsIcon } from './components/Icons';
import ClipCard from './components/ClipCard';
import VideoPlayer from './components/VideoPlayer';

const DEMO_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"; // Public domain sample

export default function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const [project, setProject] = useState<VideoProject | null>(null);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);

  // Handlers
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (file.type.indexOf('video/') === -1) {
          setError("Please upload a valid video file.");
          return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create local URL for preview
        const localUrl = URL.createObjectURL(file);
        
        // Call Gemini
        const clipsData = await analyzeVideoForClips(file);
        
        const clips: Clip[] = clipsData.map((c, i) => ({
            id: `clip-${i}`,
            ...c,
            transcript: c.transcriptSummary // mapping summary to transcript for display
        }));

        setProject({
            id: Date.now().toString(),
            sourceFile: file,
            sourceUrl: localUrl,
            title: file.name,
            status: 'completed',
            clips: clips
        });
        
        if (clips.length > 0) {
            setActiveClipId(clips[0].id);
        }
        
        setViewState(ViewState.EDITOR);

      } catch (err) {
          setError("Failed to analyze video. Ensure API key is set and video is < 20MB (API limit for this demo).");
      } finally {
          setIsLoading(false);
      }
    }
  }, []);

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!youtubeUrl) return;

      setIsLoading(true);
      setError(null);
      
      try {
          // Mocking the Gemini call for YouTube URLs because we can't download the stream client-side to send to Gemini
          const clipsData = await mockAnalyzeYoutubeUrl(youtubeUrl);
          
          const clips: Clip[] = clipsData.map((c, i) => ({
            id: `clip-${i}`,
            ...c,
            transcript: c.transcriptSummary
          }));

          setProject({
              id: Date.now().toString(),
              sourceUrl: DEMO_VIDEO_URL, // Fallback to a playable URL for demo purposes
              title: "YouTube Video Import",
              status: 'completed',
              clips: clips
          });
           if (clips.length > 0) {
            setActiveClipId(clips[0].id);
        }
          setViewState(ViewState.EDITOR);
      } catch (err) {
          setError("Failed to process YouTube link.");
      } finally {
          setIsLoading(false);
      }
  };

  const activeClip = project?.clips.find(c => c.id === activeClipId) || null;

  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto pt-20 px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary mb-6">
          Turn long videos into viral shorts.
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Vizard Clone uses AI to identify the most engaging moments from your videos and turns them into TikToks, Reels, and Shorts instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Option 1: YouTube Link */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                <YoutubeIcon />
            </div>
            <h2 className="text-xl font-bold">Paste YouTube Link</h2>
          </div>
          <form onSubmit={handleYoutubeSubmit} className="space-y-4">
            <input 
                type="text" 
                placeholder="https://youtube.com/watch?v=..." 
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
                {isLoading ? 'Analyzing...' : 'Get AI Clips'}
            </button>
            <p className="text-xs text-gray-500 text-center">
                *Demo: Uses a sample video for playback due to CORS.
            </p>
          </form>
        </div>

        {/* Option 2: File Upload */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <UploadIcon />
            </div>
            <h2 className="text-xl font-bold">Upload Video File</h2>
          </div>
          
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-400 group-hover:text-primary">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">MP4, MOV (Max 20MB for demo)</p>
              </div>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} disabled={isLoading} />
          </label>
          {isLoading && (
               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                   <span className="text-sm text-primary">Gemini is watching your video...</span>
               </div>
          )}
        </div>
      </div>
      
      {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center">
              {error}
          </div>
      )}
    </div>
  );

  const renderEditor = () => (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar / Clips List */}
      <div className="w-96 bg-surface border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold mb-1">{project?.title}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {project?.clips.length} Viral Clips Found
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {project?.clips.map(clip => (
                <ClipCard 
                    key={clip.id} 
                    clip={clip} 
                    isActive={activeClipId === clip.id}
                    onClick={() => setActiveClipId(clip.id)}
                />
            ))}
        </div>
        <div className="p-4 border-t border-white/5">
            <button onClick={() => setViewState(ViewState.DASHBOARD)} className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors">
                ← Back to Dashboard
            </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-darker flex relative">
          
          {/* Center: Video Preview */}
          <div className="flex-1 flex items-center justify-center p-8">
               {project?.sourceUrl && (
                   <VideoPlayer 
                        videoUrl={project.sourceUrl} 
                        activeClip={activeClip}
                        isProcessing={isLoading}
                   />
               )}
          </div>

          {/* Right: Details / Actions */}
          <div className="w-80 bg-surface border-l border-white/5 p-6 flex flex-col">
               <div className="mb-6">
                   <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-4">Clip Metadata</h3>
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs text-gray-400 mb-1">Suggested Title</label>
                           <input 
                                type="text" 
                                value={activeClip?.title || ''} 
                                readOnly 
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-white"
                            />
                       </div>
                       <div>
                           <label className="block text-xs text-gray-400 mb-1">Viral Score reasoning</label>
                           <textarea 
                                rows={4}
                                value={activeClip?.reasoning || ''} 
                                readOnly 
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-gray-300 resize-none"
                            />
                       </div>
                   </div>
               </div>

               <div className="mt-auto space-y-3">
                   <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                        Export to TikTok
                   </button>
                   <button className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-lg transition-all">
                        Download Clip
                   </button>
               </div>
          </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-darker text-white font-sans">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState(ViewState.DASHBOARD)}>
            <div className="bg-white p-1 rounded">
                <ScissorsIcon />
            </div>
            <span className="font-bold text-xl tracking-tight">Vizard<span className="text-primary">Clone</span></span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-xs px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full">
                Powered by Gemini 2.5
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary"></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {viewState === ViewState.DASHBOARD ? renderDashboard() : renderEditor()}
      </main>
    </div>
  );
}