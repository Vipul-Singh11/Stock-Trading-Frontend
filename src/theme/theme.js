import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00c2a8',
      dark: '#009d86',
      light: '#44e8cf',
    },
    secondary: {
      main: '#4aa3ff',
    },
    success: {
      main: '#00c853',
    },
    error: {
      main: '#ff4d6d',
    },
    warning: {
      main: '#ffb020',
    },
    background: {
      default: '#0a0f1a',
      paper: '#111a2b',
    },
    text: {
      primary: '#e7edf7',
      secondary: '#9aa9c3',
    },
    divider: '#22324f',
    info: {
      main: '#3da5ff',
    },
  },
  typography: {
    fontFamily: ['DM Sans', 'Space Grotesk', 'Segoe UI', 'sans-serif'].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0f1a',
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(0,194,168,0.14), transparent 40%), radial-gradient(circle at 85% 5%, rgba(74,163,255,0.16), transparent 36%), linear-gradient(145deg, #0a0f1a 0%, #0f1727 45%, #101c31 100%)',
          color: '#e7edf7',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 18px 38px rgba(4, 9, 18, 0.34)',
          border: '1px solid rgba(138, 167, 216, 0.18)',
          backgroundImage:
            'linear-gradient(180deg, rgba(19, 31, 54, 0.92) 0%, rgba(16, 27, 47, 0.94) 100%)',
          backdropFilter: 'blur(6px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#b7c6df',
          borderBottom: '1px solid #22324f',
        },
        body: {
          borderBottom: '1px solid rgba(45, 63, 95, 0.48)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
