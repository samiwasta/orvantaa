import "@workspace/ui/globals.css"

import { cn } from "@workspace/ui/lib/utils"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
  },
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, poppins.variable, "font-sans antialiased")}
    >
      <body className="min-h-dvh font-sans">
        <div className="min-h-dvh overflow-x-hidden">{children}</div>
      </body>
    </html>
  )
}
