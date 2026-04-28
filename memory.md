# Interview Prep Project Memory

## Purpose
- Interview prep platform for senior Java backend roles.
- Focus tracks: Google / NVIDIA / TSMC IT.
- Primary workflow is backlog-style cards, not date-based homework.

## Current App Shape
- Frontend: single-file app in `index.html`.
- Backend: lightweight Node server in `server.js`.
- Hosting: Render Web Service.
- Data:
  - Supabase Auth for login.
  - Supabase tables/functions for profile + progress sync.
  - AI chat history is still local-only in browser `localStorage` (per card).

## Important URLs
- GitHub repo: `https://github.com/install88/CodingPractice`
- Current production app: `https://codingpractice-web.onrender.com`
- Older Render static site exists historically: `https://codingpractice.onrender.com`
  - Do not use it for AI features.
- Supabase project URL:
  - `https://hbccslbwxxvkutzncakl.supabase.co`

## Auth / User Model
- Uses Supabase email/password under the hood, but UI exposes `username + password`.
- First successfully created user becomes `admin`.
- Main existing test/admin user:
  - username: `weiZheng`
- Progress is tied to the Supabase user and should survive cross-device login.

## Progress / Learning System
- Card-based backlog flow.
- Current card, completed cards, weakness list, weekly review scores sync to Supabase.
- `All users` page shows cross-user progress summary.
- Completed cards can be toggled on/off; unchecking should remove completion state.

## AI Assistant
- NVIDIA AI assistant uses server-side proxy at `/api/nvidia/chat`.
- Frontend has:
  - small side-panel assistant
  - full-page chat view that feels closer to ChatGPT/Codex
- Full-page chat supports:
  - per-card conversation context
  - model switching
  - quick actions: explain / hint / mock follow-up
  - per-card chat history in localStorage

## Current NVIDIA Setup
- Render env vars that matter:
  - `NVIDIA_API_KEY`
  - `NVIDIA_MODEL`
  - `NVIDIA_MODELS`
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` can use server defaults.
- `server.js` defaults:
  - `NVIDIA_API_BASE_URL = https://integrate.api.nvidia.com/v1`
  - `NVIDIA_UPSTREAM_TIMEOUT_MS = 45000`
- Known behavior:
  - some NVIDIA hosted models are much slower than others
  - `google/gemma-4-31b-it` has been more usable than some NVIDIA-branded models

## Known UX / Tech Notes
- General browser mode may be affected by extensions; Incognito once helped isolate auth issues.
- AI chat is not yet stored in Supabase.
- `index.html` is large and still carries most UI logic inline.
- A future cleanup path would be:
  - split data / UI / styles
  - move AI conversation persistence into Supabase

## Recent Important Commits
- `3406d3f` Add NVIDIA NIM assistant proxy
- `4bdf149` Refresh Supabase session before NVIDIA requests
- `401aba3` Expose NVIDIA auth failure details
- `5fedc6f` Add NVIDIA request timeouts
- `7052fa5` Add full-page NVIDIA chat experience

## Latest Local-Only Change (not yet committed when this file was written)
- Pressing `Enter` in AI prompt/chat now sends the message.
- `Shift + Enter` keeps newline behavior.
