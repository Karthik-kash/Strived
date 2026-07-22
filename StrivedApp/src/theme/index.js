// ─── Theme ───────────────────────────────────────────────────────────────────

export const darkTheme = {
  bg: '#0A0A0F',
  surface: '#13131A',
  surfaceAlt: '#1C1C28',
  border: '#2A2A3E',
  text: '#E8E8F0',
  textMuted: '#6B6B8A',
  textDim: '#3A3A5C',
  accent: '#6C63FF',
  success: '#43D9AD',
  danger: '#FF6584',
  cardShadow: 'rgba(0,0,0,0.6)',
};

export const lightTheme = {
  bg: '#F2F2F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F8FF',
  border: '#E0E0EF',
  text: '#1A1A2E',
  textMuted: '#8A8AAF',
  textDim: '#C0C0D8',
  accent: '#6C63FF',
  success: '#43D9AD',
  danger: '#FF6584',
  cardShadow: 'rgba(100,100,180,0.12)',
};

export const getTheme = (isDark) => isDark ? darkTheme : lightTheme;

export const typography = {
  display: { fontFamily: 'System', fontWeight: '800', letterSpacing: -1 },
  heading: { fontFamily: 'System', fontWeight: '700', letterSpacing: -0.5 },
  body: { fontFamily: 'System', fontWeight: '400' },
  mono: { fontFamily: 'Courier', fontWeight: '600' },
  label: { fontFamily: 'System', fontWeight: '600', letterSpacing: 1.5 },
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 8, md: 14, lg: 20, xl: 28, full: 999,
};
