import './globals.css'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang='id'>
      <body style={{ margin: 0, fontFamily: 'Arial' }}>
        {children}
      </body>
    </html>
  )
}
