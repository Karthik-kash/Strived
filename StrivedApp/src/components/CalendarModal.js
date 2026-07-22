// ─── Calendar Modal ──────────────────────────────────────────────────────────

import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, Animated,
} from 'react-native';
import { getCalendarDays } from '../modules/habitLogic';
import { radius, spacing } from '../theme';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarModal({ visible, theme, habits, history, onClose, onToggleDay }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true,
    }).start();
  }, [visible]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const calDays = getCalendarDays(year, month);
  const todayStr = today.toISOString().split('T')[0];

  const getDayDots = (dateStr) => {
    if (!dateStr) return [];
    const completed = history[dateStr] || [];
    return habits.filter(h => completed.includes(h.id)).slice(0, 4);
  };

  const selectedDayHabits = selectedDay
    ? habits.map(h => ({
        ...h,
        isCompletedOnDay: (history[selectedDay] || []).includes(h.id),
      }))
    : [];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Text style={[styles.navArrow, { color: theme.text }]}>‹</Text>
              </TouchableOpacity>
              <Text style={[styles.monthLabel, { color: theme.text }]}>
                {MONTHS[month]} {year}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Text style={[styles.navArrow, { color: theme.text }]}>›</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeText, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Day Labels */}
          <View style={styles.dayLabels}>
            {DAYS.map(d => (
              <Text key={d} style={[styles.dayLabel, { color: theme.textMuted }]}>{d}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {calDays.map((dateStr, i) => {
              const dots = getDayDots(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;
              const isFuture = dateStr && dateStr > todayStr;

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayCell,
                    { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                    !dateStr && styles.empty,
                    isToday && { borderColor: theme.accent, borderWidth: 2 },
                    isSelected && { backgroundColor: theme.accent + '22' },
                    isFuture && { opacity: 0.3 },
                  ]}
                  onPress={() => dateStr && !isFuture && setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                  disabled={!dateStr || !!isFuture}
                >
                  {dateStr && (
                    <>
                      <Text style={[
                        styles.dayNum,
                        { color: isToday ? theme.accent : theme.text },
                        isToday && { fontWeight: '800' },
                      ]}>
                        {parseInt(dateStr.split('-')[2])}
                      </Text>
                      <View style={styles.dotsRow}>
                        {dots.map(h => (
                          <View key={h.id} style={[styles.dot, { backgroundColor: h.color }]} />
                        ))}
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Day Detail */}
          {selectedDay && (
            <View style={[styles.detail, { borderTopColor: theme.border }]}>
              <Text style={[styles.detailTitle, { color: theme.textMuted }]}>
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <ScrollView style={styles.detailList} showsVerticalScrollIndicator={false}>
                {selectedDayHabits.length === 0
                  ? <Text style={[styles.emptyMsg, { color: theme.textMuted }]}>No habits to show</Text>
                  : selectedDayHabits.map(h => (
                    <TouchableOpacity
                      key={h.id}
                      style={[styles.detailRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                      onPress={() => onToggleDay(h.id, selectedDay)}
                    >
                      <View style={[styles.detailDot, { backgroundColor: h.color }]} />
                      <Text style={[styles.detailName, { color: theme.text }, h.isCompletedOnDay && styles.strikeText]}>
                        {h.name}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: h.isCompletedOnDay ? h.color + '33' : theme.border }
                      ]}>
                        <Text style={[styles.statusText, { color: h.isCompletedOnDay ? h.color : theme.textMuted }]}>
                          {h.isCompletedOnDay ? '✓ Done' : 'Skipped'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    width: '100%', maxWidth: 500, borderRadius: radius.xl,
    borderWidth: 1, padding: spacing.lg,
    maxHeight: '90%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  navBtn: { padding: spacing.xs },
  navArrow: { fontSize: 24, fontWeight: '700', lineHeight: 28 },
  monthLabel: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, minWidth: 140, textAlign: 'center' },
  closeBtn: { padding: spacing.sm },
  closeText: { fontSize: 18, fontWeight: '600' },
  dayLabels: { flexDirection: 'row', marginBottom: spacing.sm },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%', aspectRatio: 1, borderRadius: radius.sm,
    borderWidth: 1, padding: 4, alignItems: 'center', marginBottom: 2,
    minHeight: 52,
  },
  empty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  dayNum: { fontSize: 13, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 2, justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  detail: { borderTopWidth: 1, marginTop: spacing.md, paddingTop: spacing.md },
  detailTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  detailList: { maxHeight: 160 },
  emptyMsg: { fontSize: 14, textAlign: 'center', padding: spacing.md },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderRadius: radius.sm, borderWidth: 1, padding: spacing.sm, marginBottom: spacing.xs,
  },
  detailDot: { width: 8, height: 8, borderRadius: 4 },
  detailName: { flex: 1, fontSize: 14, fontWeight: '600' },
  strikeText: { textDecorationLine: 'line-through', opacity: 0.5 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: '700' },
});
