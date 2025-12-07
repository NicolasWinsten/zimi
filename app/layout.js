import 'app/ui/globals.css';
import Providers from 'app/providers'
import { MaShanZheng, NotoSerifChinese } from 'app/ui/fonts';
import UserMenu from 'app/ui/user-menu';
import HelpButton from 'app/ui/help-button';
import { DailyTimer } from 'app/ui/timer';
import DatePicker from 'app/ui/date-picker';
import { mahjongFeltPurple, mahjongTileFace } from 'app/ui/styles';

const styleClass = {
  backgroundColor: mahjongTileFace,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Emotion insertion point to control style order vs Tailwind */}
        {/* <meta name="emotion-insertion-point" content="" /> */}
      </head>
      <body>
        <div className={`${NotoSerifChinese.className} flex flex-col min-h-screen`}>
          <Providers>
            <header style={styleClass} className="shadow border-b-4 border-purple-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">ZiMi <span className='text-nowrap'>字谜!</span></h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <DatePicker />
                    <DailyTimer />
                    <HelpButton />
                    {/* <UserMenu /> */}
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pt-6">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  )
}
