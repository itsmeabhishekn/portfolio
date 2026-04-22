import { Navbar } from "@/components/Navbar";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteBackground } from "@/components/SiteBackground";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Education } from "@/components/Education";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <SiteBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <ExperienceTimeline />
        <FeaturedProjects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
