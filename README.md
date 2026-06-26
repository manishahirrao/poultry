# PoultryPulse AI

India's first AI-powered broiler price intelligence platform for commercial poultry farmers.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
poutrysense/
├── apps/
│   └── web/                 # Next.js 15 web application
│       ├── app/            # App Router pages
│       ├── components/     # React components
│       ├── lib/            # Utilities and helpers
│       └── providers/      # React context providers
├── packages/
│   └── ui/                 # Shared UI components
└── specs/                  # Design, requirements, and task documentation
```

## 🔧 Environment Variables

### Setup Instructions

1. Copy the example environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Fill in your actual values in `apps/web/.env.local`

3. **NEVER commit** `.env.local` to version control (it's already in `.gitignore`)

### Environment Variables Reference

#### Public Variables (NEXT_PUBLIC_*)
These variables are safe to expose to the browser and are used in client-side code:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key for client-side operations
- `NEXT_PUBLIC_DEFAULT_LANGUAGE` - Default language ('hi' or 'en')
- `NEXT_PUBLIC_ENABLE_ACCURACY_DASHBOARD` - Feature flag for accuracy dashboard
- `NEXT_PUBLIC_ENABLE_WHATSAPP_DEMO` - Feature flag for WhatsApp demo
- `NEXT_PUBLIC_ENABLE_REFERRAL_PROGRAM` - Feature flag for referral program
- `NEXT_PUBLIC_DEBUG` - Debug mode flag

#### Private Variables (Server-only)
These variables must NEVER be exposed to the client:

- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key with elevated privileges
- `SLACK_WEBHOOK_URL` - Slack webhook for uptime alerts

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing
3. Navigate to Settings → API
4. Copy the Project URL and anon key
5. For service role key, scroll down to "service_role (secret)" section

⚠️ **Security Note**: The service role key bypasses Row Level Security (RLS). Never use it in client-side code or commit it to version control.

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Phosphor Icons
- **Testing**: Vitest + Playwright
- **Package Manager**: npm with Turborepo

## 📦 Available Scripts

### Root Level
- `npm run dev` - Start development server
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run clean` - Clean build artifacts
- `npm run format` - Format code with Prettier

### Web App (apps/web)
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests (Vitest)
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests (Playwright)
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode

## 🚢 Deployment

### Vercel Deployment

This project is configured for Vercel deployment. The `vercel.json` file includes:

- **Edge Configuration**: Optimized for Singapore region (sin1)
- **Security Headers**: HSTS, X-Frame-Options, CSP
- **Redirects**: www → non-www, /home → /
- **Environment Variables**: Configured for Supabase integration

To deploy:

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Vercel

Add these in Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 📊 Monitoring

### Uptime Monitoring

Better Uptime monitors are configured for:
- `/` - Homepage
- `/api/health` - Health check endpoint
- `/pricing` - Pricing page
- `/accuracy` - Accuracy dashboard

**SLA Target**: 99.5% uptime

Alerts are sent to Slack webhook on downtime.

### Analytics

#### Vercel Analytics
- Page views
- Top pages
- Bounce rate
- Core Web Vitals

#### Supabase Events Dashboard
Custom events tracked:
- Signups
- Lead captures
- Demo requests
- CTA clicks
- Language toggles

Access via Supabase Studio → SQL Editor → Events dashboard query.

## 🔒 Security

- DPDP Act 2023 compliant
- All data stored in AWS ap-south-1 (Mumbai)
- Phone numbers encrypted at rest
- No third-party data sales
- Row Level Security (RLS) enabled on all Supabase tables

## 📄 License

Confidential - All rights reserved

---

**Version**: 1.0.0  
**Last Updated**: May 2026
