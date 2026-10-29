"use client"

import Cta from "@/components/landing/Cta"
import Footer from "@/components/landing/Footer"
import Header from "@/components/landing/Header"
import Hero from "@/components/landing/Hero"

function page() {
          
  return (
    <div className="h-auto w-full flex flex-col items-center">
      <Header />
      <Hero />
      <Cta />
      <Footer />
    </div>
  )
}

export default page