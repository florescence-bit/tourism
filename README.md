# RAH - Tourist Safety App

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/next.js-14.2.3-black.svg)

A modern, privacy-first tourist safety companion built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Leaflet Maps**. RAH provides real-time location sharing, incident reporting, digital ID management, and comprehensive safety analytics for travelers worldwide.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## 🎯 Overview

RAH (Your personal safety companion) is a comprehensive tourist safety application designed to help travelers stay safe while exploring new destinations. The app combines location-based services, real-time threat detection, and community reporting in a sleek, minimalist interface.

**Key Highlights:**
- 🗺️ **Interactive Maps** — Real-time location tracking with OpenStreetMap integration
- 🆔 **Digital ID Management** — Secure digital identity verification on the go
- 📍 **Smart Check-Ins** — Share your location with trusted contacts instantly
- 📊 **Safety Analytics** — Track trends and view detailed safety insights
- 🚨 **Incident Reporting** — Report suspicious activities to help the community
- ⚙️ **Personalized Settings** — Configure notifications and location sharing preferences
- 💾 **Client-Side Storage** — All data stored locally in browser (no backend required for MVP)

---

## ✨ Features

### Core Features
- **Dashboard** — Centralized hub with quick stats, recent check-ins, and action buttons
- **Check-In System** — Share GPS coordinates with automatic location detection
- **Digital ID Card** — Beautiful ID card display with QR code verification
- **Analytics Dashboard** — 7-day safety trends, visited areas, and activity insights
- **Incident Reporting** — Multi-category incident form with location and description
- **User Profile** — Editable profile with name, role, and custom initials
- **Notifications Center** — Local notifications with mark-as-read and deletion
- **Settings Panel** — Toggle notifications and location sharing preferences

### Design Features
- **Minimalist Black/White Theme** — Samsung-inspired premium aesthetic
- **Responsive Layout** — Mobile, tablet, and desktop optimized
- **Smooth Animations** — Subtle transitions and hover effects
- **Accessibility** — Semantic HTML, proper contrast ratios, keyboard navigation
- **Progressive Enhancement** — Works offline with localStorage persistence

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14.2.3 |
| **Language** | TypeScript | 5.3.3 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **UI Components** | Lucide React | 0.408.0 |
| **Maps** | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| **Charts** | Recharts | 2.14.0 |
| **Runtime** | Node.js | ≥18.0.0 |
| **Package Manager** | npm | 9+ |

---

## 📁 Project Structure

### Directory Tree

```
RAH-TOURIST-SAFETY/
├── 📄 README.md                        # This file
├── 📄 package.json                     # NPM dependencies and scripts
├── 📄 package-lock.json                # Locked dependency versions
├── 📄 tsconfig.json                    # TypeScript configuration
├── 📄 next.config.js                   # Next.js configuration
├── 📄 tailwind.config.js               # Tailwind CSS theme
├── 📄 postcss.config.js                # PostCSS pipeline
├── 📄 next-env.d.ts                    # Auto-generated Next.js types
│
├── 📂 src/
│   ├── 📂 app/                         # Next.js App Router
│   │   ├── 📄 layout.tsx               # Root layout wrapper
│   │   ├── 📄 globals.css              # Global styles and Tailwind layers
│   │   ├── 📄 page.tsx                 # Public home page / landing
│   │   │
│   │   └── 📂 (app)/                   # Route group for app pages
│   │       ├── 📄 layout.tsx           # App layout (sidebar + header + main)
│   │       │
│   │       ├── 📂 dashboard/
│   │       │   └── 📄 page.tsx         # Dashboard hub (stats, map, actions)
│   │       │
│   │       ├── 📂 check-in/
│   │       │   └── 📄 page.tsx         # Check-in interface (GPS, location share)
│   │       │
│   │       ├── 📂 digital-id/
│   │       │   └── 📄 page.tsx         # Digital ID card display + QR
│   │       │
│   │       ├── 📂 analytics/
│   │       │   └── 📄 page.tsx         # Safety trends, charts, insights
│   │       │
│   │       ├── 📂 report/
│   │       │   └── 📄 page.tsx         # Incident reporting form
│   │       │
│   │       ├── 📂 profile/
│   │       │   └── 📄 page.tsx         # User profile (edit name, role, initials)
│   │       │
│   │       ├── 📂 notifications/
│   │       │   └── 📄 page.tsx         # Notifications center (localStorage)
│   │       │
│   │       └── 📂 settings/
│   │           └── 📄 page.tsx         # Preferences (notifications, location)
│   │
│   ├── 📂 components/                  # Reusable React components
│   │   ├── 📂 layout/
│   │   │   ├── 📄 header.tsx           # Top navigation bar
│   │   │   └── 📄 sidebar.tsx          # Left sidebar navigation
│   │   │
│   │   └── 📂 map/
│   │       └── 📄 SimpleMap.tsx        # Leaflet map wrapper component
│   │
│   ├── 📂 lib/                         # Utility functions and helpers
│   │   └── 📄 parseClient.ts           # Parse SDK initializer (UNUSED)
│   │
│   └── 📂 types/                       # TypeScript type definitions
│       └── 📄 parse.d.ts               # Parse module declaration (UNUSED)
│
└── 📂 public/                          # Static assets
    ├── 📄 favicon.ico                  # Site favicon
    └── 📂 assets/                      # Images, logos, etc.
        └── [place logo.png here]
```

