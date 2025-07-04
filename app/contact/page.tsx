import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm tracking-wider">BACK</span>
          </Link>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold tracking-wider">
            FE
            <br />
            MI
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            CONTACT
          </Button>
        </div>
      </nav>

      <div className="px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-black tracking-tighter mb-4">GET IN TOUCH</h1>
          <p className="text-white/60 tracking-wider text-sm">WE'RE HERE TO HELP YOU GET ON THE ROAD</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold tracking-wider mb-8">SEND MESSAGE</h2>
            <Card className="bg-white/5 border-white/10 p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-xs font-medium text-white/60 tracking-widest uppercase">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="ENTER FIRST NAME"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-xs font-medium text-white/60 tracking-widest uppercase">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="ENTER LAST NAME"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-medium text-white/60 tracking-widest uppercase">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ENTER EMAIL ADDRESS"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs font-medium text-white/60 tracking-widest uppercase">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="ENTER PHONE NUMBER"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-xs font-medium text-white/60 tracking-widest uppercase">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="WHAT CAN WE HELP WITH?"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-xs font-medium text-white/60 tracking-widest uppercase">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="TELL US MORE ABOUT YOUR NEEDS..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[120px] mt-2"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-white/90 tracking-wider font-medium"
                >
                  SEND MESSAGE
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="text-2xl font-bold tracking-wider mb-8">CONTACT INFO</h2>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-wider mb-1">PHONE</h3>
                  <p className="text-white/60 tracking-wider">(973) 555-0123</p>
                  <p className="text-xs text-white/40 tracking-wider uppercase">24/7 EMERGENCY SUPPORT</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-wider mb-1">EMAIL</h3>
                  <p className="text-white/60 tracking-wider">INFO@FEMILEASING.COM</p>
                  <p className="text-xs text-white/40 tracking-wider uppercase">RESPONSE WITHIN 2 HOURS</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-wider mb-1">HOURS</h3>
                  <p className="text-white/60 tracking-wider">MON - FRI: 8AM - 8PM</p>
                  <p className="text-white/60 tracking-wider">SAT - SUN: 9AM - 6PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-wider mb-1">LOCATIONS</h3>
                  <p className="text-white/60 tracking-wider">NEWARK AIRPORT</p>
                  <p className="text-white/60 tracking-wider">DOWNTOWN NEWARK</p>
                  <p className="text-white/60 tracking-wider">JERSEY CITY</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
              <h3 className="font-semibold tracking-wider mb-6">QUICK ACTIONS</h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4 mr-3" />
                  CALL NOW: (973) 555-0123
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <Mail className="h-4 w-4 mr-3" />
                  EMAIL US
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <MapPin className="h-4 w-4 mr-3" />
                  GET DIRECTIONS
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
