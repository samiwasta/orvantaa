import "@workspace/ui/globals.css"

import { cn } from "@workspace/ui/lib/utils"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", inter.variable)}
    >
      <body>{children}</body>
    </html>
  )
}
