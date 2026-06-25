import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'BlogTriapriyogi Platform',
  description: 'SaaS Platform',
}

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang='id'>
      <body>{children}</body>
    </html>
  )
}
