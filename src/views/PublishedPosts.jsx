import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Send, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

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

export default function PublishedPosts() {
  const { posts, deletePost, publishPostEverywhere, triggerToast, setActiveView, setPosts } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const publishedPosts = posts.filter(post => post.status === 'published');

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="h-48 bg-gray-150 dark:bg-gray-850 rounded-3xl" />
          <div className="h-48 bg-gray-150 dark:bg-gray-850 rounded-3xl" />
          <div className="h-48 bg-gray-150 dark:bg-gray-850 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 py-12 rounded-3xl text-center shadow-soft max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-955/20 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-855 dark:text-gray-150">Could not retrieve history</h3>
          <p className="text-xs text-gray-400 font-medium">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); }} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all shadow-md">
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const handleRepublish = async (post) => {
    triggerToast('info', 'Republishing Post', 'Dispatched variation replication engine...');
    try {
      await publishPostEverywhere({
        title: `${post.title} (Republished)`,
        caption: post.caption,
        mediaUrls: post.media_urls,
        selectedPlatforms: post.selected_platforms,
        publishOption: 'now'
      });
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.85 }
      });
    } catch (e) {
      triggerToast('error', 'Republish Failure', e.message);
    }
  };

  const handleDuplicate = (post) => {
    // Populate form data, we can just trigger a Toast or simulate duplicate
    const duplicatedPost = {
      ...post,
      id: 'post-' + Math.random().toString(36).substring(2, 9),
      title: `${post.title} (Copy)`,
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      reach: Math.floor(Math.random() * 100) + 10,
      likes: 0,
      comments: 0,
      shares: 0
    };
    setPosts(prev => [duplicatedPost, ...prev]);
    triggerToast('success', 'Post Duplicated', 'Copied variations successfully. Check Dashboard feed.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Published Posts</h2>
        <p className="text-xs text-gray-400 mt-1 font-medium">Verify organic reach, monitor engagement signals, and duplicate successful creatives.</p>
      </div>

      {publishedPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-12 rounded-3xl text-center shadow-soft max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-2">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-850 dark:text-gray-155">No published entries</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto font-medium leading-relaxed">Go to the Create Post wizard and publish variations to populate history.</p>
          <button
            onClick={() => setActiveView('create-post')}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 cursor-pointer"
          >
            Create New Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {publishedPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all flex flex-col justify-between h-[390px]"
            >
              {/* Media Header Visual */}
              {post.media_urls?.[0] ? (
                <div className="h-44 bg-gray-100 dark:bg-gray-850 overflow-hidden relative border-b border-gray-100 dark:border-gray-850 shrink-0">
                  <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                    {post.selected_platforms.map(plat => (
                      <span
                        key={plat}
                        className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
                      >
                        {brandIcons[plat]} {plat}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-44 bg-slate-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-center text-gray-400 text-xs font-semibold relative">
                  Text-only Post
                  <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                    {post.selected_platforms.map(plat => (
                      <span
                        key={plat}
                        className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-black uppercase"
                      >
                        {plat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Context */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate leading-none">
                    {post.title}
                  </h4>
                  <p className="text-[10.5px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed font-medium">
                    {post.caption}
                  </p>
                </div>

                {/* Metrics Analytics */}
                <div className="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-750 text-center mt-3 shrink-0">
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Reach</p>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <Eye className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{post.reach}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Likes</p>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <Heart className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{post.likes}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Comments</p>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <MessageSquare className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{post.comments}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Shares</p>
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <Share2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{post.shares}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Operations */}
              <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-855/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 text-gray-400 shrink-0">
                <span className="text-[9px] font-semibold text-gray-400">
                  Published {new Date(post.published_at).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(post)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-450 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title="Duplicate Post"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRepublish(post)}
                    className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg text-gray-450 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    title="Republish Everywhere"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-gray-450 hover:text-rose-550 dark:hover:text-rose-450 transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
