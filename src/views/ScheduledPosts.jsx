import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  List, 
  Trash2, 
  Edit3, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ScheduledPosts() {
  const { posts, deletePost, triggerToast, setPosts, setActiveView } = useApp();
  const [layoutMode, setLayoutMode] = useState('timeline'); // 'timeline' | 'calendar'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // If mock connection is offline (no token/API key), we can set error under certain mock conditions, 
      // but by default we transition to success state.
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter scheduled posts
  const scheduledPosts = posts.filter(post => post.status === 'scheduled');

  // Calendar State Mock
  const [currentDate, setCurrentDate] = useState(new Date());

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-96" />
          </div>
        </div>
        <div className="space-y-4 mt-6">
          <div className="h-28 bg-gray-150 dark:bg-gray-850 rounded-3xl" />
          <div className="h-28 bg-gray-150 dark:bg-gray-850 rounded-3xl" />
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
          <h3 className="text-sm font-bold text-gray-850 dark:text-gray-150">Could not retrieve queue</h3>
          <p className="text-xs text-gray-400 font-medium">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); }} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all shadow-md">
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const handleCancelSchedule = (id) => {
    deletePost(id);
    triggerToast('success', 'Post Cancelled', 'The scheduled post has been deleted.');
  };

  const handleReschedule = (id) => {
    // Add 1 day to schedule time
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const current = new Date(post.schedule_time);
        current.setDate(current.getDate() + 1);
        triggerToast('success', 'Rescheduled', `Post rescheduled for ${current.toLocaleDateString()}`);
        return {
          ...post,
          schedule_time: current.toISOString()
        };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Scheduled Posts</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Verify variations, edit schedule queues, and cancel upcoming publications.</p>
        </div>

        {/* Layout Switchers */}
        <div className="flex gap-1 bg-gray-50 dark:bg-gray-850 p-1 rounded-xl shrink-0 border border-gray-100 dark:border-gray-750">
          <button
            onClick={() => setLayoutMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              layoutMode === 'timeline'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-650'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Timeline
          </button>
          <button
            onClick={() => setLayoutMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              layoutMode === 'calendar'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-650'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
      </div>

      {/* Contents */}
      {scheduledPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-12 rounded-3xl text-center shadow-soft max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-850 dark:text-gray-150">No scheduled posts</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto font-medium leading-relaxed">
            Create a new post in the wizard and choose "Schedule Later" to set an upcoming publish date.
          </p>
          <button
            onClick={() => setActiveView('create-post')}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 cursor-pointer"
          >
            Create New Post
          </button>
        </div>
      ) : layoutMode === 'timeline' ? (
        // Timeline View
        <div className="space-y-4">
          {scheduledPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-3xl shadow-soft hover:shadow-premium transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
              {/* Image thumbnail and caption details */}
              <div className="flex gap-4 items-start">
                {post.media_urls?.[0] ? (
                  <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-850">
                    <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 flex items-center justify-center text-gray-450 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-950 dark:text-gray-100">{post.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xl font-medium leading-relaxed">
                    {post.caption}
                  </p>
                  
                  {/* Selected Channels Badge */}
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {post.selected_platforms.map(plat => (
                      <span
                        key={plat}
                        className="text-[8px] font-bold px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md uppercase"
                      >
                        {plat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Operations */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-gray-50 dark:border-gray-850 md:border-t-0 pt-3 md:pt-0 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-850 dark:text-gray-200">
                    {new Date(post.schedule_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                    at {new Date(post.schedule_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex gap-1.5 ml-2">
                  <button
                    onClick={() => handleReschedule(post.id)}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 border border-gray-150 dark:border-gray-800 transition-all cursor-pointer"
                    title="Reschedule (+1 Day)"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancelSchedule(post.id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-gray-400 hover:text-rose-550 dark:hover:text-rose-400 border border-gray-150 dark:border-gray-800 transition-all cursor-pointer"
                    title="Cancel Publication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Calendar View Mock
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-lg text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
              <h3 className="text-xs font-bold text-gray-850 dark:text-gray-150 uppercase tracking-wider">July 2026</h3>
              <button className="p-1 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-lg text-gray-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <span className="text-[10px] text-gray-400 font-bold">5 Posts Scheduled</span>
          </div>

          <div className="grid grid-cols-7 gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden p-1">
            {/* Days of Week */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center py-2 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">{d}</div>
            ))}
            
            {/* Calendar Days grids */}
            {Array.from({ length: 31 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasPost = scheduledPosts.some(p => new Date(p.schedule_time).getDate() === dayNum);
              const post = scheduledPosts.find(p => new Date(p.schedule_time).getDate() === dayNum);

              return (
                <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-850/50 min-h-[72px] p-1.5 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors">
                  <span className="text-[9px] font-semibold text-gray-400">{dayNum}</span>
                  {hasPost && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-md p-1 leading-tight text-[8px] font-medium text-indigo-600 dark:text-indigo-400 truncate">
                      {post.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
