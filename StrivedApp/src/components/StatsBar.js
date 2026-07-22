// ─── Stats Bar Component ─────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing } from '../theme';

export default function StatsBar({ totalHabits, completionRate, topStreak, theme }) {
  const stats = [
    { label: 'Habits', value: totalHabits, suffix: '' },
    { label: 'Today', value: completionRate, suffix: '%' },
    { label: 'Top Streak', value: topStreak, suffix: '🔥' },
  ];

  return (
    <View style={styles.row}>
      {stats.map((s, i) => (
        <View
          key={s.label}
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: theme.textMuted }]}>{s.label}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: theme.text }]}>{s.value}</Text>
            {s.suffix ? (
              <Text style={[styles.suffix, { color: s.label === 'Today' ? theme.success : theme.text }]}>
                {s.suffix}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  card: {
    flex: 1, borderRadius: radius.lg, borderWidth: 1,
    padding: spacing.md, paddingVertical: spacing.md + 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  value: { fontSize: 28, fontWeight: '800', letterSpacing: -1, lineHeight: 32 },
  suffix: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
});
