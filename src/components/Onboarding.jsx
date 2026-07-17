import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const { completeOnboarding, triggerToast } = useApp();
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedBrand = brandName.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    try {
      completeOnboarding(trimmedName, trimmedBrand);
      triggerToast('success', `Welcome, ${trimmedName}!`, 'Your workspace is ready.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-150 dark:border-gray-800/80 rounded-3xl p-8 shadow-premium z-10 relative"
      >
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          {/* Custom Elegant SocialFlow SVG Logo */}
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black mx-auto shadow-md mb-5 hover:rotate-6 transition-transform">
            <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome to SocialFlow AI
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 font-medium leading-relaxed max-w-[340px] mx-auto">
            Let's personalize your workspace before you start creating and publishing content.
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-805 dark:text-gray-100 rounded-xl border border-gray-150 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-gray-450"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Company or Brand Name (Optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Building className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-805 dark:text-gray-100 rounded-xl border border-gray-150 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-gray-450"
              />
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 text-left">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
