// ─── Habit Logic Module ──────────────────────────────────────────────────────
// Handles: streak calculation, daily reset, calendar helpers

/**
 * Check if a daily reset is needed and return updated habits if so.
 */
export function checkDailyReset(habits, lastCheckDate) {
  const today = new Date().toISOString().split('T')[0];
  if (lastCheckDate !== today) {
    const resetHabits = habits.map(h => ({ ...h, isCompletedToday: false }));
    return { updated: true, newHabits: resetHabits, newDate: today };
  }
  return { updated: false, newHabits: habits, newDate: lastCheckDate };
}

/**
 * Recalculate streak for a habit based on its history.
 * If not done today, checks from yesterday backward.
 */
export function recalculateStreak(habitId, history) {
  if (!habitId || !history) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);
  const todayStr = today.toISOString().split('T')[0];
  const isDoneToday = (history[todayStr] || []).includes(habitId);

  if (!isDoneToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let safety = 0;
  while (safety < 3650) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayHistory = history[dateStr] || [];
    if (dayHistory.includes(habitId)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
    safety++;
  }

  return streak;
}

/**
 * Toggle the completion status and return updated fields.
 */
export function toggleHabitCompletion(habit, dateStr, history) {
  const dayHistory = history[dateStr] || [];
  const isNowDone = !dayHistory.includes(habit.id);
  return { isNowDone };
}

/**
 * Get all calendar days for a given year/month.
 * Returns array of date strings or null for blank cells.
 */
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/**
 * Calculate completion rate for today across all habits.
 */
export function getTodayCompletionRate(habits) {
  if (!habits || habits.length === 0) return 0;
  const done = habits.filter(h => h.isCompletedToday).length;
  return Math.round((done / habits.length) * 100);
}

/**
 * Get the top streak across all habits.
 */
export function getTopStreak(habits) {
  if (!habits || habits.length === 0) return 0;
  return Math.max(...habits.map(h => h.streakCount || 0));
}
