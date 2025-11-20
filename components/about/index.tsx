// About page component with toggleable layouts
"use client"

import { LayoutVariant1 } from "./LayoutVariant1"
import { LayoutVariant2 } from "./LayoutVariant2"
import { aboutSections } from "@/data/aboutSections"

type AboutLayoutVariant = 'dots' | 'accordion'

interface AboutContentProps {
  layoutVariant?: AboutLayoutVariant
}

export function AboutContent({ layoutVariant = 'dots' }: AboutContentProps) {
  switch (layoutVariant) {
    case 'accordion':
      return <LayoutVariant2 sections={aboutSections} />
    case 'dots':
    default:
      return <LayoutVariant1 sections={aboutSections} />
  }
}

