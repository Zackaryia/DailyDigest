# Daily Digest

Daily Digest is an app to keep you informed with the information you care about.

A Cloudflare Workers application that provides personalized article recommendations using AI matching.

## Features

- **User Registration**: Sign up with email and interests
- **Article Ingestion**: Manual article submission and RSS feed parsing
- **AI Matching**: Uses Cloudflare Workers AI to match articles to user interests
- **Notifications**: Send personalized digests to users
- **Email Briefings**: Automatic email delivery of daily briefings
- **React Frontend**: Modern UI with Tailwind CSS and Ceader OS

## Backend (Cloudflare Worker)

### APIs

- `POST /api/register` - Register a new user
- `POST /api/new-article` - Submit a new article
- `POST /api/ingest-rss` - Ingest articles from RSS feed
- `POST /api/notify-recent` - Send recent article notifications
- `GET /api/briefing?email=user@example.com` - Generate and email structured briefing

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `wrangler.toml` with your KV namespaces and email service:
   ```toml
   [[kv_namespaces]]
   binding = "USERS"
   id = "your_users_kv_id"

   [[kv_namespaces]]
   binding = "ARTICLES"
   id = "your_articles_kv_id"

   [[kv_namespaces]]
   binding = "BRIEFINGS"
   id = "your_briefings_kv_id"

   [ai]
   binding = "AI"

   # Email service for briefing notifications
   send_email = [
     {name = "EMAIL", destination_address = "noreply@yourdomain.com"}
   ]
   ```

3. **Email Setup Requirements**:
   - Configure a custom domain in Cloudflare Dashboard
   - Set up Email Routing for your domain
   - Update the `destination_address` in wrangler.toml to match your domain
   - Ensure your domain has proper SPF, DKIM, and DMARC records for email deliverability

4. Run locally:
   ```bash
   wrangler dev
   ```

## Frontend (React + Vite)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Pages

- `/` - Landing page with sign-up form
- `/signup` - Dedicated sign-up page
- `/debug` - API testing console

## Tech Stack

- **Backend**: Cloudflare Workers, KV Storage, Workers AI
- **Frontend**: React, TypeScript, Tailwind CSS, Ceader OS
- **Build**: Vite, Wrangler

