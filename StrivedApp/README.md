# Strive — Minimal Habit Tracker

A native mobile/desktop habit tracker built with **React Native (Expo)**.  
Fully modular, offline-first, with persistent local storage.

---

## ✦ Features

- ✅ Create, Read, Update, Delete habits (full CRUD)
- 🎨 Auto-assigned unique colors per habit
- 🔥 Streak tracking with consecutive-day logic
- 📅 Calendar view with per-day history & toggle
- 🌙 Dark / Light mode
- 📊 Live dashboard stats (total, completion rate, top streak)
- 🔄 Daily auto-reset at midnight
- 💾 Persistent storage via AsyncStorage (SQLite-backed on native)

---

## ✦ Project Structure

```
StrivedApp/
├── App.js                          # Entry point
├── src/
│   ├── modules/
│   │   ├── habitLogic.js           # Streak, reset, calendar logic
│   │   └── stateManager.js         # State CRUD + AsyncStorage persistence
│   ├── screens/
│   │   └── Dashboard.js            # Main UI controller screen
│   ├── components/
│   │   ├── HabitCard.js            # Individual habit card
│   │   ├── HabitModal.js           # Create/Edit habit bottom sheet
│   │   ├── CalendarModal.js        # Monthly calendar + day detail
│   │   └── StatsBar.js             # Top stats row
│   └── theme/
│       └── index.js                # Colors, typography, spacing, radius
```

---

## ✦ Global State Shape

```json
{
  "habits": [
    {
      "id": "uuid",
      "name": "Meditate 10 min",
      "color": "#6C63FF",
      "streakCount": 7,
      "isCompletedToday": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "history": {
    "2025-01-01": ["habit-id-1", "habit-id-2"],
    "2025-01-02": ["habit-id-1"]
  },
  "isDarkMode": true,
  "lastCheckDate": "2025-01-03"
}
```

---

## ✦ Setup & Run

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Emulator

### Install
```bash
cd StrivedApp
npm install
```

### Run
```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Expo Go (scan QR with phone)
npx expo start
```

### Build for Desktop (macOS)
```bash
npx expo run:ios --device   # macOS native via Catalyst
```

---

## ✦ Key Design Decisions

### Habit Logic Module (`habitLogic.js`)
- `checkDailyReset()` — Compares today vs last check date, resets `isCompletedToday` if new day
- `recalculateStreak()` — Walks backward from today (or yesterday if not done today), counts consecutive days
- `getCalendarDays()` — Builds array of date strings for a month grid with null padding
- `getTodayCompletionRate()` — Percentage of habits completed today
- `getTopStreak()` — Max streak across all habits

### State Manager (`stateManager.js`)
- Pure reducer-style functions — each returns a new state object (immutable)
- All persistence via `AsyncStorage` (automatically uses SQLite on native)
- Smart color picker auto-assigns unused colors from a 12-color palette
- History is keyed by `YYYY-MM-DD` → array of habitIds

### UI Controller (`Dashboard.js`)
- Uses `useReducer` for predictable state transitions
- Loads state on mount, saves on every state change
- Dispatches typed actions: `LOAD`, `CREATE`, `UPDATE`, `DELETE`, `TOGGLE`, `RESET`, `DARK_MODE`
- Animated header reveal on load; spring animations on habit cards

---

## ✦ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 52) |
| Storage | @react-native-async-storage/async-storage |
| Animations | React Native Animated API |
| Gestures | react-native-gesture-handler |
| Safe Area | react-native-safe-area-context |
| Icons | Unicode / Emoji (zero dependencies) |
