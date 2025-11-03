import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Femi Leasing",
  description:
    "Learn about Femi Leasing's mission to transform the car rental experience in the NJ/NY area. Premier rental solutions with exceptional convenience and customer satisfaction.",
  openGraph: {
    title: "About Us | Femi Leasing",
    description:
      "Learn about Femi Leasing's mission to transform the car rental experience in the NJ/NY area.",
    type: "website",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

