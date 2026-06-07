import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kumpulink',
  description: 'Self-hosted personal bookmarking app.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kumpulink',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('kumpulink-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e){}
            `
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
