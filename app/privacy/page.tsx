import NavBar from "@/components/NavBar"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar variant="dark" transparent noBorder />
      
      <main className="relative z-40 pt-20 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
        <div className="py-12">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-white/80 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                make a booking, or contact us for support. This may include your name, email address, 
                phone number, payment information, and vehicle preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-white/80 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, 
                process transactions, send you technical notices and support messages, and communicate 
                with you about products, services, and promotional offers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
              <p className="text-white/80 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share your information 
                with service providers who assist us in operating our website and conducting our business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-white/80 leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
              <p className="text-white/80 leading-relaxed">
                We use cookies and similar technologies to enhance your experience on our website, 
                analyze usage patterns, and provide personalized content and advertisements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-white/80 leading-relaxed">
                You have the right to access, update, or delete your personal information. You may also 
                opt out of certain communications from us. To exercise these rights, please contact us 
                using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-white/80 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-white/80 leading-relaxed">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <p className="text-white/80">Email: privacy@femileasing.com</p>
                <p className="text-white/80">Phone: (555) 123-4567</p>
                <p className="text-white/80">Address: 123 Business St, Newark, NJ 07102</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-white/60 text-sm">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

