import "@workspace/ui/globals.css"

import { Toaster } from "@workspace/ui/components/sonner"
import { AppIconlyProvider } from "@workspace/ui/icons"
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
      <body suppressHydrationWarning className="min-h-dvh font-sans">
        <AppIconlyProvider>
          <div className="min-h-dvh overflow-x-hidden">{children}</div>
          <Toaster />
        </AppIconlyProvider>
      </body>
    </html>
  )
}
