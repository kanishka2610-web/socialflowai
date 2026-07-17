import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Check, 
  Mail, 
  Settings, 
  User,
  Sparkles,
  Inbox,
  ChevronDown,
  LogOut,
  Link2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { 
    theme, 
    toggleTheme, 
    notifications, 
    markAllNotificationsRead, 
    setActiveView,
    activeWorkspace,
    user,
    logoutUser
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-40 flex items-center justify-between transition-colors">
      {/* Search Bar */}
      <div className="relative w-80 max-w-full">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </span>
        <input
          type="text"
          placeholder="Search posts, channels, settings... (Cmd + K)"
          className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-100 dark:border-gray-750 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-700 rounded-md shadow-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Workspace Quick Tag */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-750 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {activeWorkspace}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-750"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer relative border border-transparent hover:border-gray-100 dark:hover:border-gray-750"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <>
              {/* Overlay click to close */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-premium z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-600 rounded-md">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 transition-colors ${
                          !notif.is_read 
                            ? 'bg-indigo-50/15 dark:bg-indigo-950/10' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-850/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-xs font-semibold text-gray-850 dark:text-gray-100">
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-gray-400 shrink-0">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                
                <div 
                  onClick={() => { setActiveView('settings'); setNotifOpen(false); }}
                  className="p-2 text-center border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-[10px] text-indigo-500 font-bold"
                >
                  Configure Notification Settings
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar with dropdown */}
        <div className="relative font-sans">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-750 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-150 dark:border-gray-700 transition-transform group-hover:scale-105 flex items-center justify-center shrink-0">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.email} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold capitalize"
                style={{ display: user.avatar_url ? 'none' : 'flex' }}
              >
                {(user.name || user.email)[0]}
              </div>
            </div>
            
            {/* Display Name and Chevron */}
            <div className="hidden sm:flex flex-col items-start text-left leading-none">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-250 truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">
                {user.subscription_tier || 'Pro Enterprise'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </button>

          {dropdownOpen && (
            <>
              {/* Invisible Overlay to close on outside click */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-premium z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* User Header */}
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <p className="text-xs font-bold text-gray-855 dark:text-gray-150 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-450 dark:text-gray-500 truncate mt-0.5">{user.brand_name || 'Personal Workspace'}</p>
                </div>

                {/* Dropdown Options */}
                <button
                  onClick={() => { setActiveView('profile'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer text-left border-none"
                >
                  <User className="w-4 h-4 text-gray-450" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => { setActiveView('settings'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer text-left border-none"
                >
                  <Link2 className="w-4 h-4 text-gray-450" />
                  <span>Connected Accounts</span>
                </button>

                <button
                  onClick={() => { setActiveView('settings'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-indigo-500 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer text-left border-none"
                >
                  <Settings className="w-4 h-4 text-gray-455" />
                  <span>Settings</span>
                </button>

                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                <button
                  onClick={() => { logoutUser(); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 font-bold transition-colors cursor-pointer text-left border-none"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>

              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
