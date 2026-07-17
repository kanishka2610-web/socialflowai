import React from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  MessageSquare, 
  Clock, 
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const { posts, setActiveView } = useApp();

  const publishedPosts = posts.filter(post => post.status === 'published');

  // Compute dynamic metrics
  const totalReach = publishedPosts.reduce((sum, p) => sum + (p.reach || 0), 0);
  const totalLikes = publishedPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = publishedPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const totalShares = publishedPosts.reduce((sum, p) => sum + (p.shares || 0), 0);

  const engagementRate = totalReach > 0 
    ? (((totalLikes + totalComments + totalShares) / totalReach) * 100).toFixed(2) + '%'
    : '0.00%';

  const totalClicks = 0; // Clicks not tracked yet in current MVP version

  // Follower Line Chart
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weeklyReachData = chartDays.map((day) => {
    let reachVal = 0;
    publishedPosts.forEach(p => {
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
        label: 'Reach trends',
        data: weeklyReachData,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.03)',
        borderWidth: 2.5,
        tension: 0.4,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(229, 231, 235, 0.3)' }, ticks: { font: { size: 10 } } }
    }
  };

  // Platform Bar Chart comparison
  const platformScores = { instagram: { likes: 0, comments: 0 }, x: { likes: 0, comments: 0 }, facebook: { likes: 0, comments: 0 }, linkedin: { likes: 0, comments: 0 }, youtube: { likes: 0, comments: 0 } };
  
  publishedPosts.forEach(p => {
    (p.selected_platforms || []).forEach(plat => {
      let key = plat.toLowerCase();
      if (key === 'twitter') key = 'x';
      if (key in platformScores) {
        platformScores[key].likes += (p.likes || 0);
        platformScores[key].comments += (p.comments || 0);
      }
    });
  });

  const hasBarData = Object.values(platformScores).some(p => p.likes > 0 || p.comments > 0);

  const barChartData = {
    labels: ['Instagram', 'X (Twitter)', 'Facebook', 'LinkedIn', 'YouTube'],
    datasets: [
      {
        label: 'Likes',
        data: [
          platformScores.instagram.likes,
          platformScores.x.likes,
          platformScores.facebook.likes,
          platformScores.linkedin.likes,
          platformScores.youtube.likes
        ],
        backgroundColor: 'rgba(79, 70, 229, 0.85)',
        borderRadius: 8
      },
      {
        label: 'Comments',
        data: [
          platformScores.instagram.comments,
          platformScores.x.comments,
          platformScores.facebook.comments,
          platformScores.linkedin.comments,
          platformScores.youtube.comments
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.85)',
        borderRadius: 8
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { boxWidth: 10, font: { size: 10 } } } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(229, 231, 235, 0.3)' } }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-xs text-gray-400 mt-1 font-medium">Deep-dive organic traffic reports, click-through rates, and best optimal publishing schedules.</p>
      </div>

      {publishedPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 py-16 rounded-3xl text-center shadow-soft max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto shadow-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-gray-850 dark:text-gray-150">No analytics available yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto font-medium leading-relaxed">
              Publish your first post to start tracking reach and engagement performance.
            </p>
          </div>
          <button
            onClick={() => setActiveView('create-post')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] cursor-pointer transition-all"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <>
          {/* Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Organic Impressions', val: totalReach.toLocaleString(), change: totalReach > 0 ? 'Active' : '0%', sub: 'cumulative reach', icon: Eye, color: 'text-indigo-500' },
              { label: 'Avg Engagement Rate', val: engagementRate, change: totalReach > 0 ? 'Active' : '0%', sub: 'likes/comments ratio', icon: TrendingUp, color: 'text-purple-500' },
              { label: 'Total Post Clicks', val: totalClicks.toLocaleString(), change: '0%', sub: 'estimated clicks', icon: MousePointer, color: 'text-emerald-500' },
              { label: 'Comments & Replies', val: totalComments.toLocaleString(), change: totalComments > 0 ? 'Active' : '0%', sub: 'total feedback', icon: MessageSquare, color: 'text-amber-500' }
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-900 p-5 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-soft">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{m.label}</span>
                    <div className={`p-2 bg-gray-55 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mt-4">{m.val}</h3>
                  <p className="text-[10px] text-emerald-500 font-bold mt-1">
                    {m.change} <span className="text-gray-450 font-medium"> {m.sub}</span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Graphs & Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reach Trends */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft h-96 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-800 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reach & Impression Trends</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Cumulative monthly visibility index</p>
                </div>
              </div>
              <div className="flex-1 relative h-64">
                {hasReachData ? (
                  <Line data={lineChartData} options={lineChartOptions} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <p className="text-xs font-semibold">Insufficient reach data to plot trend line</p>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement Breakdowns */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft h-96 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-3 border-b border-gray-55 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channel Engagements</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Platform breakdown for Likes & Comments</p>
                </div>
              </div>
              <div className="flex-1 relative h-64">
                {hasBarData ? (
                  <Bar data={barChartData} options={barChartOptions} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <p className="text-xs font-semibold">Insufficient engagement records to display split</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optimal Publishing Times and Platform Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Best Times */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Optimal Publishing Windows</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Target intervals computed from historical click metrics</p>
              </div>

              <div className="border border-dashed border-gray-200 dark:border-gray-800 p-6 text-center text-[10px] text-gray-400 rounded-2xl bg-gray-50/20">
                <p className="font-semibold">No optimal windows calculated yet</p>
                <p className="mt-1">We require a history of at least 5 published posts to map high-engagement publishing windows.</p>
              </div>
            </div>

            {/* Audience Demographic summaries */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demographic Metrics</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Top regional traffic origins</p>
              </div>

              <div className="border border-dashed border-gray-200 dark:border-gray-800 p-6 text-center text-[10px] text-gray-450 rounded-2xl bg-gray-50/20 my-4 flex-1 flex flex-col items-center justify-center">
                <p className="font-semibold">No audience demographic data available</p>
                <p className="mt-1 max-w-[180px] mx-auto leading-relaxed">Geographic data aggregates automatically as clicks and reach events register.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
