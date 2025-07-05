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
          {`"Body language translates directly into emotion and is often a powerful way to convey a story or a brand's message."\n\nAs a film director with a dance background, Mikki explores the deeper potential of movement: not just as abstraction or form, but as a way to create dramatic narrative. From precise choreography to the subtlest gesture: even a twitch of the eye can drive a story forward. She is currently working on her debut short film, The Gift, set to premiere in 2025.`}
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
          Throughout her commercial career, she has collaborated with clients such as IKEA, ECCO, Zalando, Klabu, Nike,
          Heineken, Vodafone, Ronald McDonald House, Libresse, Top Notch and Sony Music. In addition to directing, Mikki
          draws on experience in both the art department and production, bringing a distinctive visual style and a sharp
          eye for detail.
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-4 label-text flex items-center justify-between text-neutral-700">
        <div>© 2025 Mikki Sindhunata · Cookies</div>
        <div className="text-center flex-1">All Rights Reserved</div>
        <div className="flex items-center gap-1">
          <span>Website by</span>
          {/* tiny bird icon with emoji fallback */}
          <span role="img" aria-label="bird">
            🐦
          </span>
        </div>
      </footer>
    </main>
  )
}
