import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UploadCloud, 
  Trash2, 
  Eye,
  FileImage,
  FolderHeart,
  Grid,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MediaLibrary() {
  const { mediaLibrary, uploadMediaItem, removeMediaItem, triggerToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'image' | 'video'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Computed metrics
  const totalStorageUsed = mediaLibrary.reduce((sum, item) => sum + item.file_size, 0);
  const maxStorageLimit = 100 * 1024 * 1024; // 100 MB
  const storagePercentage = Math.min((totalStorageUsed / maxStorageLimit) * 100, 100);

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-96" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="h-32 bg-gray-150 dark:bg-gray-850 rounded-2xl" />
          <div className="h-32 bg-gray-150 dark:bg-gray-850 rounded-2xl" />
          <div className="h-32 bg-gray-150 dark:bg-gray-850 rounded-2xl" />
          <div className="h-32 bg-gray-150 dark:bg-gray-850 rounded-2xl" />
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
          <h3 className="text-sm font-bold text-gray-855 dark:text-gray-150">Could not retrieve library</h3>
          <p className="text-xs text-gray-400 font-medium">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); }} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all shadow-md">
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const handleUpload = () => {
    // Mimic uploading a random premium image from Unsplash
    const randomPhotos = [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600'
    ];
    const randomIndex = Math.floor(Math.random() * randomPhotos.length);
    const mockFile = {
      name: `campaign_visual_${Math.floor(Math.random()*900)+100}.jpg`,
      url: randomPhotos[randomIndex],
      size: Math.floor(Math.random() * 400000) + 100000,
      type: 'image/jpeg'
    };
    
    uploadMediaItem(mockFile);
  };

  // Filter items
  const filteredItems = mediaLibrary.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' 
      ? true 
      : filterType === 'image' 
      ? item.file_type.startsWith('image') 
      : item.file_type.startsWith('video');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Media Library</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Manage uploaded marketing visual assets, compress size scales, and use in posts.</p>
        </div>

        <button
          onClick={handleUpload}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-[1.02] shrink-0"
        >
          <UploadCloud className="w-4 h-4" /> Upload Visual
        </button>
      </div>

      {/* Storage and Query Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Search Filters */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filename elements..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-2 shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">📁 All Files</option>
              <option value="image">📷 Images only</option>
              <option value="video">🎥 Videos only</option>
            </select>
          </div>
        </div>

        {/* Right Storage Capacity */}
        <div className="bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-850 rounded-2xl flex flex-col justify-between shadow-soft">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            <span>Storage Capacity</span>
            <span className="text-gray-650 dark:text-gray-350">{(totalStorageUsed / (1024*1024)).toFixed(1)} MB / 100 MB</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${storagePercentage}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-12 rounded-3xl text-center shadow-soft max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-2">
            <FolderHeart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-850 dark:text-gray-155">No assets found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto font-medium leading-relaxed">Upload images or video files to build your media library and reuse them in upcoming campaigns.</p>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 cursor-pointer"
          >
            Upload Visual Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="group bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-premium transition-all h-36 flex flex-col justify-between relative"
            >
              {/* Thumbnail Container */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-850 relative overflow-hidden">
                <img 
                  src={item.file_url} 
                  alt={item.filename} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
                
                {/* Visual hover delete trigger */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                  <button
                    onClick={() => removeMediaItem(item.id)}
                    className="p-1.5 bg-rose-600 rounded-lg text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom tag bar */}
              <div className="p-2 border-t border-gray-100 dark:border-gray-800 leading-none shrink-0 bg-white dark:bg-gray-900">
                <p className="text-[9px] font-bold text-gray-800 dark:text-gray-200 truncate">{item.filename}</p>
                <div className="flex items-center justify-between text-[8px] text-gray-400 font-bold mt-1.5">
                  <span className="uppercase">{item.file_type.split('/')[1]}</span>
                  <span>{(item.file_size / 1024).toFixed(0)} KB</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
