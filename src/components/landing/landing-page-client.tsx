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
import { GlobalTransitions3D } from './global-transitions-3d'

export function LandingPageClient() {
  return (
    <SmoothScroll>
      <main className="relative bg-[#050505] text-[#F5F5F5] overflow-x-hidden selection:bg-[#EF2020]/30 selection:text-white">
        
        {/* Fixed Elements */}
        <HeroNavbar />
        <GlobalTransitions3D />
        
        {/* We don't wrap the HeroSection because it has its own massive scroll logic */}
        <div className="relative z-[10]">
          <HeroSection />
        </div>

        {/* The rest of the sections sink down as the next one rolls over them */}
        <div className="relative z-[20]">
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
