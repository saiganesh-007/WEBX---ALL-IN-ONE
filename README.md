<p align="center">
  <img src="screen.png" alt="WEBX Preview" width="100%" style="border-radius: 12px;">
</p>

<h1 align="center">🌐 WEBX — All-in-One Web</h1>

<p align="center">
  <em>One web app. Everyday tools. One workspace.</em>
</p>

<p align="center">
  <a href="https://webx-all-in-one.vercel.app/">🔗 Live Demo</a> &nbsp;&bull;&nbsp;
  <a href="#-getting-started">🚀 Get Started</a> &nbsp;&bull;&nbsp;
  <a href="https://github.com/saiganesh-007/WEBX---ALL-IN-ONE">📁 GitHub</a>
</p>

---

**WEBX** is an all-in-one web workspace that brings your most-used everyday tools into a single, beautifully designed application. Calculator, converters, timers, notes, tasks, expenses, weather, alarms, and more — all living in one unified interface. No accounts, no tracking, no bloat. Just open and go.

Built with vanilla HTML, CSS, and JavaScript. No frameworks. No build tools. No dependencies.

---

## 📌 Project Overview

WEBX was built to solve a simple problem: **too many tabs**. Instead of switching between a calculator app, a notes app, a timer, a currency converter, and a to-do list — WEBX puts them all in one place.

The design philosophy is straightforward:

- **Simple** — clean interface, no learning curve
- **Fast** — instant load, no build process
- **Useful** — real tools for real tasks
- **Customizable** — themes, accent colors, dark/light modes
- **Unified** — everything connected through a single command bar and dashboard

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧮 **Calculator** | Basic + Scientific modes with history, memory, and keyboard input |
| 🔄 **Unit Converter** | 16 categories — length, weight, temperature, speed, data, and more |
| 💱 **Currency Converter** | 80+ currencies with live exchange rates |
| 📊 **Percentage Tools** | Discount, tax, tip, margin, markup, and % change calculators |
| 📅 **Date & Time Tools** | Date difference, age calculator, business days, Unix timestamp converter |
| 🌦️ **Weather** | Current conditions + 3-day forecast with GPS auto-detect |
| ⏱️ **Stopwatch** | Start, stop, resume, and lap tracking |
| ⏳ **Timer** | Configurable countdown with quick presets and pause/resume |
| ⏰ **Alarms** | Set alarms with labels, repeat modes, custom ringtones, and snooze |
| 🌍 **World Clock** | Add multiple cities, live-updating with timezone display |
| 📝 **Notes** | Create, pin, archive, tag, and search notes |
| ✅ **Tasks** | Manage tasks with priorities, due dates, categories, and filters |
| 🔔 **Reminders** | Time-based reminders with browser notifications |
| 🎯 **Goals** | Set targets and track progress over time |
| 🍅 **Focus Mode** | Pomodoro-style sessions with break timers and daily stats |
| 💰 **Expense Tracker** | Log expenses by category with monthly summaries |
| 🔎 **Global Search** | Search across all your data from one place (`Ctrl+K`) |
| 🎨 **8 Themes** | Midnight, Aurora, Ocean, Arctic, Sunset, Ember, Cyber, Minimal |
| 🌓 **Dark / Light / System** | Full theme support with proper glassmorphism in both modes |
| 🎯 **7 Accent Colors** | Emerald, Purple, Blue, Cyan, Pink, Orange, Red |
| ⚙️ **18+ Settings** | Precision, sounds, haptics, animations, notifications, and more |
| 📦 **Import / Export** | Backup and restore all your data as JSON |
| ⌨️ **Keyboard Shortcuts** | Full calculator keyboard support + global search shortcut |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| **HTML5** | Semantic markup, 14 view panels, 6 modals |
| **CSS3** | Glassmorphism design system, 8 themes, responsive breakpoints, 13 animations |
| **JavaScript** | Vanilla JS, ~3,900 lines, IIFE pattern, 30+ modules |
| **Tailwind CSS** | CDN utility classes with custom theme config |
| **Material Symbols** | Google icon font |
| **Google Fonts** | Inter, Nunito, JetBrains Mono |
| **localStorage** | All user data persistence (22 keys) |
| **IndexedDB** | Custom ringtone uploads |
| **Web Audio API** | UI sounds and built-in ringtones |
| **Canvas API** | Ambient animated particle background |
| **Geolocation API** | GPS-based weather detection |
| **Fetch API** | Live weather and currency data |

---

## 🚀 Getting Started

**Prerequisites:** A modern web browser (Chrome, Firefox, Edge, Safari).

### Option 1 — PowerShell (Windows)

```powershell
git clone https://github.com/saiganesh-007/WEBX---ALL-IN-ONE.git
cd WEBX---ALL-IN-ONE
.\server.ps1
```

Opens at **http://localhost:8080**

### Option 2 — Any Static Server

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

> **Note:** Must be served over HTTP (`http://localhost`), not opened as a local file (`file://`).

### Option 3 — Live Demo

No setup needed — just visit **[webx-all-in-one.vercel.app](https://webx-all-in-one.vercel.app/)**

---

## 📁 Project Structure

```
WEBX---ALL-IN-ONE/
├── index.html          # Main HTML — all views, modals, and markup
├── css/
│   └── styles.css      # Design system — themes, glassmorphism, responsive
├── js/
│   └── app.js          # Application engine — all modules and logic
├── screen.png          # Project screenshot
├── DESIGN.md           # Design system specification
├── server.ps1          # Local dev server (PowerShell)
└── .env.example        # API endpoint reference
```

**No build step.** No `package.json`. No bundler. Just open `index.html` in a browser.

---

## 🗺️ Roadmap

Potential improvements for future versions:

- [ ] Graphing calculator with interactive plots
- [ ] Rich text / Markdown notes
- [ ] Calendar view for tasks and reminders
- [ ] Charts and data visualization for expenses
- [ ] PWA support for offline use
- [ ] Custom user-created themes
- [ ] Unit tests for core calculation logic
- [ ] TypeScript migration

---

## 🙏 Acknowledgements

- [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework
- [Google Fonts](https://fonts.google.com/) — Inter, Nunito, JetBrains Mono
- [Material Symbols](https://fonts.google.com/icons) — icon set
- [Open-Meteo](https://open-meteo.com/) — free weather API
- [Open Exchange Rates](https://open.er-api.com/) — free currency API
- [BigDataCloud](https://www.bigdatacloud.com/) — free geocoding API

---

## 📄 License

No license currently specified. All rights reserved.

---

<p align="center">
  <strong>One web app. Every tool. One workspace.</strong>
</p>
