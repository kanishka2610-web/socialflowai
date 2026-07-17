import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Image, Layout, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

const aspectRatios = [
  { id: 'instagram-square', name: 'Instagram Square', ratio: '1:1', cssClass: 'aspect-square', w: 1024, h: 1024 },
  { id: 'instagram-story', name: 'Instagram Story', ratio: '9:16', cssClass: 'aspect-[9/16] max-h-[320px]', w: 720, h: 1280 },
  { id: 'facebook', name: 'Facebook', ratio: '1.91:1', cssClass: 'aspect-[1.91/1]', w: 1200, h: 630 },
  { id: 'x', name: 'X', ratio: '16:9', cssClass: 'aspect-video', w: 1200, h: 675 },
  { id: 'youtube', name: 'YouTube Thumbnail', ratio: '16:9', cssClass: 'aspect-video', w: 1280, h: 720 }
];

export default function PosterGenerator({ isOpen, onClose }) {
  const { triggerToast, setActiveView, setPendingMediaAttachment } = useApp();
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('instagram-square');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const activeRatio = aspectRatios.find(r => r.id === selectedRatio) || aspectRatios[0];

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Construct Pollinations.ai direct image URL
    const cleanPrompt = encodeURIComponent(prompt.trim());
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${activeRatio.w}&height=${activeRatio.h}&nologo=true`;
    
    // Set the image URL to start browser image download
    setGeneratedImage(imageUrl);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans"
        >
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-premium flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-850/50 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-650 to-pink-600 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">AI Poster Generator</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Describe your idea to create beautiful design canvases</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-450 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Columns */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-5 gap-6 p-6 min-h-[420px]">
              
              {/* Left Column: Form Controls (2/5 size) */}
              <div className="md:col-span-2 space-y-5 flex flex-col justify-between">
                <form onSubmit={handleGenerate} className="space-y-4 text-left">
                  {/* Prompt Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Poster Description</label>
                    <textarea
                      required
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. A futuristic workspace dashboard with glassmorphism overlays and neon purple glowing accents..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 bg-gray-850 dark:bg-gray-800 border border-gray-755 text-gray-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-semibold resize-none placeholder-gray-500"
                    />
                  </div>

                  {/* Aspect Ratio Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                      {aspectRatios.map(ratio => (
                        <div
                          key={ratio.id}
                          onClick={() => {
                            setSelectedRatio(ratio.id);
                            // If we already have generated poster, regenerate automatically or clear preview to keep UI aligned
                            if (generatedImage) {
                              setGeneratedImage(null);
                            }
                          }}
                          className={`p-2.5 border rounded-xl cursor-pointer transition-all flex flex-col items-start gap-1 text-left ${
                            selectedRatio === ratio.id
                              ? 'bg-gradient-to-r from-violet-950/20 to-pink-950/20 border-violet-500'
                              : 'bg-gray-855/50 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <span className="text-[10px] font-black text-gray-200 truncate capitalize">{ratio.name}</span>
                          <span className="text-[8px] font-semibold text-gray-455">{ratio.ratio} format</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>

                {/* Generate Action Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className={`w-full py-3 bg-gradient-to-r from-violet-650 to-pink-600 hover:from-violet-750 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                    isGenerating || !prompt.trim() ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating Art...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Poster</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Visual Preview Canvas (3/5 size) */}
              <div className="md:col-span-3 bg-gray-955/50 border border-gray-850 rounded-2xl p-6 flex flex-col items-center justify-between min-h-[400px] overflow-hidden relative">
                
                {/* Visual Canvas Box Wrapper */}
                <div className="flex-1 flex items-center justify-center w-full py-4">
                  <div className={`w-full max-w-[280px] border border-gray-800 rounded-xl overflow-hidden shadow-2xl bg-gray-900 flex items-center justify-center relative transition-all duration-300 ${activeRatio.cssClass}`}>
                    
                    <AnimatePresence mode="wait">
                      {isGenerating && (
                        /* Shimmer/Pulse Loading Skeleton State */
                        <motion.div
                          key="skeleton"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-gray-850 flex flex-col items-center justify-center p-6 space-y-3 z-10"
                        >
                          <div className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                          <div className="w-3/4 h-2.5 bg-gray-800 rounded-full overflow-hidden relative">
                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-full rounded-full animate-pulse w-full" />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest animate-pulse text-center max-w-[200px] leading-relaxed">
                            Generating Art...
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {generatedImage ? (
                      /* Generated Output Image with onLoad/onError listeners */
                      <img
                        src={generatedImage}
                        alt="AI Poster"
                        onLoad={() => {
                          setIsGenerating(false);
                          triggerToast('success', 'Poster Generated', 'AI poster successfully rendered via Pollinations.');
                        }}
                        onError={() => {
                          setIsGenerating(false);
                          triggerToast('error', 'Generation Failed', 'Failed to load image from Pollinations.ai');
                        }}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          isGenerating ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                    ) : (
                      /* Empty Initial State Placeholders */
                      <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-gray-850 flex items-center justify-center text-gray-400 border border-gray-800">
                          <Image className="w-4.5 h-4.5 text-gray-450" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-300">Awaiting Poster Art</p>
                          <p className="text-[9px] text-gray-550 max-w-[200px] leading-relaxed font-semibold">
                            Enter a prompt and select an aspect ratio on the left to generate poster art.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                {generatedImage && !isGenerating && (
                  <div className="w-full grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-850 mt-4 animate-in fade-in duration-200 shrink-0">
                    {/* Download */}
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = `socialflow-poster-${selectedRatio}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        triggerToast('success', 'Download Started', 'Staged art download dispatched.');
                      }}
                      className="py-2.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-gray-200 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-450" />
                      <span>Download</span>
                    </button>

                    {/* Regenerate */}
                    <button
                      onClick={handleGenerate}
                      className="py-2.5 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-gray-250 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Regenerate</span>
                    </button>

                    {/* Use in Post */}
                    <button
                      onClick={() => {
                        setPendingMediaAttachment({
                          name: `ai-poster-${selectedRatio}.png`,
                          size: 450000,
                          type: 'image/png',
                          preview: generatedImage
                        });
                        setActiveView('create-post');
                        onClose();
                      }}
                      className="py-2.5 bg-gradient-to-r from-violet-600 to-pink-650 hover:from-violet-700 hover:to-pink-700 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <Layout className="w-3.5 h-3.5 text-pink-200" />
                      <span>Use in Post</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
