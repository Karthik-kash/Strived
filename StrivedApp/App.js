// ─── App Entry Point ─────────────────────────────────────────────────────────

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Dashboard from './src/screens/Dashboard';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Dashboard />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
