import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const { loginOrCreateUser, loginWithGoogle, triggerToast } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local state for developer client ID override if VITE_GOOGLE_CLIENT_ID is not configured
  const envClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
  const savedClientId = window.localStorage.getItem('sf_google_client_id');
  const [tempClientId, setTempClientId] = useState(savedClientId || '');
  const [showDevPanel, setShowDevPanel] = useState(false);

  const isGoogleConfigured = !!(envClientId || tempClientId);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // If client ID is not configured and developer hasn't entered one, show error
      if (!isGoogleConfigured) {
        throw new Error('Google Client ID is missing. Please configure it in your .env file or use the developer credentials assistant panel below.');
      }
      
      // Save temp Client ID to localStorage if entered manually
      if (tempClientId && !envClientId) {
        window.localStorage.setItem('sf_google_client_id', tempClientId);
      }
      
      // Initiate oauth redirect flow
      await loginWithGoogle(tempClientId || null);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Google Authentication failed. Please try again.');
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    try {
      if (mode === 'signup') {
        if (!trimmedName) throw new Error('Please enter your full name.');
        await loginOrCreateUser(trimmedEmail, trimmedName);
        triggerToast('success', 'Account Created!', `Welcome to SocialFlow AI, ${trimmedName}!`);
      } else {
        await loginOrCreateUser(trimmedEmail, null);
        triggerToast('success', 'Welcome Back!', `Successfully signed in as ${trimmedEmail}`);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
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
        <AnimatePresence mode="wait">
          {loading ? (
            /* Loading State */
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Signing you in...</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-[260px] leading-relaxed">
                Please wait while we establish a secure connection and configure your publishing workspace.
              </p>
            </motion.div>
          ) : (
            /* Redesigned Login/SignUp Card Form */
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                  Sign in to create, manage, and publish content across your connected social media accounts.
                </p>
              </div>

              {/* Inline Friendly Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-bold text-rose-800 dark:text-rose-400">Authentication Error</p>
                      <p className="text-[10px] text-rose-700 dark:text-rose-350 mt-1 leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {/* Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-150 dark:border-gray-700/80 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-100 cursor-pointer shadow-soft hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.527 6.705l3.739 3.06Z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.275c0-.825-.075-1.616-.215-2.383H12v4.513h6.446a5.51 5.51 0 0 1-2.39 3.616l3.722 2.883c2.177-2.01 3.431-4.966 3.431-8.629Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.266 14.235A7.16 7.16 0 0 1 4.909 12c0-.79.13-1.55.357-2.265L1.527 6.67A11.968 11.968 0 0 0 0 12c0 1.93.456 3.753 1.266 5.378l4-3.143Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.97-1.075 7.96-2.925l-3.722-2.883c-1.03.69-2.35 1.1-4.238 1.1-3.255 0-6.012-2.199-7.003-5.16L1.258 17.29A11.954 11.954 0 0 0 12 24Z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Or</span>
                  <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                </div>

                {/* Email Toggle Option */}
                {!showEmailForm ? (
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-850 rounded-xl text-xs font-bold text-gray-505 dark:text-gray-400 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    Continue with Email
                  </button>
                ) : (
                  /* Form Container */
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleEmailSignIn}
                    className="space-y-4 overflow-hidden"
                  >
                    {mode === 'signup' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-505 uppercase tracking-wide">Full Name</label>
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
                            className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-850 dark:text-gray-100 rounded-xl border border-gray-150 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-gray-450"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-505 uppercase tracking-wide">Email address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-850 dark:text-gray-100 rounded-xl border border-gray-150 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-gray-450"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wide">Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 text-gray-855 dark:text-gray-100 rounded-xl border border-gray-150 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold placeholder-gray-455"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      <span>{mode === 'login' ? 'Continue with Email' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                )}
              </div>

              {/* Mode Switcher */}
              <div className="text-center mt-6">
                <p className="text-xs text-gray-455 dark:text-gray-455">
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        onClick={() => { setMode('signup'); resetState(); }}
                        className="text-indigo-500 hover:text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        onClick={() => { setMode('login'); resetState(); }}
                        className="text-indigo-500 hover:text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* Developer Configuration panel (for testing OAuth without Env configuration) */}
              {!envClientId && (
                <div className="mt-8 border-t border-dashed border-gray-150 dark:border-gray-800 pt-4 text-left">
                  <button
                    type="button"
                    onClick={() => setShowDevPanel(!showDevPanel)}
                    className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors mx-auto cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span>OAuth Credentials Assistant</span>
                    <span className="text-[8px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-full capitalize">
                      {isGoogleConfigured ? 'Connected' : 'Configure'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showDevPanel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-850 overflow-hidden"
                      >
                        <p className="text-[10px] text-gray-455 dark:text-gray-400 leading-relaxed mb-3">
                          To execute the <strong>real Google OAuth 2.0 Sign-In</strong>, provide a Google Client ID below. We will secure it in local cache.
                        </p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={tempClientId}
                            onChange={(e) => setTempClientId(e.target.value)}
                            placeholder="PASTE_YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"
                            className="w-full px-3 py-2 text-[10px] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <p className="text-[9px] text-amber-500 font-semibold leading-relaxed">
                            💡 Remember to register <code>{window.location.origin}</code> in the "Authorized redirect URIs" within the Google Cloud Console.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
