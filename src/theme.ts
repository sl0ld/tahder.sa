export const theme = {
  colors: {
    background: '#F3F6FB',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFD',
    primary: '#1764C8',
    primaryDeep: '#0B3F86',
    primarySoft: '#E6F0FF',
    teal: '#168F82',
    tealSoft: '#E0F5F1',
    amber: '#B7791F',
    amberSoft: '#FFF4DD',
    rose: '#C2414B',
    roseSoft: '#FCE7EA',
    text: '#0E1B33',
    muted: '#6C7A91',
    line: '#DDE5F0',
    success: '#119F74',
    successSoft: '#DDF7EF',
    shadow: 'rgba(13, 38, 76, 0.12)',
  },
  radius: {
    xl: 14,
    lg: 10,
    md: 8,
    sm: 6,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
};

export type Theme = typeof theme;
