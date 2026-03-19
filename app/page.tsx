import { Navbar } from "@/components/ember/navbar"
import { Hero } from "@/components/ember/hero"
import { WhatIsOkak } from "@/components/ember/what-is-okak"
import { Comparison } from "@/components/ember/comparison"
import { OverlayDemo } from "@/components/ember/overlay-demo"
import { AgentZones } from "@/components/ember/agent-zones"
import { Features } from "@/components/ember/features"
import { FileUpload } from "@/components/ember/file-upload"
import { AppNavigation } from "@/components/ember/app-navigation"
import { Pricing } from "@/components/ember/pricing"
import { Footer } from "@/components/ember/footer"

export default function Page() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <WhatIsOkak />
      <Comparison />
      <OverlayDemo />
      <AppNavigation />
      <Features />
      <AgentZones />
      <FileUpload />
      <Pricing />
      <Footer />
    </main>
  )
}