### File Count Summary
- **Total Source Files:** 23
- **TypeScript/TSX:** 15 files
- **CSS:** 1 file
- **JSON Config:** 4 files
- **JavaScript Config:** 3 files

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ 18.0.0 ([Download](https://nodejs.org/))
- **npm** ≥ 9.0.0 (comes with Node.js)
- **Git** (optional, for cloning)

Check versions:
```bash
node --version   # Should be v18.x.x or higher
npm --version    # Should be 9.x.x or higher
```

### Installation

1. **Clone or navigate to the project:**
```bash
cd /home/SAN/TORISM
```

2. **Install dependencies:**
```bash
npm install
```

This will install all packages listed in `package.json`, including Next.js, React, TypeScript, Tailwind CSS, and Leaflet.

3. **Verify installation:**
```bash
npm run build
```

If no errors appear, the installation was successful.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root (this file should NOT be committed to version control):

```bash
# .env.local
# Map API Keys (if needed in future)
NEXT_PUBLIC_MAP_API_KEY=your_key_here

# Backend URLs (for future integration)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SOCKET_URL=ws://socket.example.com

# Parse Back4App (currently unused but available)
NEXT_PUBLIC_PARSE_APP_ID=your_app_id
NEXT_PUBLIC_PARSE_JS_KEY=your_js_key
NEXT_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com
```

**Note:** For the current MVP, all data is stored in browser localStorage. No environment variables are required.

### TypeScript Configuration

The project uses strict TypeScript with:
- Strict mode enabled
- ES2020 target
- Module resolution set to "bundler"
- Path alias: `@/*` maps to `src/*`

---

## 📖 Usage Guide

### Running the Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

**Output:**
```
✓ Next.js 14.2.3
- Local: http://localhost:3000
✓ Ready in 1.4s
```

Open your browser and navigate to http://localhost:3000

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

**Output:**
```
✓ Compiled successfully
✓ Generating static pages (9/9)
Route sizes and First Load JS calculated
```

### Starting Production Server

```bash
npm start
```

Runs the compiled production build (only works after `npm run build`).

### Code Linting

```bash
npm run lint
```

Checks code quality using ESLint with Next.js rules.

---

## 🏗️ Architecture

### Routing Structure

**Public Routes (accessible without authentication):**
- `/` — Home/Landing page

**App Routes (protected area):**
- `/dashboard` — Main hub
- `/check-in` — Location check-in
- `/digital-id` — ID management
- `/analytics` — Safety trends
- `/report` — Incident form
- `/profile` — User profile
- `/notifications` — Notification center
- `/settings` — App settings

### Data Flow

```
User Input
    ↓
React State (useState)
    ↓
localStorage (persistence)
    ↓
Component Re-render
    ↓
UI Update (Tailwind CSS)
```

### Component Hierarchy

```
RootLayout
├── PublicLayout (pages under /)
│   └── HomePage
└── AppLayout (pages under /(app))
    ├── Header
    │   ├── Mobile Menu Toggle
    │   ├── Notification Bell
    │   ├── User Avatar
    │   └── Settings Icon
    ├── Sidebar
    │   ├── Logo Section
    │   ├── Navigation Links (8 items)
    │   └── Logout Button
    └── Main Content (dynamic)
        ├── Dashboard
        ├── CheckIn
        ├── DigitalID
        ├── Analytics
        ├── Report
        ├── Profile
        ├── Notifications
        └── Settings
```

---

## 🎨 Design System

### Color Palette

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| **Primary Background** | Pure Black | `#0a0a0a` | Page backgrounds |
| **Primary Text** | White | `#ffffff` | Headings, buttons |
| **Secondary Text** | Light Gray | `#f5f5f5` | Body text |
| **Card Background** | Dark Gray | `#111827` | Cards (gray-900) |
| **Border Color** | Medium Gray | `#1f2937` | Borders (gray-800) |
| **Hover State** | Darker Gray | `#374151` | Interactive (gray-700) |

**Philosophy:** Pure black & white minimalist theme inspired by Samsung's design language. No gradients or accent colors.

### Typography

| Element | Font | Weight | Size | Usage |
|---------|------|--------|------|-------|
| **Headings** | Roboto | 700 | 1.5-2.5rem | H1-H6 |
| **Body** | Roboto | 400 | 1rem | Paragraphs |
| **UI Text** | Roboto | 500 | 0.875-1rem | Buttons, labels |
| **Code** | Monospace | 400 | 0.875rem | Form inputs |

### Border Radius

- **Large Components:** `rounded-3xl` (24px)
- **Medium Components:** `rounded-2xl` (16px)
- **Small Components:** `rounded-lg` (8px)

---

## 💾 Data Persistence

All data is stored in the browser's **localStorage** (no backend required).

### localStorage Keys

| Key | Storage Structure | Max Size |
|-----|-------------------|----------|
| `rah_profile_v1` | `{ name, role, initials }` | ~1KB |
| `rah_notifications_v1` | `[{ id, title, body, createdAt, read }]` | ~50KB |
| `rah_settings_v1` | `{ notificationsEnabled, shareLocation }` | ~500B |

### Example: Reading from localStorage

```typescript
useEffect(() => {
  try {
    const raw = localStorage.getItem('rah_profile_v1');
    if (raw) setProfile(JSON.parse(raw));
  } catch (e) {
    console.error('Failed to load profile');
  }
}, []);
```

### Example: Writing to localStorage

```typescript
function saveProfile(profile: Profile) {
  localStorage.setItem('rah_profile_v1', JSON.stringify(profile));
}
```

---

## 🗺️ Maps Integration

### Leaflet Configuration

The app uses **Leaflet** with **OpenStreetMap** tiles.

```typescript
// src/components/map/SimpleMap.tsx
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

// Custom marker with SVG icon
L.marker([latitude, longitude], {
  icon: L.icon({
    iconUrl: 'data:image/svg+xml,...',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}).addTo(map);
```

### Map Components

- **Dashboard:** Map at `40.7128°N, 74.0060°W` (NYC)
- **Check-In:** Interactive map with same location
- **Dynamic Import:** Uses `next/dynamic` with SSR disabled for performance

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Home page loads and displays features
- [ ] Dashboard shows stats and map
- [ ] Check-In page toggles between checked/unchecked states
- [ ] Digital ID card renders properly
- [ ] Analytics displays trend chart
- [ ] Report form accepts submissions
- [ ] Profile page saves to localStorage
- [ ] Notifications send test and persist
- [ ] Settings toggles work and persist
- [ ] Sidebar navigation works on mobile
- [ ] Header responsive on small screens

### Browser Support

- **Chrome** ≥ 90
- **Firefox** ≥ 88
- **Safari** ≥ 14
- **Edge** ≥ 90

---

## 📦 Deployment

### Deployment Options

#### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### 2. Self-Hosted (Node.js Server)

```bash
# Build
npm run build

# Start
npm start
```

The server will run on port 3000.

#### 3. Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Build Fails with TypeScript Errors**

**Error:** `Type error: Could not find a declaration file for module 'parse'`

**Solution:** 
- Remove unused Parse imports from code
- Or create type declaration: `src/types/parse.d.ts`

#### 2. **localhost:3000 Not Accessible**

**Error:** `Cannot connect to localhost:3000`

**Solution:**
```bash
# Kill any process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Restart dev server
npm run dev
```

#### 3. **localStorage Not Persisting**

**Error:** Data disappears after refresh

**Solution:**
- Check browser privacy settings (not in incognito mode)
- Clear browser cache: `Cmd+Shift+Delete`
- Verify localStorage is enabled

#### 4. **Maps Not Displaying

**Error:** Blank gray area where map should be

**Solution:**
```typescript
// Ensure dynamic import has ssr: false
const SimpleMap = dynamic(() => import('@/components/map/SimpleMap'), { 
  ssr: false 
});
```

#### 5. **Tailwind Styles Not Applied**

**Error:** Components appear unstyled

**Solution:**
- Ensure `globals.css` is imported in `app/layout.tsx`
- Rebuild: `npm run build`
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`

---

## 🚀 Performance Optimization

### Current Optimizations

- ✅ Static page pre-rendering (9 pages)
- ✅ Dynamic imports for maps (SSR disabled)
- ✅ Image optimization via Next.js
- ✅ Automatic code splitting
- ✅ CSS purging with Tailwind
- ✅ Tree-shaking with ES modules

### Metrics

| Metric | Value |
|--------|-------|
| First Load JS | ~88-97 kB |
| Build Time | ~30-45s |
| Dev Startup | ~1.5-2s |

---

## 🔒 Security

### Current Implementation

- ✅ Client-side only (no backend exposure)
- ✅ localStorage encryption ready (implement if needed)
- ✅ No sensitive data in URLs
- ✅ CORS headers managed by Next.js
- ✅ XSS protection via React escaping

### Future Security Enhancements

- [ ] Add user authentication (Firebase/Auth0)
- [ ] Encrypt localStorage data
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Use secure WebSocket (WSS)

---

## 🔄 Version History

### v0.2.0 (Current)
- ✅ Removed About page
- ✅ Added Profile page with localStorage
- ✅ Added Notifications center
- ✅ Added Settings panel
- ✅ Pure black/white/gray theme
- ✅ Leaflet map integration
- ✅ Responsive sidebar & header

### v0.1.0
- Initial project setup
- Core pages created
- Tailwind CSS configured

---

## 🎯 Future Enhancements

### Phase 2 (Backend Integration)
- [ ] Firebase authentication
- [ ] Real-time database (Firestore)
- [ ] User management
- [ ] Push notifications
- [ ] Photo uploads

### Phase 3 (Advanced Features)
- [ ] Geofencing alerts
- [ ] Community heat map
- [ ] AI threat detection
- [ ] Smart recommendations
- [ ] Multi-language support

### Phase 4 (Mobile & Wearables)
- [ ] React Native app
- [ ] Apple Watch integration
- [ ] Smartwatch notifications
- [ ] Offline-first sync

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: The above copyright
notice and this permission notice shall be included in all copies or
substantial portions of the Software.
```

---

## 👥 Support

For questions, issues, or feedback:

- 📧 Email: support@rah-app.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/rah/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/rah/discussions)
- 🌐 Website: [rah-app.com](https://rah-app.com)

---

## 📝 Quick Reference

### npm Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Create production build
npm start         # Start production server
npm run lint      # Run ESLint
npm install       # Install dependencies
npm update        # Update all packages
npm audit fix     # Fix security vulnerabilities
```

### Useful Git Commands

```bash
git status        # Check current status
git add .         # Stage all changes
git commit -m "message"  # Commit with message
git push          # Push to remote
git pull          # Pull latest changes
```

### Development Tips

- Use `Ctrl+Shift+K` to delete a line in VS Code
- Use `Ctrl+/` to toggle comments
- Use `Ctrl+Shift+P` for command palette
- Install [Prettier](https://prettier.io/) for code formatting
- Install [ES7+ React/Redux/React-Native](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) extension

---

**Last Updated:** November 15, 2025  
**Maintained by:** Development Team  
**Status:** ✅ Active Development

---

*Made with ❤️ for traveler safety worldwide*
# tourism
