import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Smile, 
  Hash, 
  UploadCloud, 
  X, 
  Smartphone, 
  Monitor, 
  Send, 
  HelpCircle,
  AlertCircle,
  FileImage,
  ArrowRight,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Minimize2,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const steps = [
  { id: 1, name: 'Title' },
  { id: 2, name: 'Caption' },
  { id: 3, name: 'Media' },
  { id: 4, name: 'Channels' },
  { id: 5, name: 'Audience' },
  { id: 6, name: 'Schedule' },
  { id: 7, name: 'Preview' }
];

const brandIcons = {
  instagram: '📷',
  facebook: '🔵',
  x: '🐦',
  threads: '🧵',
  youtube: '🔴',
  linkedin: '👔',
  tiktok: '🎵',
  pinterest: '📌'
};

const suggestedHashtags = ['#automation', '#socialmedia', '#marketing', '#ai', '#productivity', '#tech', '#startup', '#creator'];

export default function CreatePost() {
  const { connectedAccounts, publishPostEverywhere, triggerToast, setActiveView, user, pendingMediaAttachment, setPendingMediaAttachment } = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingStage, setPublishingStage] = useState(''); // 'saving', 'dispatching', 'success'

  useEffect(() => {
    if (pendingMediaAttachment) {
      setMediaFiles(prev => {
        // Avoid duplicate attachments of the same image preview url
        const exists = prev.some(f => f.preview === pendingMediaAttachment.preview);
        if (exists) return prev;
        return [...prev, pendingMediaAttachment];
      });
      setPendingMediaAttachment(null);
      setCurrentStep(3); // Set current wizard step to Step 3: Media
      triggerToast('success', 'Poster Attached', 'AI poster successfully attached to post media.');
    }
  }, [pendingMediaAttachment]);

  // Form State
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // Array of { name, size, type, preview }
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'x', 'linkedin']);
  const [publishOption, setPublishOption] = useState('now'); // 'now' | 'schedule' | 'draft'
  const [visibility, setVisibility] = useState('public'); // 'public' | 'private' | 'unlisted'
  const [audience, setAudience] = useState('everyone'); // 'everyone' | 'followers'
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTimeOnly, setScheduleTimeOnly] = useState('');
  const [timezone, setTimezone] = useState('UTC-5 (EST)');
  const [repeatOption, setRepeatOption] = useState('none');
  
  // UI States
  const [previewTab, setPreviewTab] = useState('instagram');
  const [previewMode, setPreviewMode] = useState('mobile'); // 'mobile' | 'desktop'
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [hashtagOpen, setHashtagOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  
  // AI Mocks
  const [aiLoading, setAiLoading] = useState(false);

  // Sync date and time pickers to combined scheduleTime in ISO 8601 format with local timezone offset
  useEffect(() => {
    if (scheduleDate && scheduleTimeOnly) {
      // Parse local time from pickers
      const d = new Date(`${scheduleDate}T${scheduleTimeOnly}`);
      if (!isNaN(d.getTime())) {
        const pad = (num) => String(num).padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());

        const offset = d.getTimezoneOffset(); // in minutes
        const absOffset = Math.abs(offset);
        const offsetHours = pad(Math.floor(absOffset / 60));
        const offsetMinutes = pad(absOffset % 60);
        const offsetSign = offset <= 0 ? '+' : '-';

        const isoWithOffset = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
        setScheduleTime(isoWithOffset);
      } else {
        setScheduleTime('');
      }
    } else {
      setScheduleTime('');
    }
  }, [scheduleDate, scheduleTimeOnly]);

  // Update preview tab to match selected platforms automatically
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(previewTab)) {
      setPreviewTab(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  // Calculate Quality Score
  const calculateQualityScore = () => {
    let score = 20; // base score
    if (title.length > 5) score += 15;
    if (caption.length > 30) score += 20;
    if (caption.includes('#')) score += 10;
    if (mediaFiles.length > 0) score += 25;
    if (selectedPlatforms.length >= 3) score += 10;
    return Math.min(score, 100);
  };

  const qualityScore = calculateQualityScore();

  // File Upload Handlers
  const fileInputRef = useRef(null);
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    if (files.length === 0) return;
    
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 800);
          return 100;
        }
        return prev + 30;
      });
    }, 200);

    const mappedFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      rawFile: file
    }));

    setMediaFiles(prev => [...prev, ...mappedFiles]);
    triggerToast('success', 'File Uploaded', `${files.length} asset(s) successfully staged.`);
  };

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, idx) => idx !== index));
    triggerToast('info', 'File Removed', 'Asset unstaged.');
  };

  const compressImage = (index) => {
    triggerToast('info', 'Compressing Asset', 'Applying visual compression algorithm...');
    setTimeout(() => {
      setMediaFiles(prev => prev.map((file, idx) => {
        if (idx === index) {
          return {
            ...file,
            size: Math.floor(file.size * 0.45) // mock 55% reduction
          };
        }
        return file;
      }));
      triggerToast('success', 'Compression Done', 'Asset compressed by 55% with zero quality loss.');
    }, 1000);
  };

  // AI Assistant Mock Actions
  const runAiCaption = (action) => {
    if (!title && action !== 'generate') {
      triggerToast('warning', 'AI Assistant', 'Please enter a Post Title first to direct the AI agent.');
      return;
    }

    setAiLoading(true);
    triggerToast('info', 'AI Writing Assistant', 'Evaluating tone matching and keywords...');

    setTimeout(() => {
      let result = '';
      if (action === 'generate') {
        result = `🚀 Introducing our newest workspace milestone: ${title || 'SocialFlow AI Platform'}! We're simplifying how teams sync, build, and deploy. Let us know your thoughts in the comment thread. 👇\n\n#SaaS #automation #productivity #futureofwork`;
      } else if (action === 'improve') {
        result = `✨ OPTIMIZED POST ✨\n\n${caption || 'Checking out the latest dashboard workflow.'}\n\n💡 Leveraged SocialFlow AI's publishing engine to deploy. Follow for regular breakdowns. \n\n#socialmedia #workflow #ai`;
      } else if (action === 'rewrite') {
        result = `⚡ TL;DR: We have a major update coming! \n\n${caption || 'New interface launch.'} Let's build together. 🔗 Link in bio.\n\n#startup #buildinpublic`;
      }

      setCaption(result);
      setAiLoading(false);
      triggerToast('success', 'AI Generation Complete', 'Caption updated with improved tone style.');
    }, 1500);
  };

  const addEmoji = (emoji) => {
    setCaption(prev => prev + emoji);
    setEmojiOpen(false);
  };

  const addHashtag = (tag) => {
    if (!caption.includes(tag)) {
      setCaption(prev => prev + ' ' + tag);
    }
    setHashtagOpen(false);
  };

  // Platform Toggle Handler
  const togglePlatform = (platId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platId)) {
        if (prev.length === 1) {
          triggerToast('warning', 'Platform Error', 'You must select at least one publishing channel.');
          return prev;
        }
        return prev.filter(p => p !== platId);
      } else {
        return [...prev, platId];
      }
    });
  };

  // Main Publish Action
  const handlePublishEverywhere = async (overrideOption = null) => {
    const finalOption = overrideOption || publishOption;
    if (!title) {
      triggerToast('error', 'Form Incomplete', 'Post Title is required.');
      setCurrentStep(1);
      return;
    }
    if (selectedPlatforms.length === 0) {
      triggerToast('error', 'Form Incomplete', 'Select at least one platform channel.');
      setCurrentStep(4);
      return;
    }
    if (finalOption === 'schedule' && (!scheduleDate || !scheduleTimeOnly)) {
      triggerToast('error', 'Form Incomplete', 'Please select both date and time to schedule this post.');
      setCurrentStep(4);
      return;
    }

    setIsPublishing(true);
    setPublishingStage('saving');
    
    // Stage 1: saving
    setTimeout(() => {
      setPublishingStage('dispatching');
      
      // Stage 2: dispatching / sending to automation
      setTimeout(async () => {
        try {
          const mediaUrls = mediaFiles.map(f => f.preview);
          await publishPostEverywhere({
            title,
            caption,
            mediaUrls,
            mediaFiles,
            selectedPlatforms,
            publishOption: finalOption,
            scheduleTime
          });
          
          setPublishingStage('success');
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.85 }
          });
          triggerToast('success', 
            finalOption === 'draft' ? 'Draft Saved' : 'Sent to Automation', 
            finalOption === 'draft' ? 'Post saved to draft pipeline.' : 'All post variations dispatched to n8n webhook.'
          );

          // Final reset and view switch
          setTimeout(() => {
            setIsPublishing(false);
            setActiveView(
              finalOption === 'draft' 
                ? 'dashboard' 
                : finalOption === 'schedule' 
                ? 'scheduled' 
                : 'published'
            );
          }, 1500);
        } catch (e) {
          setIsPublishing(false);
          triggerToast('error', 'Publishing Failed', e.message);
        }
      }, 1500);
    }, 1000);
  };

  const renderPreviewInnerContent = () => {
    return (
      <>
        {/* User Mock Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-205 dark:bg-gray-750 overflow-hidden flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold capitalize">
                {(user.name || user.email || 'U')[0]}
              </div>
            )}
          </div>
          <div className="leading-none text-left">
            <p className="text-[10px] font-bold text-gray-800 dark:text-gray-250">{user.name || user.email}</p>
            <p className="text-[8px] text-gray-400 mt-0.5">Sponsored • Just now</p>
          </div>
        </div>

        {/* Title & Caption */}
        {title && <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight text-left">{title}</p>}
        <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed text-left whitespace-pre-wrap">{caption}</p>

        {/* Media preview */}
        {mediaFiles.length > 0 ? (
          <div className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-55 dark:bg-gray-850 relative h-40">
            {mediaFiles[0].type.startsWith('video') ? (
              <video src={mediaFiles[0].preview} className="w-full h-full object-cover" controls />
            ) : (
              <img src={mediaFiles[0].preview} alt="" className="w-full h-full object-cover" />
            )}
            {mediaFiles.length > 1 && (
              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/60 text-white text-[8px] font-black rounded">
                +{mediaFiles.length - 1} more
              </span>
            )}
          </div>
        ) : null}

        {/* Platform Mocks Feed Action Indicators */}
        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-3 text-gray-455 text-[10px] font-bold">
          <span className="flex items-center gap-1 hover:text-indigo-500"><Heart className="w-3.5 h-3.5" /> Like</span>
          <span className="flex items-center gap-1 hover:text-indigo-500"><MessageCircle className="w-3.5 h-3.5" /> Comment</span>
          <span className="flex items-center gap-1 hover:text-indigo-500"><Share2 className="w-3.5 h-3.5" /> Share</span>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-12">
      {/* Primary Builder (Left Side) */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-soft transition-colors flex flex-col justify-between min-h-[640px]">
        <div>
          {/* Header */}
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Post</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">Upload content assets, optimize titles and schedules, and publish everywhere.</p>
          </div>

          {/* Stepper progress indicator */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-50 dark:border-gray-850">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-1.5 shrink-0 transition-colors pb-1 border-b-2 text-xs font-bold uppercase tracking-wider ${
                  currentStep === s.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : currentStep > s.id
                    ? 'border-gray-400 text-gray-700 dark:text-gray-300'
                    : 'border-transparent text-gray-400 hover:text-gray-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === s.id
                    ? 'bg-indigo-500 text-white'
                    : currentStep > s.id
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {s.id}
                </span>
                <span className="hidden sm:inline">{s.name}</span>
              </button>
            ))}
          </div>

          {/* STEP CONTENTS */}
          <div className="py-2 flex-1 min-h-[320px]">
            {/* Step 1: Title */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Post Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter campaign title for workspace tracking..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-850 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-semibold"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">This title is internal and used to search and trace statistics in your analytics feed.</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Caption */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Caption Description</label>
                    <span className="text-[10px] font-bold text-gray-400">
                      {caption.length} characters
                    </span>
                  </div>
                  
                  <div className="relative border border-gray-150 dark:border-gray-750 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all">
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write your post caption here..."
                      rows={6}
                      className="w-full px-4 py-3 bg-transparent text-gray-850 dark:text-gray-100 rounded-t-2xl text-xs focus:outline-none resize-y font-medium"
                    />
                    
                    {/* Caption Action Toolbar */}
                    <div className="px-3 py-2 bg-gray-100/50 dark:bg-gray-850/50 border-t border-gray-150 dark:border-gray-750 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 relative">
                        {/* Emoji Picker Mock */}
                        <button
                          type="button"
                          onClick={() => setEmojiOpen(!emojiOpen)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
                          title="Insert Emoji"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                        {emojiOpen && (
                          <div className="absolute bottom-10 left-0 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-2.5 rounded-xl shadow-premium z-25 grid grid-cols-5 gap-1.5 w-36">
                            {['🚀', '✨', '🔥', '💡', '🎉', '👇', '💫', '🧵', '🙌', '✅'].map(e => (
                              <button key={e} onClick={() => addEmoji(e)} className="text-sm p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">{e}</button>
                            ))}
                          </div>
                        )}

                        {/* Hashtag Suggestions */}
                        <button
                          type="button"
                          onClick={() => setHashtagOpen(!hashtagOpen)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
                          title="Hashtag Helper"
                        >
                          <Hash className="w-4 h-4" />
                        </button>
                        {hashtagOpen && (
                          <div className="absolute bottom-10 left-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-2 rounded-xl shadow-premium z-25 max-h-36 overflow-y-auto space-y-1 w-40">
                            <p className="text-[9px] font-bold text-gray-400 uppercase p-1">Trending Tags</p>
                            {suggestedHashtags.map(t => (
                              <button key={t} onClick={() => addHashtag(t)} className="text-[10px] w-full text-left p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded text-gray-700 dark:text-gray-300 font-semibold">{t}</button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* AI Utilities */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={aiLoading}
                          onClick={() => runAiCaption('generate')}
                          className="px-2.5 py-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>AI Generate</span>
                        </button>
                        <button
                          type="button"
                          disabled={aiLoading}
                          onClick={() => runAiCaption('improve')}
                          className="px-2.5 py-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-650 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          AI Improve
                        </button>
                        <button
                          type="button"
                          disabled={aiLoading}
                          onClick={() => runAiCaption('rewrite')}
                          className="px-2.5 py-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-650 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          AI Rewrite
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Media */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Attach Media Files</label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl bg-gray-50/50 dark:bg-gray-850/50 p-8 text-center cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/80 flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="p-3 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl shadow-soft text-indigo-500 mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Drag & drop your files here, or <span className="text-indigo-500 hover:underline">browse</span></p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Supports PNG, JPG, MP4, GIF (Max 50MB per file)</p>
                  </div>

                  {/* Upload Progress Bar Mock */}
                  {uploadProgress !== null && (
                    <div className="space-y-1 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 p-3 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                        <span>Uploading assets...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-750 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Preview Gallery */}
                  {mediaFiles.length > 0 && (
                    <div className="space-y-2.5 mt-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Uploaded Assets ({mediaFiles.length})</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {mediaFiles.map((file, idx) => (
                          <div key={idx} className="group relative border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-850 h-28 flex flex-col justify-between">
                            {/* Preview */}
                            {file.type.startsWith('video') ? (
                              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                                <video src={file.preview} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />
                                <span className="text-[9px] bg-black/60 text-white font-bold px-1.5 py-0.5 rounded-md z-10">Video</span>
                              </div>
                            ) : (
                              <img src={file.preview} alt="" className="flex-1 w-full object-cover" />
                            )}

                            {/* File Actions on Hover */}
                            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="p-1 bg-black/75 hover:bg-rose-600 rounded text-white transition-colors cursor-pointer"
                                title="Remove File"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Bottom Info bar */}
                            <div className="p-1.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[8px] font-bold text-gray-500">
                              <span className="truncate max-w-[80px]">{file.name}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <span>{(file.size / 1024).toFixed(0)} KB</span>
                                {!file.type.startsWith('video') && (
                                  <button
                                    type="button"
                                    onClick={() => compressImage(idx)}
                                    className="text-indigo-500 hover:text-indigo-700"
                                    title="Compress file to reduce size"
                                  >
                                    <Minimize2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Channels */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Publishing Channels</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {connectedAccounts.map((acc) => {
                      const isSelected = selectedPlatforms.includes(acc.platform);
                      
                      return (
                        <div
                          key={acc.id}
                          onClick={() => acc.is_connected && togglePlatform(acc.platform)}
                          className={`relative border p-3.5 rounded-2xl cursor-pointer transition-all duration-200 select-none flex flex-col justify-between gap-3 h-32 ${
                            !acc.is_connected 
                              ? 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-150 dark:border-gray-850 opacity-55' 
                              : isSelected
                              ? 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-500 shadow-[0_0_15px_-3px_rgba(79,70,229,0.25)] dark:shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)] scale-[1.01]'
                              : 'bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-[1.01]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-lg">{brandIcons[acc.platform]}</div>
                            {acc.is_connected ? (
                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-white ${
                                isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
                              }`}>
                                {isSelected && <FileCheck className="w-2.5 h-2.5" />}
                              </div>
                            ) : (
                              <span className="text-[8px] font-black text-rose-500 uppercase">Disabled</span>
                            )}
                          </div>

                          <div>
                            <p className="text-[10px] font-bold text-gray-850 dark:text-gray-150 capitalize">{acc.platform}</p>
                            <p className="text-[9px] text-gray-400 truncate font-semibold mt-0.5">
                              {acc.is_connected ? `@${acc.username}` : 'Not Connected'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Publishing Options Section */}
                <div className="pt-6 border-t border-gray-150 dark:border-gray-800 space-y-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">Publishing Options</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Publish Now */}
                    <label className={`flex items-center gap-3 px-4 py-3 border rounded-2xl cursor-pointer transition-all flex-1 select-none ${
                      publishOption === 'now'
                        ? 'bg-indigo-50/10 dark:bg-indigo-950/10 border-indigo-500'
                        : 'bg-gray-55/50 dark:bg-gray-900/30 border-gray-150 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                      <input
                        type="radio"
                        name="publishing_option"
                        value="now"
                        checked={publishOption === 'now'}
                        onChange={() => setPublishOption('now')}
                        className="w-4 h-4 text-indigo-650 focus:ring-indigo-500/20 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                      />
                      <div className="leading-none text-left">
                        <p className="text-xs font-bold text-gray-850 dark:text-gray-150">Publish Now</p>
                        <p className="text-[9px] text-gray-400 mt-1 font-semibold">Deploy variations immediately to all selected platforms</p>
                      </div>
                    </label>

                    {/* Option 2: Schedule for Later */}
                    <label className={`flex items-center gap-3 px-4 py-3 border rounded-2xl cursor-pointer transition-all flex-1 select-none ${
                      publishOption === 'schedule'
                        ? 'bg-indigo-50/10 dark:bg-indigo-950/10 border-indigo-500'
                        : 'bg-gray-55/50 dark:bg-gray-900/30 border-gray-150 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}>
                      <input
                        type="radio"
                        name="publishing_option"
                        value="schedule"
                        checked={publishOption === 'schedule'}
                        onChange={() => setPublishOption('schedule')}
                        className="w-4 h-4 text-indigo-650 focus:ring-indigo-500/20 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                      />
                      <div className="leading-none text-left">
                        <p className="text-xs font-bold text-gray-850 dark:text-gray-150">Schedule for Later</p>
                        <p className="text-[9px] text-gray-400 mt-1 font-semibold">Pick a date and time to automate your distribution</p>
                      </div>
                    </label>
                  </div>

                  {/* Dynamically shown Date & Time Pickers */}
                  <AnimatePresence>
                    {publishOption === 'schedule' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Date</label>
                            <input
                              type="date"
                              required
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-850 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold"
                            />
                          </div>
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Time</label>
                            <input
                              type="time"
                              required
                              value={scheduleTimeOnly}
                              onChange={(e) => setScheduleTimeOnly(e.target.value)}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-855 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold"
                            />
                          </div>
                        </div>

                        {/* Please select a date and time warning */}
                        {(!scheduleDate || !scheduleTimeOnly) && (
                          <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-455 text-[10px] font-bold mt-1 bg-rose-500/5 px-3 py-1.5 rounded-lg border border-rose-500/10 w-fit">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Please select a date and time.</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Step 5: Options */}
            {currentStep === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Publish Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Publishing Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'now', title: 'Publish Now', desc: 'Deploy variations immediately' },
                      { id: 'schedule', title: 'Schedule Later', desc: 'Pick date & timezone' },
                      { id: 'draft', title: 'Save Draft', desc: 'Keep in staging pipeline' }
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setPublishOption(opt.id)}
                        className={`p-3.5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-20 ${
                          publishOption === opt.id
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-500'
                            : 'bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <span className="text-xs font-bold text-gray-850 dark:text-gray-155">{opt.title}</span>
                        <span className="text-[8px] text-gray-400 mt-1 font-semibold">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audience Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Audience Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-850 dark:text-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                      <option value="public">🌐 Public (everyone)</option>
                      <option value="private">🔒 Private (internal)</option>
                      <option value="unlisted">🔗 Unlisted (link only)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-850 dark:text-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                      <option value="everyone">All Followers</option>
                      <option value="subscribers">Subscribers Only</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Scheduler */}
            {currentStep === 6 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {publishOption !== 'schedule' ? (
                  <div className="p-8 text-center bg-gray-55/40 dark:bg-gray-900/30 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-gray-350" />
                    <p className="text-xs font-bold">Scheduling is not active.</p>
                    <p className="text-[10px] mt-1 font-medium">To schedule this post, change the Publishing Mode in Step 5 (Audience) to "Schedule Later".</p>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="mt-4 px-3 py-1.5 bg-white dark:bg-gray-850 hover:bg-gray-55 border border-gray-200 dark:border-gray-700 text-indigo-500 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Update Mode
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Scheduled Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-850 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timezone Target</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-850 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                      >
                        <option value="UTC-5 (EST)">UTC-5 (New York / EST)</option>
                        <option value="UTC+0 (GMT)">UTC+0 (London / GMT)</option>
                        <option value="UTC+5.5 (IST)">UTC+5.5 (New Delhi / IST)</option>
                        <option value="UTC+8 (SGT)">UTC+8 (Singapore / SGT)</option>
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recurrence (Optional)</label>
                      <select
                        value={repeatOption}
                        onChange={(e) => setRepeatOption(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-850 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                      >
                        <option value="none">One-time post</option>
                        <option value="daily">Repeat Daily</option>
                        <option value="weekly">Repeat Weekly</option>
                        <option value="monthly">Repeat Monthly</option>
                      </select>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 7: Preview */}
            {currentStep === 7 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-3 mb-2">
                  <div className="flex gap-1 bg-gray-50 dark:bg-gray-850 p-1 rounded-xl">
                    {selectedPlatforms.map(plat => (
                      <button
                        key={plat}
                        onClick={() => setPreviewTab(plat)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          previewTab === plat
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-550'
                        }`}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>
                  
                  {/* View Settings (Width + Bezel toggle) */}
                  <div className="flex items-center gap-4">
                    {/* Phone Frame Toggle */}
                    {previewMode === 'mobile' && (
                      <div className="flex items-center gap-2 select-none">
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Phone Frame</span>
                        <button
                          onClick={() => setShowPhoneFrame(!showPhoneFrame)}
                          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            showPhoneFrame ? 'bg-indigo-500' : 'bg-gray-250 dark:bg-gray-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              showPhoneFrame ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {/* View Width Toggle */}
                    <div className="flex gap-1 bg-gray-55 dark:bg-gray-850 p-1 rounded-xl">
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer ${previewMode === 'mobile' ? 'bg-white dark:bg-gray-800 text-indigo-500' : ''}`}
                        title="Mobile Mock"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer ${previewMode === 'desktop' ? 'bg-white dark:bg-gray-800 text-indigo-500' : ''}`}
                        title="Desktop Mock"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Publishing Option Preview Metadata */}
                <div className="p-4 bg-gray-50/40 dark:bg-gray-855/20 border border-gray-150 dark:border-gray-800 rounded-2xl text-left space-y-3 font-sans">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wide">Publishing:</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                      {publishOption === 'schedule' ? 'Scheduled' : 'Publish Immediately'}
                    </p>
                  </div>

                  {publishOption === 'schedule' && (
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wide">Date:</p>
                        <p className="text-xs font-bold text-gray-850 dark:text-gray-150 mt-0.5">
                          {scheduleDate || <span className="text-rose-500 font-bold italic">Not selected</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wide">Time:</p>
                        <p className="text-xs font-bold text-gray-855 dark:text-gray-150 mt-0.5">
                          {scheduleTimeOnly || <span className="text-rose-500 font-bold italic">Not selected</span>}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Switchable Mocks */}
                <div className="flex items-center justify-center p-4 bg-gray-55 dark:bg-gray-955 border border-gray-150 dark:border-gray-855 rounded-2xl min-h-[360px] transition-colors">
                  {showPhoneFrame && previewMode === 'mobile' ? (
                    /* Phone Frame Mockup container */
                    <div className="relative mx-auto border-[10px] border-slate-900 dark:border-slate-800 rounded-[38px] shadow-2xl overflow-hidden bg-white dark:bg-gray-900 w-72 h-[450px] flex flex-col">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-4 w-24 bg-slate-900 dark:bg-slate-800 rounded-b-xl z-40 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-955 mr-2" />
                        <div className="w-6 h-0.5 bg-slate-955 rounded-full" />
                      </div>

                      {/* Status Bar */}
                      <div className="h-7 pt-1 px-4 flex justify-between items-center text-[8px] text-gray-500 dark:text-gray-450 font-extrabold bg-gray-50 dark:bg-gray-850 select-none shrink-0">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <span>📶</span>
                          <span>🔋</span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 overflow-y-auto pb-6 scrollbar-none text-left">
                        {/* Platform Mock Headers */}
                        <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] shrink-0">
                            {brandIcons[previewTab]}
                          </div>
                          <div className="flex-1 min-w-0 leading-none text-left">
                            <p className="text-[10px] font-bold text-gray-855 dark:text-gray-100 capitalize">{previewTab} Preview</p>
                            <p className="text-[8px] text-gray-400 mt-0.5">Live Mock Environment</p>
                          </div>
                        </div>

                        {/* Render Post Body */}
                        <div className="p-3 space-y-2.5">
                          {renderPreviewInnerContent()}
                        </div>
                      </div>

                      {/* Home Indicator */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-slate-900 dark:bg-slate-800 rounded-full z-45" />
                    </div>
                  ) : (
                    /* Standard Card View */
                    <div className={`bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-premium overflow-hidden transition-all duration-300 ${
                      previewMode === 'mobile' ? 'w-80' : 'w-full max-w-lg'
                    }`}>
                      {/* Platform Mock Headers */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-855 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs shrink-0">
                          {brandIcons[previewTab]}
                        </div>
                        <div className="flex-1 min-w-0 leading-none text-left">
                          <p className="text-[11px] font-bold text-gray-855 dark:text-gray-100 capitalize">{previewTab} Preview</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Live Mock Environment</p>
                        </div>
                      </div>

                      {/* Preview Body */}
                      <div className="p-4 space-y-3">
                        {!title && !caption && mediaFiles.length === 0 ? (
                          <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
                            <Eye className="w-8 h-8 text-gray-300 dark:text-gray-750" />
                            <p className="font-bold text-gray-550 dark:text-gray-400">No content preview available</p>
                            <p className="text-[10px] text-gray-400 font-medium max-w-xs leading-relaxed">
                              Type a title, description, or upload a media asset in the previous steps to see it rendered here.
                            </p>
                          </div>
                        ) : (
                          renderPreviewInnerContent()
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center border-t border-gray-150 dark:border-gray-800 pt-4 mt-6">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors cursor-pointer ${
              currentStep === 1 ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          {currentStep < 7 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-750 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handlePublishEverywhere()}
              disabled={publishOption === 'schedule' && !scheduleTime}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-all cursor-pointer text-white ${
                publishOption === 'schedule'
                  ? (scheduleTime 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-650 hover:to-purple-700' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent opacity-50')
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-650 hover:to-indigo-700'
              }`}
            >
              {publishOption === 'schedule' ? 'Schedule Post' : 'Publish Now'} <Send className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Summary Panel (Right Side) */}
      <div className="w-full xl:w-80 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-soft transition-colors flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
            Publishing Summary
          </h3>

          <div className="space-y-4">
            {/* Title / Caption indicators */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400">Post Title</p>
              <p className="text-xs font-bold text-gray-850 dark:text-gray-100 truncate">
                {title || <span className="text-gray-350 italic font-medium">Untitled post</span>}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400">Caption Length</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {caption ? `${caption.length} characters` : <span className="text-gray-350 italic font-medium">Empty</span>}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400">Media Count</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {mediaFiles.length > 0 ? `${mediaFiles.length} file(s) attached` : <span className="text-gray-350 italic font-medium">No media uploaded</span>}
              </p>
            </div>

            {/* Selected platforms */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400">Selected Channels ({selectedPlatforms.length})</p>
              <div className="flex flex-wrap gap-1">
                {selectedPlatforms.map(plat => (
                  <span
                    key={plat}
                    className="text-[9px] font-bold px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-750 text-gray-600 dark:text-gray-300 rounded-md uppercase"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Quality Score */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-850">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400">AI Quality Score</span>
                <span className="text-xs font-bold text-indigo-500">{qualityScore}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${qualityScore}%` }} />
              </div>
              <p className="text-[9px] text-gray-400 leading-normal font-medium">
                {qualityScore < 50 ? 'Add media assets and hashtags to optimize reach potential.' : 'Excellent structure! Post variation has high organic reach probability.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 border-t border-gray-100 dark:border-gray-850 pt-4 space-y-2.5">
          {/* Save Draft Button */}
          <button
            onClick={() => handlePublishEverywhere('draft')}
            disabled={isPublishing}
            className="w-full py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 border border-gray-255 dark:border-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <FileCheck className="w-4 h-4 text-indigo-500" />
            <span>Save Draft</span>
          </button>

          {/* Schedule Button */}
          {publishOption === 'schedule' && (!scheduleDate || !scheduleTimeOnly) && (
            <p className="text-[10px] text-rose-500 font-bold text-center mb-1">
              Please select a date and time.
            </p>
          )}
          <button
            onClick={() => handlePublishEverywhere('schedule')}
            disabled={isPublishing || publishOption !== 'schedule' || !scheduleDate || !scheduleTimeOnly}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              publishOption === 'schedule' && scheduleDate && scheduleTimeOnly
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-650 hover:to-purple-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
                : 'bg-gray-100/60 dark:bg-gray-850/40 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent opacity-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Schedule</span>
          </button>

          {/* Publish Now Button */}
          <button
            onClick={() => handlePublishEverywhere('now')}
            disabled={isPublishing || publishOption !== 'now'}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              publishOption === 'now'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-655 hover:to-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
                : 'bg-gray-100/60 dark:bg-gray-855/40 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent opacity-50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Publish Now</span>
          </button>
        </div>
      </div>

      {/* Visual Overlay Loading / Progress for Automation Dispatching */}
      <AnimatePresence>
        {isPublishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-premium"
            >
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
                {publishingStage === 'success' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                    <FileCheck className="w-8 h-8 text-emerald-500" />
                  </motion.div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                )}
              </div>

              <h3 className="text-sm font-bold text-gray-850 dark:text-gray-100">
                {publishingStage === 'saving' && 'Saving Post Details...'}
                {publishingStage === 'dispatching' && 'Publishing...'}
                {publishingStage === 'success' && (
                  publishOption === 'draft'
                    ? 'Your draft has been saved successfully.'
                    : publishOption === 'schedule'
                    ? 'Your post has been scheduled successfully.'
                    : 'Your post has been published successfully.'
                )}
              </h3>
              
              <div className="text-xs text-gray-400 mt-2 font-medium">
                {publishingStage === 'saving' && 'Storing caption variations and staging media assets...'}
                {publishingStage === 'dispatching' && 'Dispatching payloads to connected n8n trigger webhooks...'}
                {publishingStage === 'success' && publishOption === 'schedule' && (
                  <div className="mt-2.5 p-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/40 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-black text-gray-450 tracking-wider">Scheduled Target</p>
                    <p className="text-xs font-bold text-indigo-650 dark:text-indigo-400 mt-1">
                      {scheduleDate} at {scheduleTimeOnly}
                    </p>
                  </div>
                )}
                {publishingStage === 'success' && publishOption !== 'schedule' && 'Automation has intercepted the payloads. Closing window...'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
