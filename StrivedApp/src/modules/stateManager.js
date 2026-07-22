// ─── State Manager ──────────────────────────────────────────────────────────
// Handles: global state, AsyncStorage persistence, CRUD operations

import AsyncStorage from '@react-native-async-storage/async-storage';
import { recalculateStreak } from './habitLogic';

const STORAGE_KEY = 'strive_app_data';
const LAST_CHECK_KEY = 'strive_last_check';

const PALETTE = [
  '#6C63FF', '#FF6584', '#43D9AD', '#FFB347',
  '#4FC3F7', '#FF7043', '#AB47BC', '#26C6DA',
  '#D4E157', '#EC407A', '#66BB6A', '#FFA726',
];

// ── Initial State ──
export const initialState = {
  habits: [],
  history: {},
  isDarkMode: true,
  lastCheckDate: null,
};

// ── Load / Save ──
export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        habits: Array.isArray(parsed.habits) ? parsed.habits : [],
        history: (parsed.history && typeof parsed.history === 'object') ? parsed.history : {},
        isDarkMode: parsed.isDarkMode !== undefined ? parsed.isDarkMode : true,
        lastCheckDate: parsed.lastCheckDate || null,
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { ...initialState };
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// ── Habit CRUD ──
export function createHabit(state, name, color) {
  const usedColors = state.habits.map(h => h.color);
  const available = PALETTE.filter(c => !usedColors.includes(c));
  const autoColor = color || (available.length > 0 ? available[0] : PALETTE[Math.floor(Math.random() * PALETTE.length)]);

  const newHabit = {
    id: generateId(),
    name: name?.trim() || 'Untitled Habit',
    color: autoColor,
    streakCount: 0,
    isCompletedToday: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    habits: [...state.habits, newHabit],
  };
}

export function updateHabit(state, id, updates) {
  return {
    ...state,
    habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h),
  };
}

export function deleteHabit(state, id) {
  const newHistory = { ...state.history };
  Object.keys(newHistory).forEach(date => {
    newHistory[date] = newHistory[date].filter(hid => hid !== id);
  });
  return {
    ...state,
    habits: state.habits.filter(h => h.id !== id),
    history: newHistory,
  };
}

// ── History / Completion ──
export function toggleCompletion(state, habitId, dateStr) {
  const dayHistory = [...(state.history[dateStr] || [])];
  const idx = dayHistory.indexOf(habitId);

  if (idx === -1) {
    dayHistory.push(habitId);
  } else {
    dayHistory.splice(idx, 1);
  }

  const newHistory = { ...state.history, [dateStr]: dayHistory };
  const newStreak = recalculateStreak(habitId, newHistory);

  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = dateStr === todayStr
    ? dayHistory.includes(habitId)
    : state.habits.find(h => h.id === habitId)?.isCompletedToday;

  return {
    ...state,
    history: newHistory,
    habits: state.habits.map(h =>
      h.id === habitId
        ? { ...h, streakCount: newStreak, isCompletedToday }
        : h
    ),
  };
}

export function applyDailyReset(state, newHabits, newDate) {
  return { ...state, habits: newHabits, lastCheckDate: newDate };
}

export function toggleDarkMode(state) {
  return { ...state, isDarkMode: !state.isDarkMode };
}

export function getSmartColor(state) {
  const used = state.habits.map(h => h.color);
  const available = PALETTE.filter(c => !used.includes(c));
  return available.length > 0 ? available[0] : PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

export { PALETTE };

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
