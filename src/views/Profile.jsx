import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Building, 
  CreditCard, 
  Save, 
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user, setUser, triggerToast } = useApp();

  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.brand_name || '');

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      name,
      brand_name: company
    }));
    triggerToast('success', 'Profile Updated', 'Workspace details saved.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Edit Details Forms (Left 2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Workspace Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-3xl shadow-soft">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-3 mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Workspace Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-805 dark:text-gray-200 border border-gray-150 dark:border-gray-750 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide">Company or Brand Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Personal Workspace"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-805 dark:text-gray-200 border border-gray-150 dark:border-gray-750 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 border border-gray-150 dark:border-gray-700 text-indigo-500 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 mt-2 ml-auto"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </form>
        </div>
      </div>

      {/* Subscription Tier (Right Side Column) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-3xl shadow-soft flex flex-col justify-between h-[390px]">
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span>Subscription Tier</span>
          </h3>

          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">Plan Active</span>
              <span className="text-[8px] font-black bg-indigo-200 text-indigo-750 dark:bg-indigo-900/60 dark:text-indigo-300 px-2 py-0.5 rounded">AUTO-RENEW</span>
            </div>
            <h4 className="text-lg font-black text-gray-850 dark:text-gray-100">{user.subscription_tier}</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-450 leading-relaxed font-semibold">
              Supports unlimited post publish operations, up to 10 connected social accounts, and automation webhooks.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Billing Period</p>
            <p className="text-[11.5px] font-bold text-gray-700 dark:text-gray-250">Next invoice: $49.00 USD on August 5, 2026</p>
          </div>
        </div>

        <button
          onClick={() => triggerToast('info', 'Enterprise Billing', 'Billing portals require secure OAuth tokens. Contact support@socialflow.ai')}
          className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Manage Invoices & Billing
        </button>
      </div>
    </div>
  );
}
