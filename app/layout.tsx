import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '../components/PostHogProvider'
import { AuthProvider } from '../lib/authContext'
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: 'VFind - Visual Search Engine',
  description: '',
  generator: '',
}

export default function RootLayout({ children }:
  Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="relative">
              <div className="relative z-10">
                {children}
                <SpeedInsights />
                <Analytics />
              </div>
            </div>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
