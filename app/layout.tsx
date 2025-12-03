import type React from "react"
import type { Metadata } from "next"
import { B612_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const b612Mono = B612_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"]
})

export const metadata: Metadata = {
  title: "Femi Leasing - Premium Vehicle Rental & Fleet Management",
  description:
    "Femi Leasing offers fleet management, gig rentals for Uber/DoorDash/Instacart, and flexible short-term & long-term vehicle rentals in the NJ/NY area.",
  generator: "v0.dev",
  openGraph: {
    title: "Femi Leasing - Premium Vehicle Rental & Fleet Management",
    description:
      "Femi Leasing offers fleet management, gig rentals for Uber/DoorDash/Instacart, and flexible short-term & long-term vehicle rentals in the NJ/NY area.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={b612Mono.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
