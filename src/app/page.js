import HeroSection from "./components/HeroSection"
import Navbar from "./components/Navbar"
import AboutSection from "./components/AboutSection"
import ProjectsSection from "./components/ProjectsSection"
import EmailSection from "./components/EmailSection"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-page">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-hero-glow opacity-90"
        aria-hidden
      />
      <Navbar />
      <div className="container relative mx-auto max-w-6xl px-4 pt-16 pb-16 sm:px-6 sm:pt-20 lg:px-8">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <EmailSection />
      </div>
    </main>
  )
}
