import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Calendar, 
  CheckCircle2, 
  Image, 
  BarChart3, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { 
    activeView, 
    setActiveView, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    user,
    logoutUser,
    activeWorkspace,
    theme
  } = useApp();

  const menuItems = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'create-post', label: 'Create Post', icon: PlusCircle, highlight: true },
    { view: 'scheduled', label: 'Scheduled Posts', icon: Calendar },
    { view: 'published', label: 'Published Posts', icon: CheckCircle2 },
    { view: 'media', label: 'Media Library', icon: Image },
    { view: 'analytics', label: 'Analytics', icon: BarChart3 },
    { view: 'team', label: 'Team', icon: Users },
    { view: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-white dark:bg-gray-900 border-r border-gray-150 dark:border-gray-800 transition-all duration-300 flex flex-col justify-between h-screen sticky top-0 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Info */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white tracking-tight leading-none text-base">
                  SocialFlow AI
                </span>
                <span className="text-[10px] text-indigo-500 font-semibold tracking-wider uppercase mt-1">
                  Enterprise
                </span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Collapse Menu"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="mx-auto mt-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Expand Menu"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Selector Mock */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-all cursor-pointer">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{activeWorkspace}</p>
                <p className="text-[10px] text-gray-400 truncate">Workspace owner</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-gray-900 dark:hover:text-gray-100'
                } ${item.highlight && !isActive ? 'border border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!sidebarCollapsed && item.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animation-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Details */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={() => setActiveView('profile')}
            className="h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-gray-150 dark:border-gray-700 cursor-pointer hover:opacity-85 transition-opacity flex items-center justify-center"
            title="Profile"
          >
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name || user.email} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold capitalize">
                {(user.name || user.email)[0]}
              </div>
            )}
          </button>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p 
                onClick={() => setActiveView('profile')}
                className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate hover:text-indigo-500 cursor-pointer transition-colors"
              >
                {user.name}
              </p>
              <p className="text-[10px] text-gray-400 truncate leading-none mt-0.5">{user.brand_name || 'Personal Workspace'}</p>
              <div className="mt-1">
                <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-md">
                  {user.subscription_tier}
                </span>
              </div>
            </div>
          )}
          {!sidebarCollapsed && (
            <button 
              onClick={logoutUser}
              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
