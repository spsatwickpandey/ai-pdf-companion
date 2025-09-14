import './globals.css'
import { Inter } from 'next/font/google'
import { PDFProvider } from '@/contexts/PDFContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI PDF Companion',
  description: 'Your intelligent PDF reading assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PDFProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </PDFProvider>
      </body>
    </html>
  )
} 