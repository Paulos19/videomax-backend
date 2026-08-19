'use client'

import { SmoothScroll } from './smooth-scroll'
import { HeroNavbar } from './hero-navbar'
import { HeroSection } from './hero-section'
import { FeaturesParallax } from './features-parallax'
import { SectionSync } from './section-sync'
import { SectionChat } from './section-chat'
import { SectionSocial } from './section-social'
import { SectionLibrary } from './section-library'
import { SectionCTA } from './section-cta'
import { LandingFooter } from './landing-footer'

import { ParallaxWrapper } from './parallax-wrapper'

export function LandingPageClient() {
  return (
    <SmoothScroll>
      <main className="relative bg-[#050505] text-[#F5F5F5] overflow-x-hidden selection:bg-[#EF2020]/30 selection:text-white">
        
        {/* Fixed Elements */}
        <HeroNavbar />
        
        {/* Sticky Hero section: stays in place while Section 2 rolls immediately over it */}
        <div className="sticky top-0 z-[10]">
          <HeroSection />
        </div>

        {/* Section 2 immediately rolls over the Hero */}
        <div className="relative z-[20] shadow-[0_-25px_60px_rgba(0,0,0,0.95)]">
          <ParallaxWrapper>
            <FeaturesParallax />
          </ParallaxWrapper>
        </div>

        <div className="relative z-[30]">
          <ParallaxWrapper>
            <SectionSync />
          </ParallaxWrapper>
        </div>

        <div className="relative z-[40]">
          <ParallaxWrapper>
            <SectionChat />
          </ParallaxWrapper>
        </div>

        <div className="relative z-[50]">
          <ParallaxWrapper>
            <SectionSocial />
          </ParallaxWrapper>
        </div>

        <div className="relative z-[60]">
          <ParallaxWrapper>
            <SectionLibrary />
          </ParallaxWrapper>
        </div>

        <div className="relative z-[70]">
          <ParallaxWrapper>
            <SectionCTA />
          </ParallaxWrapper>
        </div>

        {/* Footer sits at the highest z-index to roll over everything */}
        <div className="relative z-[80]">
          <LandingFooter />
        </div>

      </main>
    </SmoothScroll>
  )
}
