# SocialFlow AI - Posting Lifecycle Workflow

This document explains the step-by-step workflow of creating, scheduling, and publishing posts in SocialFlow AI.

## Step-by-Step Workflow

```
[Onboarding] -> [Create Post Wizard] -> [Preview & Validate] -> [Action Dispatch] -> [Success Modal]
```

### 1. Welcome & Onboarding
- Fresh sessions detect missing credentials and render a minimal onboarding card.
- User provides a **Full Name** and optional **Company/Brand Name**.
- AppContext provisions a workspace container mapping the user inputs.

### 2. Post Builder Wizard
- **Step 1 (Title)**: Define the internal title for organization.
- **Step 2 (Caption)**: Compose the body copy. Features integrated AI helpers for generating, improving, and rewriting copy.
- **Step 3 (Media Uploads / Poster Generator)**:
  - Manually attach image/video files.
  - Or, generate custom poster assets inside the AI Poster Generator modal.
- **Step 4 (Channels)**: Toggle destination platforms (LinkedIn, Instagram, Facebook, X, YouTube, Threads, etc.) and configure **Publishing Options** (Publish Now vs. Schedule for Later).
- **Step 5 (Audience Settings)**: Define targeting details.
- **Step 6 (Scheduler Summary)**: Confirms the dispatch parameters.
- **Step 7 (Real-time Preview)**: Renders live mock feeds. Supports a Phone Frame bezel view (notch, status bar) for realistic previews.

### 3. Action Dispatches
- **Publish Now**: Immediately fires payload containing `scheduleTime: null` to the production n8n webhook.
- **Schedule**: Captures user timezone and formats selected date/time to ISO 8601, transmitting it in the payload.
- **Save Draft**: Persists the post locally in drafts for future modifications.
