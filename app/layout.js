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
import { streakIsCurrent } from 'app/lib/utils';

const appBarStyle = {
  backgroundColor: mahjongTileFace,
  boxShadow: 3,
  borderBottom: '4px solid #a855f7',
}

async function StreakBanner() {
  const streakInfo = await getStreakInfo();
  // TODO also retrieve their daily score and color fires grey if they failed today
  console.log(streakInfo);

  if (streakInfo?.lastDate && streakIsCurrent(streakInfo.lastDate)) {
    const fireCount = Math.min(streakInfo.streak, 3);
    const fires = new Array(fireCount).fill('🔥');
    
    return (
      <div className="flex items-center gap-1">
        <div 
          className="flex items-center"
          style={{
            // Each fire takes ~0.5em, compressing heavily
            // Container shrinks to fit available space
            maxWidth: 'min(100%, 8rem)',
            overflow: 'hidden',
          }}
        >
          {fires.map((_, index) => (
            <span 
              key={index}
              data-testid="streak-fire"
              className="text-2xl shrink-0"
              style={{
                marginLeft: index === 0 ? 0 : '-1em',
              }}
            >
              🔥
            </span>
          ))}
        </div>
        <span data-testid="streak-count" className="text-lg font-bold text-orange-600 shrink-0">{streakInfo.streak}</span>
      </div>
    );
  }
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
