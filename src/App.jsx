import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CustomToast from './components/CustomToast';
import Onboarding from './components/Onboarding';

// Views
import Dashboard from './views/Dashboard';
import CreatePost from './views/CreatePost';
import ScheduledPosts from './views/ScheduledPosts';
import PublishedPosts from './views/PublishedPosts';
import MediaLibrary from './views/MediaLibrary';
import Analytics from './views/Analytics';
import Team from './views/Team';
import Settings from './views/Settings';
import Profile from './views/Profile';

import './App.css';

function MainAppLayout() {
  const { activeView, user } = useApp();

  // If no user is logged in/onboarded, redirect them to the Onboarding screen (Protected Route)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <Onboarding />
        <CustomToast />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic View Viewport */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'create-post' && <CreatePost />}
          {activeView === 'scheduled' && <ScheduledPosts />}
          {activeView === 'published' && <PublishedPosts />}
          {activeView === 'media' && <MediaLibrary />}
          {activeView === 'analytics' && <Analytics />}
          {activeView === 'team' && <Team />}
          {activeView === 'settings' && <Settings />}
          {activeView === 'profile' && <Profile />}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-6 px-6 text-center transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide">
              SocialFlow AI © 2026 • Version 1.0.4 (Enterprise Production)
            </span>
            <div className="flex gap-4 text-[10px] text-gray-450 font-bold">
              <a href="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-500 transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Alert Portal */}
      <CustomToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
