-- SocialFlow AI Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  avatar_url text,
  subscription_tier text default 'Free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Connected Accounts Table
create table if not exists public.connected_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  platform text not null, -- 'instagram', 'facebook', 'x', 'threads', 'youtube', 'linkedin', 'pinterest', 'tiktok'
  account_name text not null,
  username text,
  avatar_url text,
  is_connected boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, platform, username)
);

-- 3. Posts Table
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  caption text,
  media_urls text[] default '{}',
  selected_platforms text[] default '{}',
  status text default 'draft', -- 'draft', 'scheduled', 'published', 'failed'
  options jsonb default '{}'::jsonb, -- custom options per platform
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Scheduled Posts Table
create table if not exists public.scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  schedule_time timestamp with time zone not null,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Published Posts Table
create table if not exists public.published_posts (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reach integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  details jsonb default '{}'::jsonb, -- specific return payload from the platforms
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Media Library Table
create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  filename text not null,
  file_url text not null,
  file_size integer not null,
  file_type text not null, -- 'image/png', 'image/jpeg', 'video/mp4', 'image/gif'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Analytics Table
create table if not exists public.analytics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  platform text not null,
  metric_date date not null,
  followers integer default 0,
  reach integer default 0,
  engagement_rate numeric(5,2) default 0.00,
  impressions integer default 0,
  clicks integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, platform, metric_date)
);

-- 8. Notifications Table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  type text not null, -- 'success', 'warning', 'error', 'info'
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Settings Table
create table if not exists public.settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade unique,
  webhook_url text default '',
  notifications_enabled boolean default true,
  default_visibility text default 'public', -- 'public', 'private', 'unlisted'
  default_audience text default 'everyone', -- 'everyone', 'followers', 'subscribers'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Enablement
alter table public.users enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.posts enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.published_posts enable row level security;
alter table public.media enable row level security;
alter table public.analytics enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;

-- Basic user access policies
create policy "Users can view and update their own data" on public.users
  for all using (auth.uid() = id);

create policy "Users can manage their own connected accounts" on public.connected_accounts
  for all using (auth.uid() = user_id);

create policy "Users can manage their own posts" on public.posts
  for all using (auth.uid() = user_id);

create policy "Users can manage their own scheduled entries" on public.scheduled_posts
  for all using (exists (
    select 1 from public.posts where posts.id = scheduled_posts.post_id and posts.user_id = auth.uid()
  ));

create policy "Users can manage their own published entries" on public.published_posts
  for all using (exists (
    select 1 from public.posts where posts.id = published_posts.post_id and posts.user_id = auth.uid()
  ));

create policy "Users can manage their own media files" on public.media
  for all using (auth.uid() = user_id);

create policy "Users can view their own analytics" on public.analytics
  for all using (auth.uid() = user_id);

create policy "Users can manage their own notifications" on public.notifications
  for all using (auth.uid() = user_id);

create policy "Users can manage their own settings" on public.settings
  for all using (auth.uid() = user_id);
