# Work Dashboard — Setup Guide

A 4-panel dashboard monitoring:
- 🗞️ Poland mentions in US media (NewsAPI.org)
- 🔴 Trump's Truth Social posts (public RSS, no account needed)
- 📧 Outlook / Work email (Microsoft Graph OAuth)
- 🐦 Your Twitter / X feed (browser-embedded timeline)

---

## Quick start

```bash
# Install all dependencies
npm run install:all

# Create your .env file
cp server/.env.example server/.env
# → Edit server/.env with your API keys (see below)

# Start both servers (frontend + backend)
npm run dev
```

Then open **http://localhost:5173**

---

## API Key Setup

### 1. NewsAPI.org (for Poland news)
1. Register for a free account at https://newsapi.org/register
2. Copy your API key
3. Set `NEWS_API_KEY=your_key` in `server/.env`

> Free tier: 100 requests/day. The dashboard refreshes every 5 minutes by default (288 requests/day — consider setting it to 10 min on the free plan).

---

### 2. Truth Social (Trump's posts)
No setup needed. Uses the public RSS feed at `https://truthsocial.com/@realDonaldTrump.rss`.

---

### 3. Outlook / Work email (Microsoft Graph)

You need to register an Azure application:

1. Go to https://portal.azure.com → **Azure Active Directory** → **App registrations** → **New registration**
2. Name: `Work Dashboard` | Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
3. Redirect URI: `Web` → `http://localhost:3001/api/outlook/callback`
4. Click **Register**
5. Copy the **Application (client) ID** → `OUTLOOK_CLIENT_ID`
6. Go to **Certificates & secrets** → **New client secret** → copy the value → `OUTLOOK_CLIENT_SECRET`
7. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions** → add: `Mail.Read`, `offline_access`, `openid`, `profile`, `email`
8. Click **Grant admin consent**

Set in `server/.env`:
```
OUTLOOK_CLIENT_ID=your_client_id
OUTLOOK_CLIENT_SECRET=your_client_secret
OUTLOOK_TENANT_ID=common   # or your specific tenant ID
```

Once the server is running, click **Connect** in the Outlook panel to sign in.

---

### 4. Twitter / X timeline
No API key needed. The panel embeds the official Twitter timeline widget using your browser's logged-in X session.

1. Make sure you're signed in to X in your browser
2. Open **Settings** in the dashboard and enter your **Twitter username** (without @)

---

## Customization

Click the **⚙ Settings** button (top right) to:
- **Reorder panels** by dragging
- **Hide/show** any panel
- **Change auto-refresh intervals** per panel
- **Change the news search query** (default: `Poland`)
- **Switch Truth Social account** handle
- **Choose Outlook folder** (Inbox, Sent, Drafts…)
- **Switch between dark/light theme**

Settings are saved to `localStorage` automatically.
