// ─── Dashboard Screen (UI Controller) ───────────────────────────────────────
// Main screen: orchestrates all UI components and state

import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Animated, StatusBar, Platform, SafeAreaView,
} from 'react-native';

import { getTheme, spacing, radius } from '../theme';
import {
  loadState, saveState, initialState,
  createHabit, updateHabit, deleteHabit,
  toggleCompletion, applyDailyReset, toggleDarkMode,
  getSmartColor,
} from '../modules/stateManager';
import {
  checkDailyReset, getTodayCompletionRate, getTopStreak,
} from '../modules/habitLogic';

import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import CalendarModal from '../components/CalendarModal';
import StatsBar from '../components/StatsBar';

// ── Reducer ──
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return { ...action.payload, _loaded: true };
    case 'CREATE': return createHabit(state, action.name, action.color);
    case 'UPDATE': return updateHabit(state, action.id, action.updates);
    case 'DELETE': return deleteHabit(state, action.id);
    case 'TOGGLE': return toggleCompletion(state, action.habitId, action.dateStr);
    case 'RESET': return applyDailyReset(state, action.habits, action.date);
    case 'DARK_MODE': return toggleDarkMode(state);
    default: return state;
  }
}

export default function Dashboard() {
  const [state, dispatch] = useReducer(reducer, { ...initialState, _loaded: false });
  const theme = getTheme(state.isDarkMode);
  const todayStr = new Date().toISOString().split('T')[0];

  const [showHabitModal, setShowHabitModal] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  // ── Load persisted state ──
  useEffect(() => {
    (async () => {
      const saved = await loadState();
      dispatch({ type: 'LOAD', payload: saved });
    })();
  }, []);

  // ── Save on every state change ──
  useEffect(() => {
    if (state._loaded) {
      saveState(state);
    }
  }, [state]);

  // ── Daily reset check ──
  useEffect(() => {
    if (!state._loaded) return;
    const { updated, newHabits, newDate } = checkDailyReset(state.habits, state.lastCheckDate);
    if (updated) {
      dispatch({ type: 'RESET', habits: newHabits, date: newDate });
    }
  }, [state._loaded]);

  // ── Header animation on mount ──
  useEffect(() => {
    if (state._loaded) {
      Animated.spring(headerAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }).start();
    }
  }, [state._loaded]);

  const completionRate = getTodayCompletionRate(state.habits);
  const topStreak = getTopStreak(state.habits);
  const smartColor = getSmartColor(state);

  const handleToggle = useCallback((habitId) => {
    dispatch({ type: 'TOGGLE', habitId, dateStr: todayStr });
  }, [todayStr]);

  const handleSaveHabit = useCallback(({ name, color }) => {
    if (editingHabit) {
      dispatch({ type: 'UPDATE', id: editingHabit.id, updates: { name, color } });
    } else {
      dispatch({ type: 'CREATE', name, color });
    }
    setShowHabitModal(false);
    setEditingHabit(null);
  }, [editingHabit]);

  const handleEdit = useCallback((habit) => {
    setEditingHabit(habit);
    setShowHabitModal(true);
  }, []);

  const handleDelete = useCallback((habitId) => {
    dispatch({ type: 'DELETE', id: habitId });
  }, []);

  const handleToggleDay = useCallback((habitId, dateStr) => {
    dispatch({ type: 'TOGGLE', habitId, dateStr });
  }, []);

  const openNewHabit = () => {
    setEditingHabit(null);
    setShowHabitModal(true);
  };

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  if (!state._loaded) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={state.isDarkMode ? 'light-content' : 'dark-content'} />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Nav ── */}
        <Animated.View
          style={[
            styles.nav,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            }
          ]}
        >
          <View>
            <Text style={[styles.appName, { color: theme.text }]}>Strive</Text>
            <Text style={[styles.dateLabel, { color: theme.textMuted }]}>{dateLabel}</Text>
          </View>
          <View style={styles.navActions}>
            {/* Calendar */}
            <TouchableOpacity
              style={[styles.iconCircle, { borderColor: theme.border }]}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={{ fontSize: 16 }}>📅</Text>
            </TouchableOpacity>
            {/* Dark Mode */}
            <TouchableOpacity
              style={[styles.iconCircle, { borderColor: theme.border }]}
              onPress={() => dispatch({ type: 'DARK_MODE' })}
            >
              <Text style={{ fontSize: 16 }}>{state.isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            {/* Add */}
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.text }]}
              onPress={openNewHabit}
            >
              <Text style={[styles.addBtnText, { color: theme.bg }]}>+ New</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Stats ── */}
        <StatsBar
          totalHabits={state.habits.length}
          completionRate={completionRate}
          topStreak={topStreak}
          theme={theme}
        />

        {/* ── Progress Bar ── */}
        {state.habits.length > 0 && (
          <View style={[styles.progressContainer, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.textMuted }]}>Daily Progress</Text>
              <Text style={[styles.progressCount, { color: theme.text }]}>
                {state.habits.filter(h => h.isCompletedToday).length}/{state.habits.length}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: completionRate === 100 ? theme.success : theme.accent,
                    width: `${completionRate}%`,
                  }
                ]}
              />
            </View>
          </View>
        )}

        {/* ── Habit Grid ── */}
        {state.habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No habits yet</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
              Consistency is the key to mastery.{'\n'}Start with one small daily goal.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.text }]}
              onPress={openNewHabit}
            >
              <Text style={[styles.emptyBtnText, { color: theme.bg }]}>Create your first habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {state.habits.map(habit => (
              <View key={habit.id} style={styles.gridItem}>
                <HabitCard
                  habit={habit}
                  theme={theme}
                  onToggle={() => handleToggle(habit.id)}
                  onEdit={() => handleEdit(habit)}
                  onDelete={() => handleDelete(habit.id)}
                />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </Animated.ScrollView>

      {/* ── Modals ── */}
      <HabitModal
        visible={showHabitModal}
        habit={editingHabit}
        theme={theme}
        smartColor={smartColor}
        onSave={handleSaveHabit}
        onClose={() => { setShowHabitModal(false); setEditingHabit(null); }}
      />

      <CalendarModal
        visible={showCalendar}
        theme={theme}
        habits={state.habits}
        history={state.history}
        onClose={() => setShowCalendar(false)}
        onToggleDay={handleToggleDay}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingTop: Platform.OS === 'android' ? 40 : spacing.md },

  nav: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.lg,
  },
  appName: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  dateLabel: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderRadius: radius.full, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontWeight: '800', fontSize: 13 },

  progressContainer: {
    borderRadius: radius.lg, borderWidth: 1,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  progressCount: { fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm },
  gridItem: { width: '50%' },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: spacing.sm },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  emptyBtn: {
    paddingHorizontal: spacing.xl, paddingVertical: 14,
    borderRadius: radius.full,
  },
  emptyBtnText: { fontWeight: '800', fontSize: 15 },
});
