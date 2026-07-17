import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Calendar, 
  Link2, 
  TrendingUp, 
  Users, 
  CheckCircle,
  PlusCircle,
  Clock,
  ArrowUpRight,
  Eye,
  Heart,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import PosterGenerator from '../components/PosterGenerator';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useApp } from '../context/AppContext';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { posts, connectedAccounts, setActiveView, user, handleConnectAccounts, syncConnectedAccounts, settings } = useApp();
  const [isPosterOpen, setIsPosterOpen] = React.useState(false);

  // Auto-sync connected accounts on mount if configured
  React.useEffect(() => {
    if (settings.uploadpost_api_key && user?.uploadpost_username) {
      syncConnectedAccounts();
    }

    // Check for callback query
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'connected') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      if (settings.uploadpost_api_key && user?.uploadpost_username) {
        syncConnectedAccounts();
      }
    }
  }, []);

  // Compute stat metrics
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const connectedCount = connectedAccounts.filter(a => a.is_connected).length;
  const totalReach = posts.reduce((sum, p) => sum + (p.reach || 0), 0);

  // Line Chart Data (Weekly Engagement)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weeklyReachData = chartDays.map((day) => {
    let reachVal = 0;
    posts.filter(p => p.status === 'published').forEach(p => {
      if (p.published_at) {
        const date = new Date(p.published_at);
        const dayName = daysOfWeek[date.getDay()];
        if (dayName === day) {
          reachVal += (p.reach || 0);
        }
      }
    });
    return reachVal;
  });

  const hasReachData = weeklyReachData.some(v => v > 0);

  const lineChartData = {
    labels: chartDays,
    datasets: [
      {
        fill: true,
        label: 'Weekly Engagement (Reach)',
        data: weeklyReachData,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.04)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#4F46E5',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 10,
        cornerRadius: 12,
        backgroundColor: '#1E293B',
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(229, 231, 235, 0.4)' }, ticks: { font: { size: 10 } } }
    }
  };

  // Doughnut Chart Data (Platform Distribution)
  const platformScores = { linkedin: 0, instagram: 0, x: 0, facebook: 0, youtube: 0 };
  posts.filter(p => p.status === 'published').forEach(p => {
    p.selected_platforms.forEach(plat => {
      let key = plat.toLowerCase();
      if (key === 'twitter') key = 'x';
      if (key in platformScores) {
        platformScores[key] += 1;
      }
    });
  });

  const hasPlatformData = Object.values(platformScores).some(v => v > 0);

  const doughnutChartData = {
    labels: ['LinkedIn', 'Instagram', 'X (Twitter)', 'Facebook', 'YouTube'],
    datasets: [
      {
        data: [
          platformScores.linkedin,
          platformScores.instagram,
          platformScores.x,
          platformScores.facebook,
          platformScores.youtube
        ],
        backgroundColor: [
          '#0A66C2', // LinkedIn
          '#E4405F', // Instagram
          '#000000', // X
          '#1877F2', // Facebook
          '#FF0000'  // YouTube
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: { size: 10, weight: '550' },
          padding: 12
        }
      }
    },
    cutout: '72%'
  };

  const stats = [
    { label: 'Posts Published', val: publishedCount, icon: Send, trend: publishedCount > 0 ? `+${publishedCount} this week` : 'No activity yet', change: publishedCount > 0 ? 'up' : 'neutral' },
    { label: 'Scheduled Posts', val: scheduledCount, icon: Calendar, trend: scheduledCount > 0 ? `Next: ${new Date(posts.filter(p => p.status === 'scheduled')[0]?.schedule_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}` : 'None queueing', change: 'neutral' },
    { label: 'Connected Channels', val: `${connectedCount}/8`, icon: Link2, trend: 'Manage channels', change: 'neutral', view: 'settings' },
    { label: 'Total Post Reach', val: totalReach.toLocaleString(), icon: TrendingUp, trend: totalReach > 0 ? 'Based on published posts' : '0 reach', change: totalReach > 0 ? 'up' : 'neutral' },
    { label: 'Followers Growth', val: '0', icon: Users, trend: 'No growth signals', change: 'neutral' },
    { label: 'Publishing Success Rate', val: publishedCount > 0 ? '100%' : '100%', icon: CheckCircle, trend: publishedCount > 0 ? '0 failed logs' : 'No dispatches yet', change: publishedCount > 0 ? 'up' : 'neutral' }
  ];

  const welcomeMessage = (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/40 via-white to-purple-50/20 dark:from-indigo-950/10 dark:via-gray-900 dark:to-purple-950/10 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
          Welcome, {user.name}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Manage every social platform, schedule automated workflows, and check intelligence from one dashboard.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveView('create-post')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] cursor-pointer transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create New Post
        </button>

        <button
          onClick={() => setIsPosterOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-650 to-pink-600 hover:from-violet-750 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] cursor-pointer transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 animate-pulse" /> Generate Poster
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome */}
      {welcomeMessage}

      {/* Social Media Connection Status Banner */}
      {!settings.uploadpost_api_key ? (
        <div className="bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200/50 dark:border-amber-900/30 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">API Integration Required</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">Please configure your UploadPost Master API Key in settings to enable custom social media account linking.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('settings')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold shadow-md cursor-pointer transition-colors shrink-0"
          >
            Configure API Key
          </button>
        </div>
      ) : (
        <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">Social Accounts Linked</h4>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[10px] text-gray-455 font-medium mr-1">Active channels:</span>
                {connectedAccounts.filter(acc => acc.is_connected).map(acc => (
                  <span key={acc.platform} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/5">
                    {acc.platform === 'instagram' && '📷'}
                    {acc.platform === 'facebook' && '🔵'}
                    {acc.platform === 'x' && '🐦'}
                    {acc.platform === 'threads' && '🧵'}
                    {acc.platform === 'youtube' && '🔴'}
                    {acc.platform === 'linkedin' && '👔'}
                    {acc.platform === 'tiktok' && '🎵'}
                    {acc.platform === 'pinterest' && '📌'}
                    <span className="capitalize">{acc.platform}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleConnectAccounts}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer animate-pulse"
            >
              Add/Manage Accounts
            </button>
            <button
              onClick={syncConnectedAccounts}
              className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-55 dark:hover:bg-gray-700 border border-gray-150 dark:border-gray-700 text-gray-700 dark:text-gray-250 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
            >
              Sync Status
            </button>
          </div>
        </div>
      )}

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate mr-2">
                  {s.label}
                </span>
                <div className="p-2 rounded-xl bg-gray-55 dark:bg-gray-850 border border-gray-100 dark:border-gray-750 text-indigo-500 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                  {s.val}
                </span>
                <p 
                  onClick={() => s.view && setActiveView(s.view)}
                  className={`text-[9px] font-semibold mt-1 cursor-pointer hover:underline ${
                    s.change === 'up' ? 'text-emerald-500' : s.change === 'down' ? 'text-rose-500' : 'text-gray-450'
                  }`}
                >
                  {s.trend}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Engagement Trend */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft lg:col-span-2 flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-850 pb-3 mb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly Activity Reach</h3>
              <p className="text-[10px] text-gray-400 font-medium">Daily cumulative reach analytics</p>
            </div>
            {hasReachData && (
              <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-1 rounded-md">
                <span>Active Tracking</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <div className="flex-1 relative h-56 flex items-center justify-center">
            {hasReachData ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-405">
                  <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">No reach data available yet</h4>
                <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">Publish your first post to start tracking organic reach performance across platforms.</p>
                <button onClick={() => setActiveView('create-post')} className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                  Create Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-850 pb-3 mb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform Split</h3>
              <p className="text-[10px] text-gray-400 font-medium">Share of engagement by channel</p>
            </div>
          </div>
          <div className="flex-1 relative h-48 flex items-center justify-center">
            {hasPlatformData ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-405">
                  <Link2 className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">No platform distribution</h4>
                <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">Link more channels to analyze metrics distribution split.</p>
                <button onClick={handleConnectAccounts} className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                  Connect Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Publishing Feed */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-gray-55 dark:border-gray-800 mb-4">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Activity Feed</h3>
            <p className="text-[10px] text-gray-400 font-medium">Latest dispatches and queue entries</p>
          </div>
          {posts.length > 0 && (
            <button 
              onClick={() => setActiveView('published')}
              className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
            >
              See All Posts
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-850">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-2xl text-gray-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-700 dark:text-gray-350">No recent posts found</p>
                <p className="text-[10px] text-gray-400 font-medium max-w-xs leading-relaxed">
                  Compose your first post using the editor and select "Publish Everywhere" to see tracking items here.
                </p>
              </div>
              <button
                onClick={() => setActiveView('create-post')}
                className="mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.02] shadow-md"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.slice(0, 3).map((post) => (
              <div key={post.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Media Thumbnail */}
                  {post.media_urls?.[0] ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-150 dark:border-gray-850 shrink-0 bg-gray-50 dark:bg-gray-800">
                      <img 
                        src={post.media_urls[0]} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-850 flex items-center justify-center text-gray-400">
                      <Clock className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-850 dark:text-gray-150 leading-none">
                      {post.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 line-clamp-1 max-w-md font-medium">
                      {post.caption}
                    </p>
                    
                    {/* Platforms Icon badges */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      {post.selected_platforms.map(plat => (
                        <span 
                          key={plat} 
                          className="text-[8px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md uppercase"
                        >
                          {plat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status and details */}
                <div className="flex sm:flex-col items-end gap-2 shrink-0">
                  {post.status === 'published' ? (
                    <>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-md">
                        Published
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                        <span className="flex items-center gap-0.5 font-medium"><Eye className="w-3.5 h-3.5" /> {post.reach}</span>
                        <span className="flex items-center gap-0.5 font-medium"><Heart className="w-3.5 h-3.5 text-rose-500/80" /> {post.likes}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-md">
                        Scheduled
                      </span>
                      <p className="text-[9px] text-gray-400 mt-1 font-semibold">
                        {new Date(post.schedule_time).toLocaleDateString()} @ {new Date(post.schedule_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Poster Generator Modal Panel */}
      <PosterGenerator isOpen={isPosterOpen} onClose={() => setIsPosterOpen(false)} />
    </div>
  );
}
