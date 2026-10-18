# Bhakundo (भाकुण्डो) 🇳🇵 — Ad-Free Real-Time Football Hub

> **Bhakundo** (नेपाली: भाकुण्डो) is a 100% ad-free, high-performance real-time football platform celebrating Nepali football spirit alongside global competitions.

---

## 🌟 Key Highlights

- 🇳🇵 **Nepali Spirit & Identity**:
  - Handcrafted SVG of Nepal's iconic double-pennant national flag with crescent moon and 12-pointed sun.
  - Dedicated Nepali Football coverage: **Nepal Super League (NSL)**, Martyr's Memorial A-Division, and Nepal National Team international fixtures.
  - Bilingual support: Seamless toggle between **English** and **नेपाली (Nepali)**.
- 🛡️ **100% Ad-Free & Clean**:
  - Zero betting popups, zero casino ads, zero video autoplay spam, zero telemetry bloat.
  - Clean, dark-mode stadium aesthetic engineered for speed and clarity.
- ⏱️ **Real-Time Live Match Engine**:
  - Live minute-by-minute ticking clocks (`LIVE 76'`, `HT`, `FT`).
  - Real-time simulation of match events (goals, yellow/red cards, substitutions, VAR reviews).
  - Web Audio API synthesizer for offline referee whistle trills and roaring stadium cheers.
  - Dynamic goal celebration confetti and real-time pop-up alerts.
  - Pace control: Pause, 1x Live, or Fast simulation.
- 📊 **Complete Match Data for Every Game**:
  - **Timeline**: Chronological events with goalscorer, assister, sub-in/out, and VAR decisions.
  - **Comparative Stats**: Possession %, shots, shots on target, Expected Goals ($xG$), corners, fouls, yellow/red cards, passes, pass accuracy %.
  - **2D Visual Formation Pitch**: Interactive pitch visualizer showing starting lineups (4-3-3, 4-2-3-1), player positions, captain armbands, and substitutes bench.
  - **Head-to-Head (H2H)**: Historical meetings and head-to-head scorelines.
  - **Live Text Commentary**: Minute-by-minute live narrative ticker.
- 🏆 **Standings & Golden Boot Leaderboards**:
  - Full league tables for Nepal Super League & Premier League with points, goal difference, and form guide ($W, D, L$).
  - Top Scorers / Golden Boot rankings tracking goals, assists, and matches played.
- ⚙️ **External API Support**:
  - Out of the box offline simulated real-time mode (zero configuration required).
  - Optional settings modal to paste a Football-Data.org / API-Football key for live REST endpoint connection.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```

Visit the local URL shown in terminal (usually `http://localhost:5173`).

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
football-score/
├── public/
│   └── favicon.svg              # Custom Nepal flag favicon
├── src/
│   ├── components/
│   │   ├── AdFreeBanner.tsx     # 100% Ad-Free guarantee banner
│   │   ├── ApiConfigModal.tsx   # Optional external API credentials & settings
│   │   ├── GoalAlertToast.tsx   # Real-time animated goal alert popups
│   │   ├── LeagueFilter.tsx     # Filter tabs (Nepal, EPL, UCL, Live Now, Dates)
│   │   ├── LineupPitch.tsx      # 2D visual formation pitch with tactical layout
│   │   ├── MatchCard.tsx        # Real-time score cards with live indicators
│   │   ├── MatchDetailModal.tsx # Full match data (Timeline, Stats, Pitch, H2H, Commentary)
│   │   ├── Navbar.tsx           # Brand header, Nepali flag, search, language & sound toggles
│   │   ├── NepaliFlag.tsx       # Accurate SVG rendering of Nepal's double-pennant flag
│   │   ├── StandingsTable.tsx   # Full league standings & form guide
│   │   └── TopScorers.tsx       # Golden Boot leaderboard
│   ├── data/
│   │   └── mockData.ts          # Seed data (NSL, Nepal NT, EPL, UCL, La Liga)
│   ├── services/
│   │   └── liveEngine.ts        # Real-time event simulation & pub-sub dispatcher
│   ├── types/
│   │   └── football.ts          # TypeScript interfaces for matches, teams, stats, lineups
│   ├── utils/
│   │   ├── soundEffects.ts      # Offline Web Audio API referee whistle & goal cheers
│   │   └── translations.ts      # English & Nepali bilingual dictionaries
│   ├── App.tsx                  # Root application view
│   ├── index.css                # Tailwind CSS v4 styling & animations
│   └── main.tsx                 # React DOM root entry
├── index.html                   # HTML entry with Bhakundo metadata
├── package.json
└── vite.config.ts               # Vite configuration with @tailwindcss/vite
```

---

## 🇳🇵 About the Name "Bhakundo"

In Nepal, **"Bhakundo" (भाकुण्डो)** is the colloquial and beloved Nepali word for **football / soccer ball**, originating from traditional handmade cloth/leather balls kicked in neighborhoods and village grounds throughout Nepal. This website honors that grassroots love for the beautiful game.
