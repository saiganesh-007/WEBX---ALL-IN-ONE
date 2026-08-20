# 🌐 WEBX — All-in-One Web

**WEBX** is a premium all-in-one web workspace that unifies everyday tools — calculator, converters, timers, tasks, notes, expenses, weather, and more — into a single beautifully designed glassmorphic interface. No accounts, no tracking, no bloat. Just open and go.

**Live Demo:** [https://webx-all-in-one.vercel.app/](https://webx-all-in-one.vercel.app/)

---

## 🌟 Project Overview

WEBX was built to solve a simple problem: **too many tabs**. Instead of switching between a calculator, notes app, timer, converter, and to-do list, WEBX puts them all in one place. It's designed to be fast, useful, and customizable — a personal command center that lives in your browser.

Everything runs client-side with no backend required. User data is stored entirely in localStorage and IndexedDB, and all external APIs are keyless.

---

### **Key Features**

* **Calculator:** Basic and Scientific modes with keyboard input, memory, history, and 20+ math functions.
* **Unit Converter:** 16 categories — length, weight, temperature, speed, data, pressure, and more.
* **Currency Converter:** 80+ currencies with live exchange rates and offline fallback.
* **Tasks & Notes:** Create, filter, search, pin, and archive personal tasks and notes.
* **Focus Mode:** Built-in Pomodoro timer with configurable sessions, automatic breaks, and daily stats.
* **Timer & Stopwatch:** Countdown timer with presets and a full stopwatch with lap tracking.
* **Alarms:** Set alarms with labels, repeat modes, custom ringtones, and snooze.
* **Weather:** Current conditions and 3-day forecast with GPS auto-detect.
* **World Clock:** Add multiple cities with live-updating times.
* **Expense Tracker:** Log expenses by category with monthly summaries.
* **Reminders:** Time-based reminders that fire browser notifications.
* **Goals:** Set targets and track progress over time.
* **Global Search:** Search across all your data from one place with Ctrl+K.
* **8 Themes:** Midnight, Aurora, Ocean, Arctic, Sunset, Ember, Cyber, Minimal.
* **Dark / Light / System:** Full appearance mode support with proper glassmorphism.
* **7 Accent Colors:** Emerald, Purple, Blue, Cyan, Pink, Orange, Red.
* **Command Bar:** Natural language input — type "2+2", "add task Buy milk", or "25 min focus".
* **Import & Export:** Back up and restore all your data as a single JSON file.
* **Ambient Background:** Animated canvas particle system that adapts to time of day.

---

## 🛠️ Tech Stack

* **HTML5:** Semantic markup with 14 view panels and 6 modals.
* **CSS3:** Custom glassmorphism design system with 8 themes, responsive breakpoints, and 13 keyframe animations.
* **JavaScript:** Vanilla JS (~3,900 lines) using an IIFE pattern with 30+ internal modules.
* **Tailwind CSS:** Utility classes via CDN with a custom theme configuration.
* **Material Symbols:** Google icon font for all UI icons.
* **Google Fonts:** Inter, Nunito, and JetBrains Mono.
* **localStorage:** All user data persistence across 22 storage keys.
* **IndexedDB:** Custom ringtone audio file uploads.
* **Web Audio API:** UI sounds and 6 built-in alarm ringtones.
* **Canvas API:** Ambient animated particle background.
* **Geolocation API:** GPS-based weather location detection.
* **Fetch API:** Live data from Open-Meteo, Open Exchange Rates, and BigDataCloud — all keyless.

---

## 📂 Project Structure

```text
WEBX---ALL-IN-ONE/
├── index.html          # Main HTML — all views, modals, navigation, and markup
├── css/
│   └── styles.css      # Design system — themes, glassmorphism, responsive, animations
├── js/
│   └── app.js          # Application engine — calculator, managers, UI controllers, APIs
├── screen.png          # Project screenshot
├── DESIGN.md           # Design system specification document
├── server.ps1          # Local development server (PowerShell, port 8080)
└── .env.example        # API endpoint reference (no keys required)
```

No build step required. No `package.json`. No bundler. Just serve the files and open in a browser.

---

## 🚀 Getting Started

```bash
git clone https://github.com/saiganesh-007/WEBX---ALL-IN-ONE.git
cd WEBX---ALL-IN-ONE
```

**Run locally (any option works):**

```powershell
# PowerShell (Windows)
.\server.ps1

# Python
python -m http.server 8080

# Node.js
npx serve .
```

Then open **http://localhost:8080** in your browser.

> **Note:** Must be served over HTTP, not opened as a local `file://` URL.

---

## 🗺️ Roadmap

* [ ] Graphing calculator with interactive plots
* [ ] Rich text / Markdown note editing
* [ ] Calendar view for tasks and reminders
* [ ] Charts and data visualization for expenses
* [ ] PWA support for offline use
* [ ] Custom user-defined themes
* [ ] Unit tests for core calculation logic
* [ ] TypeScript migration

---

## 🙏 Acknowledgements

* [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
* [Google Fonts](https://fonts.google.com/) — Inter, Nunito, JetBrains Mono
* [Material Symbols](https://fonts.google.com/icons) — Icon set
* [Open-Meteo](https://open-meteo.com/) — Free weather and geocoding API
* [Open Exchange Rates](https://open.er-api.com/) — Free currency exchange rate API
* [BigDataCloud](https://www.bigdatacloud.com/) — Free reverse geocoding API

---

## 📄 License

No license currently specified. All rights reserved.

---

## 👤 Author

**Sai Ganesh**

* **GitHub:** [@saiganesh-007](https://github.com/saiganesh-007)
* **LinkedIn:** [Sai Ganesh](https://www.linkedin.com/in/saiganesh00007/)

Built with ❤️ by **Sai Ganesh**.

---

<p align="center"><em>One web app. Every tool. One workspace.</em></p>
