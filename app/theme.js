'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9333ea', // purple-600
      dark: '#7e22ce', // purple-700
    },
    secondary: {
      main: '#00A160', // mahjong felt green
    },
    background: {
      default: '#00A160',
      paper: '#f8f8f0', // mahjong tile face color
    },
    error: {
      main: '#dc2626', // red-600
    },
  },
  typography: {
    fontFamily: 'inherit',
    h1: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8f8f0',
          color: '#000',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#000',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#000',
        },
      },
    },
  },
});

export default theme;
