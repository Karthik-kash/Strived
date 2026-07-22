// ─── Habit Modal (Create / Edit) ─────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  StyleSheet, Animated, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { PALETTE } from '../modules/stateManager';
import { radius, spacing } from '../theme';

export default function HabitModal({ visible, habit, theme, smartColor, onSave, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(smartColor);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setName(habit?.name || '');
      setColor(habit?.color || smartColor);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, habit, smartColor]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[
          styles.sheet,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            transform: [{ translateY: slideAnim }],
          }
        ]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <Text style={[styles.title, { color: theme.text }]}>
            {habit ? 'Edit Habit' : 'New Habit'}
          </Text>

          {/* Name Input */}
          <Text style={[styles.label, { color: theme.textMuted }]}>HABIT NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g. Meditate 10 minutes"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={40}
          />

          {/* Color Picker */}
          <Text style={[styles.label, { color: theme.textMuted }]}>ACCENT COLOR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
            {PALETTE.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
              >
                {color === c && <Text style={styles.colorCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: theme.surfaceAlt, borderColor: color, borderTopColor: color }]}>
            <View style={[styles.previewDot, { backgroundColor: color }]} />
            <Text style={[styles.previewText, { color: theme.text }]}>{name || 'Your habit name'}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btnCancel, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={[styles.btnCancelText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSave, { backgroundColor: color, opacity: name.trim() ? 1 : 0.4 }]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.btnSaveText}>{habit ? 'Save Changes' : 'Create Habit'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: spacing.lg },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.sm },
  input: {
    borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md,
    paddingVertical: 14, fontSize: 16, fontWeight: '500', marginBottom: spacing.lg,
  },
  colorRow: { marginBottom: spacing.lg },
  colorSwatch: {
    width: 40, height: 40, borderRadius: 20, marginRight: spacing.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  colorSelected: { borderWidth: 3, borderColor: '#fff' },
  colorCheck: { color: '#fff', fontWeight: '800', fontSize: 16 },
  preview: {
    borderRadius: radius.md, borderWidth: 1, borderTopWidth: 4,
    padding: spacing.md, flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, marginBottom: spacing.lg,
  },
  previewDot: { width: 8, height: 8, borderRadius: 4 },
  previewText: { fontWeight: '700', fontSize: 15 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btnCancel: {
    flex: 1, borderRadius: radius.md, borderWidth: 1,
    padding: spacing.md, alignItems: 'center',
  },
  btnCancelText: { fontWeight: '700', fontSize: 15 },
  btnSave: { flex: 2, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
