import { createTheme } from '@mui/material/styles';

// Define the color scheme as specified in the plan
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#f50057', // Pink
    },
    success: {
      main: '#4caf50', // Green
    },
    warning: {
      main: '#ff9800', // Orange
    },
    error: {
      main: '#f44336', // Red
    },
    background: {
      default: '#f5f5f5', // Light Gray
      paper: '#ffffff', // White
    },
    text: {
      primary: '#212121', // Dark Gray
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
