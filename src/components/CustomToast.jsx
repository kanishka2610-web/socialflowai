import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CustomToast() {
  const { toasts } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'danger':
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/25 dark:border-emerald-500/20';
      case 'warning':
        return 'border-amber-500/25 dark:border-amber-500/20';
      case 'danger':
      case 'error':
        return 'border-rose-500/25 dark:border-rose-500/20';
      case 'info':
      default:
        return 'border-indigo-500/25 dark:border-indigo-500/20';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur border ${getBorderColor(toast.type)} rounded-2xl shadow-premium`}
          >
            <div className="mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
