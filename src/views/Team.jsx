import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Mail,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Team() {
  const { teamMembers, inviteTeamMember, removeTeamMember } = useApp();
  
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    inviteTeamMember(inviteName, inviteEmail, inviteRole);
    setInviteName('');
    setInviteEmail('');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 animate-pulse">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-soft space-y-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
          <div className="space-y-4 mt-6">
            <div className="h-12 bg-gray-150 dark:bg-gray-850 rounded-2xl" />
            <div className="h-12 bg-gray-150 dark:bg-gray-850 rounded-2xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-soft h-96" />
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
          <h3 className="text-sm font-bold text-gray-855 dark:text-gray-155">Could not retrieve team</h3>
          <p className="text-xs text-gray-400 font-medium">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); }} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all shadow-md">
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Active Team Members Grid (Left 2 columns) */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-soft space-y-6">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Workspace Members</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">Configure roles and permissions for editors and analysts within this workspace.</p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-850">
          {teamMembers.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-2xl text-gray-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-700 dark:text-gray-300">No workspace members</p>
                <p className="text-[10px] text-gray-400 font-medium max-w-xs leading-relaxed">
                  Invite your colleagues to collaborate on scheduling and publishing campaigns.
                </p>
              </div>
            </div>
          ) : (
            teamMembers.map((member) => (
              <div key={member.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-150 dark:border-gray-700 bg-gray-50">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="leading-none">
                    <p className="text-xs font-bold text-gray-855 dark:text-gray-100">{member.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{member.email}</p>
                  </div>
                </div>

                {/* Role badge and delete */}
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold ${
                    member.role === 'Admin' 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' 
                      : member.role === 'Editor'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {member.role}
                  </span>

                  {member.role !== 'Admin' && (
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Member Panel (Right side) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-soft flex flex-col justify-between h-96">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Invite Member</span>
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Sarah Chen"
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-150 dark:border-gray-750 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="sarah.c@socialflow.ai"
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-150 dark:border-gray-750 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-455 uppercase tracking-wide">Workspace Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-150 dark:border-gray-750 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            >
              <option value="Editor">Editor (Create & Schedule)</option>
              <option value="Viewer">Viewer (Analytics only)</option>
              <option value="Admin">Admin (Full Control)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite to Team
          </button>
        </form>

        <p className="text-[9px] text-gray-400 leading-normal mt-6 font-semibold">
          * Invited users will receive an activation workspace email to confirm credentials.
        </p>
      </div>
    </div>
  );
}
