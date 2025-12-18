import 'app/ui/globals.css';
import Providers from 'app/providers'
import { MaShanZheng, NotoSerifChinese } from 'app/ui/fonts';
import UserMenu from 'app/ui/user-menu';
import HelpButton from 'app/ui/help-button';
import { DailyTimer } from 'app/ui/timer';
import DatePicker from 'app/ui/date-picker';
import { mahjongTileFace } from 'app/ui/styles';
import { getStreakInfo } from 'app/lib/db/db';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const appBarStyle = {
  backgroundColor: mahjongTileFace,
  boxShadow: 3,
  borderBottom: '4px solid #a855f7',
}

async function StreakBanner() {
  const streakInfo = await getStreakInfo();
  
  if (!streakInfo || streakInfo.streak === 0) {
    return null;
  }
  
  const fireCount = Math.min(streakInfo.streak, 10);
  const fires = Array(fireCount).fill('🔥');
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {fires.map((_, index) => (
          <span key={index} className="text-2xl">🔥</span>
        ))}
      </div>
      <span className="text-lg font-bold text-orange-600">{streakInfo.streak}</span>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Emotion insertion point to control style order vs Tailwind */}
        {/* <meta name="emotion-insertion-point" content="" /> */}
      </head>
      <body>
        <Providers>
          <div className={`${NotoSerifChinese.className} flex flex-col min-h-screen`}>
            <AppBar position="static" sx={appBarStyle}>
              <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    ZiMi <span className='text-nowrap'>字谜!</span>
                  </Typography>
                  <StreakBanner />
                </Box>
                <Box sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DatePicker />
                  <DailyTimer />
                  <HelpButton />
                  <UserMenu />
                </Box>
              </Toolbar>
            </AppBar>

            {/* Main content */}
            <main className="flex-1 pt-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
