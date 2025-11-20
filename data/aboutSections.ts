// About page sections data
export interface AboutSection {
  label: string
  title: string
  shortContent: string
  fullContent: string
  hasReadMore?: boolean
}

export const aboutSections: AboutSection[] = [
  {
    label: "About Us",
    title: "FEMI LEASING",
    shortContent: "To provide accessible, flexible, and dependable car rental solutions that fit seamlessly into the lives of our clients. We're committed to serving a diverse community of drivers—whether you're working in the gig economy, traveling for business, or simply need a reliable ride for personal use.",
    fullContent: "To provide accessible, flexible, and dependable car rental solutions that fit seamlessly into the lives of our clients. We're committed to serving a diverse community of drivers—whether you're working in the gig economy, traveling for business, or simply need a reliable ride for personal use.",
    hasReadMore: false
  },
  {
    label: "Our Vision",
    title: "OUR VISION",
    shortContent: "At Femi Leasing, our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.",
    fullContent: "At Femi Leasing, our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.\n\nThrough innovation, strategic partnerships, and a deep understanding of our clients' needs, we aim to set a new industry benchmark delivering flexibility, reliability, and excellence at every turn.",
    hasReadMore: true
  },
  {
    label: "Who We Are",
    title: "WHO WE ARE",
    shortContent: "At Femi Leasing, our journey began with a simple mission: to redefine car rentals by making the process more convenient, flexible, and accessible especially for the hardworking individuals powering today's gig economy.",
    fullContent: "At Femi Leasing, our journey began with a simple mission: to redefine car rentals by making the process more convenient, flexible, and accessible especially for the hardworking individuals powering today's gig economy.\n\nWith over 20 years of industry experience, we saw a growing need in the NJ/NY area for reliable, short term rental options tailored to modern drivers. Whether you're behind the wheel for Uber, running errands, or taking a well deserved weekend getaway, we wanted to make sure you had the right vehicle without the stress.\n\nWhat started as a small venture has grown into a trusted name, proudly serving drivers between the ages of 25 and 55 with high quality vehicles, transparent pricing, and unmatched customer service. Our close collaboration with Uber and other ride sharing platforms allows us to offer tailored solutions that help drivers hit the road faster and earn more, with less hassle.\n\nFemi Leasing isn't just a rental service it's a community built on trust, convenience, and the freedom to move.",
    hasReadMore: true
  }
]

