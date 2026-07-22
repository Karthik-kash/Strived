// ─── HabitCard Component ─────────────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet, Alert,
} from 'react-native';
import { radius, spacing } from '../theme';

export default function HabitCard({ habit, theme, onToggle, onEdit, onDelete }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(habit.isCompletedToday ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: habit.isCompletedToday ? 1 : 0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [habit.isCompletedToday]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Remove "${habit.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const checkScale = checkAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] });
  const cardOpacity = habit.isCompletedToday ? 0.72 : 1;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderTopColor: habit.color,
          opacity: cardOpacity,
          shadowColor: habit.color,
        }
      ]}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
          <View style={styles.menuRow}>
            <TouchableOpacity onPress={onEdit} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.iconText, { color: theme.textMuted }]}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.iconText, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Habit Name */}
        <Text
          style={[
            styles.habitName,
            { color: theme.text },
            habit.isCompletedToday && styles.completedText,
          ]}
          numberOfLines={2}
        >
          {habit.name}
        </Text>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.streakBadge}>
            <Text style={[styles.streakNum, { color: habit.color }]}>{habit.streakCount}</Text>
            <Text style={[styles.streakLabel, { color: theme.textMuted }]}>day streak</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <TouchableOpacity
              onPress={onToggle}
              style={[
                styles.checkBtn,
                {
                  backgroundColor: habit.isCompletedToday ? habit.color : 'transparent',
                  borderColor: habit.color,
                }
              ]}
            >
              <Text style={[
                styles.checkMark,
                { color: habit.isCompletedToday ? '#fff' : habit.color }
              ]}>
                {habit.isCompletedToday ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: spacing.sm },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderTopWidth: 4,
    padding: spacing.md,
    minHeight: 160,
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  menuRow: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { padding: spacing.xs },
  iconText: { fontSize: 14, fontWeight: '600' },
  habitName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginTop: spacing.sm, flex: 1 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.5 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  streakBadge: { flexDirection: 'column' },
  streakNum: { fontSize: 22, fontWeight: '800', letterSpacing: -1 },
  streakLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  checkBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 16, fontWeight: '800' },
});
