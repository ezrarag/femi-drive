"use client"

import { HomeHero } from "@/components/home"

// Configure homepage variant here
// Layout options: 'centered' | 'split' | 'video'
// Text options: 'minimal' | 'professional' | 'gig-economy'
const HOMEPAGE_LAYOUT: 'centered' | 'split' | 'video' = 'video'
const HOMEPAGE_TEXT: 'minimal' | 'professional' | 'gig-economy' = 'professional'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HomeHero 
        layoutVariant={HOMEPAGE_LAYOUT}
        textVariant={HOMEPAGE_TEXT}
        videoUrl="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2FHome%2FHero%20section%20alternatives%2F857263-hd_1920_1080_24fps.mp4?alt=media&token=92cced53-a5e0-4a36-98b3-fc5f95da02f6"
      />
    </div>
  )
}
