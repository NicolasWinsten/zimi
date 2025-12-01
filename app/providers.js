"use client"
import { SessionProvider } from "next-auth/react"
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

//const clientSideEmotionCache = createEmotionCache();

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {/* <CacheProvider value={clientSideEmotionCache}> */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      {/* </CacheProvider> */}
    </SessionProvider>
  )
}
