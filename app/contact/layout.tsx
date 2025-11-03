import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Femi Leasing",
  description:
    "Get in touch with Femi Leasing. Operating hours: Daily 6:00 AM - 11:00 PM. Located in Newark, NJ. AI assistant available 24/7.",
  openGraph: {
    title: "Contact Us | Femi Leasing",
    description: "Get in touch with Femi Leasing. Operating hours: Daily 6:00 AM - 11:00 PM.",
    type: "website",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

