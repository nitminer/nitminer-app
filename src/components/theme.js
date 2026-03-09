import { rgba } from 'polished';

const theme = {
  colors: {
    text: '#02073E',
    textSecondary: '#02073E',
    background: '#FFFCF7',
    primary: '#4A90E2',
    secondary: '#7B68EE',
    muted: '#F7F8FA',
    gray: '#566272',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Space Grotesk, sans-serif',
  },
  fontWeights: {
    body: 400,
    heading: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.2,
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256],
  sizes: {
    container: 1200,
  },
  breakpoints: ['576px', '768px', '992px', '1200px', '1600px'],
};

export default theme;