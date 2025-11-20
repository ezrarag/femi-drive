// Homepage copywriting variants
export type HomeTextVariant = 'minimal' | 'professional' | 'gig-economy'

export interface HomeText {
  heading: string
  subheading: string
  description: string
  ctaText: string
}

export const homeTextVariants: Record<HomeTextVariant, HomeText> = {
  minimal: {
    heading: 'FEMI LEASING',
    subheading: '',
    description: 'Simple. Affordable. Reliable.',
    ctaText: 'View Fleet'
  },
  professional: {
    heading: 'FEMI LEASING',
    subheading: 'Premium Vehicle Rentals',
    description: 'At Femi Leasing, we believe finding the right vehicle should be simple, affordable, and stress-free. Whether you\'re hitting the road for work, running errands, or planning your next adventure, we offer a range of well maintained vehicles to fit your lifestyle and budget.',
    ctaText: 'View Fleet'
  },
  'gig-economy': {
    heading: 'DRIVE TO EARN',
    subheading: 'Rent. Drive. Earn.',
    description: 'Ready to maximize your earnings? Get behind the wheel of a gig-ready vehicle and start making money today. Flexible rentals, transparent pricing, and vehicles pre-approved for Uber, Lyft, DoorDash, and more. Your journey to financial freedom starts here!',
    ctaText: 'Start Earning Now'
  }
}

