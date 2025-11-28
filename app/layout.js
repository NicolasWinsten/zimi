import 'app/ui/globals.css';
import Providers from 'app/providers'
import { MaShanZheng, NotoSerifChinese } from 'app/ui/fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={`${NotoSerifChinese.className} flex flex-col min-h-screen`}>

          {/* Main content */}
          <main className="flex-1">
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  )
}
