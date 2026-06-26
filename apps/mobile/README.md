# PoultryPulse AI — Mobile App

Expo React Native mobile application for PoultryPulse AI price intelligence platform.

## Tech Stack

- **Framework**: Expo Router (React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Database**: WatermelonDB (SQLite for offline caching)
- **Authentication**: Supabase Auth (phone OTP)
- **Internationalization**: i18next (Hindi-first)
- **UI Components**: @pp/ui (shared component library)
- **Type Safety**: TypeScript

## Project Structure

```
apps/mobile/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout with font loading, i18n, auth
│   ├── (auth)/              # Authenticated routes
│   │   └── onboarding.tsx   # Onboarding flow
│   └── (tabs)/              # Tab navigator
│       ├── _layout.tsx      # Bottom tab navigator
│       ├── forecast.tsx     # Tab 1: आज का भाव
│       ├── sell-signal.tsx  # Tab 2: बेचें कब?
│       ├── alerts.tsx       # Tab 3: बाज़ार समाचार
│       └── account.tsx      # Tab 4: मेरा खाता
├── hooks/                   # Custom React hooks
│   ├── useForecast.ts       # Stale-while-revalidate forecast hook
│   └── useAlerts.ts         # Alerts hook with Realtime
├── src/
│   ├── database/            # WatermelonDB schema
│   │   └── schema.ts        # Database models
│   └── lib/                 # Utilities
│       ├── database.ts      # Database initialization
│       ├── i18n.ts          # i18n configuration
│       └── supabase.ts      # Supabase client
└── assets/                  # Static assets
    └── fonts/               # Noto Sans Devanagari fonts
```

## Features

### Authentication
- Phone number OTP verification (SMS/WhatsApp)
- Device fingerprinting for security
- Secure token storage with expo-secure-store

### Offline-First Architecture
- WatermelonDB for local SQLite caching
- Stale-while-revalidate pattern for forecasts
- Offline detection and graceful degradation
- Supabase Realtime for live alerts

### Internationalization
- Hindi-first language support
- Device locale detection
- Language preference persistence
- Noto Sans Devanagari typography

### Tab Navigation
- **आज का भाव (Forecast)**: Current price predictions with confidence intervals
- **बेचें कब? (Sell Signal)**: Actionable sell recommendations with batch calculator
- **बाज़ार समाचार (Alerts)**: Disease, weather, and price alerts
- **मेरा खाता (Account)**: Subscription status, notifications, accuracy scorecard

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Variables

Create a `.env` file in the mobile app directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Design Principles

- **Hindi-Primary**: All farmer-facing content in Hindi first
- **Offline-First**: Core functionality works without internet
- **Don Norman**: Human-centered error messages
- **Apple Design**: Clean, intuitive navigation
- **Niklas Bubori**: Micro-interactions with haptic feedback

## Performance Budgets

- Mobile FCP < 2s on Slow 3G
- JS bundle < 500KB gzipped
- Font loading blocks render (mandatory)

## Architecture

See [Architecture v1.0](../../specs/website%20update/PoultryPulse_Architecture_v1.md) for detailed architecture documentation.

## License

Proprietary - All rights reserved
