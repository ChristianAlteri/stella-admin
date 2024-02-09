import './globals.css'
import { Roboto_Flex } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ModalProvider } from '@/providers/modal-provider'
import { ToastProvider } from '@/providers/toast-provider'



const font = Roboto_Flex({
  weight: '600',

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
          <ToastProvider />
          <ModalProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
