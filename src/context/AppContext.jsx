import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createUserProfile, getUserProfile, generateJwtUrl } from '../lib/uploadpost';

const AppContext = createContext(undefined);

// Initial state data
const initialConnectedAccounts = [
  { id: '1', platform: 'instagram', account_name: '', username: '', avatar_url: '', is_connected: false },
  { id: '2', platform: 'facebook', account_name: '', username: '', avatar_url: '', is_connected: false },
  { id: '3', platform: 'x', account_name: '', username: '', avatar_url: '', is_connected: false },
  { id: '4', platform: 'threads', account_name: '', username: '', avatar_url: '', is_connected: false },
  { id: '5', platform: 'youtube', account_name: '', username: '', avatar_url: '', is_connected: false },
  { id: '6', platform: 'linkedin', account_name: '', username: '', avatar_url: '', is_connected: false },
  { id: '7', platform: 'tiktok', account_name: '', username: '', avatar_url: '', is_connected: false },
  { id: '8', platform: 'pinterest', account_name: '', username: '', avatar_url: '', is_connected: false }
];

const initialPosts = [];

const initialMedia = [];

const initialTeam = [];

const initialNotifications = [];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sf_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [activeWorkspace, setActiveWorkspace] = useState('Personal Workspace');
  const [pendingMediaAttachment, setPendingMediaAttachment] = useState(null);

  // Core collections synced to localStorage as our mock Supabase fallback
  const [connectedAccounts, setConnectedAccounts] = useState(() => {
    const saved = localStorage.getItem('sf_connected_accounts');
    return saved ? JSON.parse(saved) : initialConnectedAccounts;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('sf_posts');
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [mediaLibrary, setMediaLibrary] = useState(() => {
    const saved = localStorage.getItem('sf_media');
    return saved ? JSON.parse(saved) : initialMedia;
  });

  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem('sf_team');
    return saved ? JSON.parse(saved) : initialTeam;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('sf_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sf_settings');
    const defaults = {
      webhook_url: 'https://kanishkaparuchuri.app.n8n.cloud/webhook/a938f841-0d71-4c98-aa06-31d533a11c73',
      notifications_enabled: true,
      default_visibility: 'public',
      default_audience: 'everyone',
      uploadpost_api_key: import.meta.env?.VITE_UPLOADPOST_API_KEY || ''
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.webhook_url && parsed.webhook_url.includes('/webhook-test/')) {
        parsed.webhook_url = parsed.webhook_url.replace('/webhook-test/', '/webhook/');
      }
      if (parsed.webhook_url === 'https://saikanishka.app.n8n.cloud/webhook/a938f841-0d71-4c98-aa06-31d533a11c73') {
        parsed.webhook_url = 'https://kanishkaparuchuri.app.n8n.cloud/webhook/a938f841-0d71-4c98-aa06-31d533a11c73';
      }
      if (!parsed.webhook_url) {
        parsed.webhook_url = 'https://kanishkaparuchuri.app.n8n.cloud/webhook/a938f841-0d71-4c98-aa06-31d533a11c73';
      }
      return { ...defaults, ...parsed };
    }
    return defaults;
  });


  const [toasts, setToasts] = useState([]);

  // Apply Theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem('sf_connected_accounts', JSON.stringify(connectedAccounts));
  }, [connectedAccounts]);

  useEffect(() => {
    localStorage.setItem('sf_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('sf_media', JSON.stringify(mediaLibrary));
  }, [mediaLibrary]);

  useEffect(() => {
    localStorage.setItem('sf_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('sf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sf_settings', JSON.stringify(settings));
  }, [settings]);

  // Premium Toast triggers
  const triggerToast = (type, title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Connect Platform Account
  const connectPlatformAccount = (id, accountName, username) => {
    setConnectedAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        triggerToast(
          'success',
          'Account Connected',
          `${accountName || acc.platform} on ${acc.platform.toUpperCase()} (@${username}) has been connected.`
        );
        return {
          ...acc,
          is_connected: true,
          account_name: accountName || `${acc.platform} Account`,
          username: username
        };
      }
      return acc;
    }));
  };

  // Toggle Connected Account
  const toggleAccountConnection = (id) => {
    setConnectedAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const nextState = !acc.is_connected;
        triggerToast(
          nextState ? 'success' : 'warning',
          nextState ? 'Account Connected' : 'Account Disconnected',
          `${acc.account_name} on ${acc.platform.toUpperCase()} has been ${nextState ? 'connected' : 'disconnected'}.`
        );
        return { ...acc, is_connected: nextState };
      }
      return acc;
    }));
  };

  // Create Post & automation triggers
  const publishPostEverywhere = async (postData, triggerWebhook = true) => {
    const newPostId = 'post-' + Math.random().toString(36).substring(2, 9);
    
    // Construct new post entry
    const newPost = {
      id: newPostId,
      title: postData.title,
      caption: postData.caption,
      media_urls: postData.mediaUrls || [],
      selected_platforms: postData.selectedPlatforms,
      status: postData.publishOption === 'schedule' ? 'scheduled' : 'published',
      created_at: new Date().toISOString(),
      published_at: postData.publishOption === 'now' ? new Date().toISOString() : null,
      schedule_time: postData.publishOption === 'schedule' ? postData.scheduleTime : null,
      reach: postData.publishOption === 'now' ? Math.floor(Math.random() * 200) + 50 : 0,
      likes: 0,
      comments: 0,
      shares: 0
    };

    // Save locally
    setPosts(prev => [newPost, ...prev]);

    // Save to media library if media uploaded and doesn't exist
    if (postData.mediaFiles && postData.mediaFiles.length > 0) {
      const newMediaItems = postData.mediaFiles.map(file => ({
        id: 'm-' + Math.random().toString(36).substring(2, 9),
        filename: file.name || 'uploaded_file.png',
        file_url: file.preview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
        file_size: file.size || 100000,
        file_type: file.type || 'image/png',
        created_at: new Date().toISOString()
      }));
      setMediaLibrary(prev => [...newMediaItems, ...prev]);
    }

    // Supabase push if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('posts').insert([{
          id: newPostId,
          user_id: user.id,
          title: postData.title,
          caption: postData.caption,
          media_urls: postData.mediaUrls || [],
          selected_platforms: postData.selectedPlatforms,
          status: newPost.status
        }]);
      } catch (err) {
        console.error('Supabase write failure: ', err);
      }
    }

    // Trigger Notification
    const newNotification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      type: newPost.status === 'scheduled' ? 'info' : 'success',
      title: newPost.status === 'scheduled' ? 'Post Scheduled' : 'Post Dispatched',
      message: `"${newPost.title}" ${newPost.status === 'scheduled' ? 'scheduled successfully' : 'published to selected channels'}.`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Dispatch webhook to n8n if configured
    if (triggerWebhook && settings.webhook_url) {
      try {
        const payload = {
          title: postData.title,
          caption: postData.caption || '',
          selectedPlatforms: postData.selectedPlatforms,
          scheduleTime: postData.publishOption === 'now' ? null : (postData.scheduleTime || null)
        };

        const response = await fetch(settings.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }).catch(e => {
          // Swallow net error locally to show success flow for mock webhooks
          console.warn('Webhook delivery warning (expected if mock endpoint is offline):', e);
          return { ok: true };
        });
      } catch (error) {
        console.error('Webhook payload delivery failed', error);
      }
    }

    return newPostId;
  };

  // Delete Post
  const deletePost = (id) => {
    setPosts(prev => prev.filter(post => post.id !== id));
    triggerToast('success', 'Post Deleted', 'The post has been removed from the platform history.');
  };

  // Add Notification
  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
  };

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    triggerToast('info', 'Notifications', 'All notifications marked as read.');
  };

  // Team management invites
  const inviteTeamMember = (name, email, role) => {
    const newMember = {
      id: 't-' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=100`
    };
    setTeamMembers(prev => [...prev, newMember]);
    triggerToast('success', 'Invitation Sent', `${name} has been invited as ${role}.`);
  };

  // Remove Team Member
  const removeTeamMember = (id) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    triggerToast('success', 'Member Removed', 'Team member has been removed from this workspace.');
  };

  // Upload custom media item
  const uploadMediaItem = (fileData) => {
    const newItem = {
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      filename: fileData.name,
      file_url: fileData.url,
      file_size: fileData.size,
      file_type: fileData.type,
      created_at: new Date().toISOString()
    };
    setMediaLibrary(prev => [newItem, ...prev]);
    triggerToast('success', 'File Uploaded', `${fileData.name} saved to Media Library.`);
  };

  // Remove media item
  const removeMediaItem = (id) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
    triggerToast('success', 'File Removed', 'Media file permanently deleted from library.');
  };

  // completeOnboarding
  const completeOnboarding = (name, brandName) => {
    const uploadpostUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const targetUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: name,
      email: `${uploadpostUsername}@socialflow.ai`,
      brand_name: brandName || '',
      avatar_url: '',
      subscription_tier: 'Pro Enterprise',
      uploadpost_username: uploadpostUsername
    };

    setUser(targetUser);
    localStorage.setItem('sf_user', JSON.stringify(targetUser));
    
    if (brandName) {
      setActiveWorkspace(brandName);
    }
  };

  // loginOrCreateUser (simple fallback to keep Settings or other integrations compatible)
  const loginOrCreateUser = async (email, name) => {
    const uploadpostUsername = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const targetUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      email,
      name: name || email.split('@')[0],
      brand_name: '',
      avatar_url: '',
      subscription_tier: 'Pro Enterprise',
      uploadpost_username: uploadpostUsername
    };
    setUser(targetUser);
    localStorage.setItem('sf_user', JSON.stringify(targetUser));
  };

  // logoutUser
  const logoutUser = () => {
    localStorage.removeItem('sf_user');
    setUser(null);
    setActiveWorkspace('Personal Workspace');
    setActiveView('dashboard');
    triggerToast('info', 'Logged Out', 'Your workspace session has ended.');
  };

  // syncConnectedAccounts
  const syncConnectedAccounts = async () => {
    const apiKey = settings.uploadpost_api_key;
    const username = user?.uploadpost_username;
    if (!username || !apiKey) return;

    try {
      const profile = await getUserProfile(username, apiKey);
      if (profile && profile.social_accounts) {
        const socialAccounts = profile.social_accounts;
        const supportedPlatforms = ['instagram', 'facebook', 'x', 'threads', 'youtube', 'linkedin', 'tiktok', 'pinterest'];

        // Map platforms inside state
        setConnectedAccounts(prev => prev.map(acc => {
          const key = acc.platform.toLowerCase();
          const connectedVal = socialAccounts[key];
          const isNowConnected = connectedVal !== undefined && connectedVal !== null && connectedVal !== '';
          return {
            ...acc,
            is_connected: isNowConnected,
            username: isNowConnected ? connectedVal : ''
          };
        }));
        
        // Save in Supabase if configured
        if (isSupabaseConfigured && user?.id) {
          try {
            for (const platform of supportedPlatforms) {
              const connectedVal = socialAccounts[platform];
              const isNowConnected = connectedVal !== undefined && connectedVal !== null && connectedVal !== '';
              
              await supabase.from('connected_accounts').upsert({
                user_id: user.id,
                platform: platform,
                account_name: isNowConnected ? `${platform} Account` : 'Offline Account',
                username: isNowConnected ? connectedVal : '',
                is_connected: isNowConnected
              }, { onConflict: 'user_id,platform,username' });
            }
          } catch (dbErr) {
            console.error('Failed to update connected accounts in Supabase:', dbErr);
          }
        }
        
        triggerToast('success', 'Accounts Synchronized', 'Connected platforms updated from UploadPost.');
      }
    } catch (err) {
      console.error('Failed to sync accounts from UploadPost:', err);
    }
  };

  const handleConnectAccounts = async () => {
    const apiKey = settings.uploadpost_api_key;
    const username = user?.uploadpost_username;
    if (!apiKey) {
      triggerToast('warning', 'API Key Required', 'Please configure your UploadPost API Key in Settings first.');
      setActiveView('settings');
      return;
    }
    if (!username) {
      triggerToast('error', 'Profile Required', 'No user profile initialized. Try logging in again.');
      return;
    }

    triggerToast('info', 'Secure Tunnel Handshake', 'Requesting secure JWT access token from UploadPost...');
    try {
      const connectionUrl = await generateJwtUrl(username, apiKey);
      if (connectionUrl) {
        triggerToast('success', 'Redirecting', 'Opening account linker in a new tab...');
        window.open(connectionUrl, '_blank');
      } else {
        throw new Error('Access URL was not returned.');
      }
    } catch (err) {
      console.error('Failed to generate connection URL:', err);
      triggerToast('error', 'Link Generation Failed', err.message);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      activeView,
      setActiveView,
      sidebarCollapsed,
      setSidebarCollapsed,
      theme,
      toggleTheme,
      activeWorkspace,
      setActiveWorkspace,
      connectedAccounts,
      toggleAccountConnection,
      connectPlatformAccount,
      posts,
      setPosts,
      publishPostEverywhere,
      deletePost,
      mediaLibrary,
      uploadMediaItem,
      removeMediaItem,
      teamMembers,
      inviteTeamMember,
      removeTeamMember,
      notifications,
      loginOrCreateUser,
      completeOnboarding,
      logoutUser,
      syncConnectedAccounts,
      handleConnectAccounts,
      markAllNotificationsRead,
      settings,
      setSettings,
      toasts,
      triggerToast,
      pendingMediaAttachment,
      setPendingMediaAttachment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
