import './globals.css'
import { Roboto } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from '@/providers/modal-provider'


const font = Roboto({
  weight: '400',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Stella Admin Dashboard',
  description: 'Dashboard for Stella',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={font.className}>
          <ModalProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
