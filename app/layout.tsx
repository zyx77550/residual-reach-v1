import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title:       'Residual Reach — AI-powered B2B Outreach',
  description: 'Find your ideal prospects, write personalized emails, send automated sequences. All on autopilot.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title:       'Residual Reach',
    description: 'AI-powered B2B cold outreach. From ICP to inbox in 30 minutes.',
    type:        'website',
    images:      ['/images/og-image.png'],
  },
  icons: {
    icon: '/images/logo-symbol.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#06060F] text-[#F0F0F8] font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
