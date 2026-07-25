# 🎬 NextWatch — The Dual-Realm Entertainment Discovery Engine

> **Crafted with 💖 by LaughingHermit**

**NextWatch** is a modern, keyless web application that delivers personalized recommendations across two distinct worlds: **Anime** and **TV Series**. Built with Next.js 15, React, Framer Motion, and Tailwind CSS, NextWatch features dual visual design systems and integrates real-time API data without requiring user registration or API keys.

---

## ✨ Features

- **🎌 Dual Aesthetic Design System**
  - **Anime Realm**: Cel-shaded manga aesthetics, speed lines, neon accents, Japanese typography, and a Sharingan-inspired loading sequence with power-level counter.
  - **TV Series**: Dark film noir theater vibe, letterboxing effects, film strip sidebars, gold accents, and a film reel countdown with classic TV/movie quotes.

- **🎲 Surprise Me Mode**
  - Top-left quick action button that randomly selects a realm, generates dynamic criteria, and delivers instant recommendations without filling out a questionnaire.

- **🗓️ Era & Genre-Based Discovery**
  - Filter by release eras (2020s Streaming Age, 2010s Golden Era, 90s Classics, 80s & older) and curated genre combinations.

- **🚀 Real-Time Keyless API Integration**
  - **Anime Endpoint**: Powered by the **AniList GraphQL API** with a 4-tier fallback cascade to guarantee matches.
  - **TV Series Endpoint**: Powered by the **TVMaze REST API** with client-side index pagination and genre matching.

- **📱 Fully Responsive & Interactive**
  - Designed for smooth animation and layout across mobile, tablet, and desktop viewports.
  - Interactive result cards that tap to expand, revealing the full synopsis and complete genre tags without breaking the layout grid.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI & Styling**: Tailwind CSS, CSS Variables, Modern Fonts (`Bebas Neue`, `Rajdhani`, `Noto Serif JP`, `Inter`)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React
- **APIs**: AniList GraphQL API, TVMaze REST API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nextwatch.git
   cd nextwatch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Project Structure

```
nextwatch/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── recommend/
│   │   │       ├── anime/route.ts    # AniList GraphQL gateway with fallbacks
│   │   │       └── movie/route.ts    # TVMaze REST gateway with pagination (TV Series)
│   │   ├── globals.css               # Dual-theme tokens & decorative keyframes
│   │   ├── layout.tsx                # App root layout
│   │   └── page.tsx                  # Dynamic theme class wrapper
│   ├── components/
│   │   ├── LandingPage.tsx           # Dual card portal & Surprise Me trigger
│   │   ├── Questionnaire.tsx         # Multi-step preference selector
│   │   ├── LoadingScreen.tsx         # Sharingan / Film Reel thematic loaders
│   │   └── ResultsGallery.tsx        # Responsive media cards with score badges
│   └── store/
│       └── useAppStore.ts            # Global Zustand state (theme, step, results)
├── public/
├── README.md
└── package.json
```

---

## 🔌 API Information

- **No API keys or environment variables required.**
- **Anime**: Uses `https://graphql.anilist.co` for anime search and filtering.
- **TV Series**: Uses `https://api.tvmaze.com` for show indexing and genre query matching.

---

## 🌐 Deployment (Hosting on Vercel)

Because **NextWatch** requires **no API keys or database setup**, hosting it live on Vercel takes under 2 minutes!

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/nextwatch.git
   git branch -M main
   git push -u origin main
   ```
2. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
3. Import your `nextwatch` repository.
4. Click **Deploy** (Framework preset will automatically detect Next.js).
5. Your live URL will be generated immediately (e.g., `https://nextwatch.vercel.app`).

---

## 📜 License & Credits

MIT License — Feel free to use and adapt this project!

---
*Crafted with 💖 by **LaughingHermit***



