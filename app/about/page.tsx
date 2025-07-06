import Image from "next/image"
import Link from "next/link"
// import portrait from "@/../public/placeholder-user.jpg"

const navItemsLeft = [
  { label: "Home", href: "/" },
  { label: "Works", href: "/works" },
  { label: "Archive", href: "/archive" },
]

const navItemsRight = [
  { label: "About", href: "/about", active: true },
  { label: "Contact", href: "/contact" },
]

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full bg-gray-100 flex flex-col items-center text-neutral-900">
      {/* Navigation */}
      <header className="absolute top-6 left-0 right-0 flex items-center justify-between px-6">
        {/* Left nav */}
        <nav className="flex gap-4">
          {navItemsLeft.map((item) => (
            <Link key={item.label} href={item.href} className="nav-text hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Center logo (stacked MI / KKI) */}
        <div className="flex flex-col items-center leading-none font-black uppercase tracking-widest">
          <span className="block">FE</span>
          <span className="-mt-1 block">MI</span>
        </div>

        {/* Right nav */}
        <nav className="flex gap-4">
          {navItemsRight.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-text ${
                item.active ? "bg-neutral-900 text-white px-3 py-1 rounded-full" : "hover:underline"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Content wrapper */}
      <section className="flex-1 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center gap-8 py-24">
        {/* Title */}
        <h1 className="display-heading text-4xl md:text-6xl tracking-tighter">FEMI LEASING</h1>

        {/* Body paragraph */}
        <p className="body-text whitespace-pre-line leading-relaxed max-w-prose">
          {`"At Femi Leasing, our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.
​
Through innovation, strategic partnerships, and a deep understanding of our clients' needs, we aim to set a new industry benchmark delivering flexibility, reliability, and excellence at every turn."\n\nAt Femi Leasing, our mission is to provide accessible, flexible, and dependable car rental solutions that fit seamlessly into the lives of our clients. We’re committed to serving a diverse community of drivers whether you're working in the gig economy, traveling for business, or simply need a reliable ride for personal use.​ By combining quality vehicles with exceptional customer service and user friendly policies, we aim to remove the stress from car rentals and empower our clients with the freedom to move on their own terms.`}
        </p>

        {/* Polaroid-style portrait */}
        <div className="rounded-lg shadow-md bg-white p-2 inline-block">
          <Image
            src="/placeholder-user.jpg" // served directly from /public
            alt="Portrait"
            width={300}
            height={360}
            unoptimized // skip next/image optimization to avoid blob errors
            className="object-cover rounded-md"
          />
        </div>

        {/* Bottom paragraph */}
        <p className="body-text leading-relaxed max-w-prose">
          At Femi Leasing, our journey began with a simple mission: to redefine car rentals by making the process more convenient, flexible, and accessible especially for the hardworking individuals powering today’s gig economy.
​
With over 20 years of industry experience, we saw a growing need in the NJ/NY area for reliable, short term rental options tailored to modern drivers. Whether you're behind the wheel for Uber, running errands, or taking a well deserved weekend getaway, we wanted to make sure you had the right vehicle without the stress.
What started as a small venture has grown into a trusted name, proudly serving drivers between the ages of 25 and 55 with high quality vehicles, transparent pricing, and unmatched customer service. Our close collaboration with Uber and other ride sharing platforms allows us to offer tailored solutions that help drivers hit the road faster and earn more, with less hassle.
​
Femi Leasing isn’t just a rental service it’s a community built on trust, convenience, and the freedom to move.
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-4 label-text flex items-center justify-between text-neutral-700">
        <div>© 2025 Femi Leasing · Cookies</div>
        <div className="text-center flex-1">All Rights Reserved</div>
        <div className="flex items-center gap-1">
          <span>Website by</span>
{/* bow and arrow icon with emoji fallback */}
<span role="img" aria-label="bow and arrow">
  🏹
</span>
        </div>
      </footer>
    </main>
  )
}
