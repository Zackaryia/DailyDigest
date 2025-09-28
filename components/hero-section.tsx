import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-24 px-4 text-center">
      <div className="container mx-auto max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 text-accent-foreground text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          <span>{"Powered by advanced AI curation"}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6 leading-tight">
          {"Your personal"} <br />
          <span className="text-muted-foreground">{"news briefing,"}</span> <br />
          {"delivered daily"}
        </h1>

        <p className="text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
          {
            "Stop drowning in social media noise. Get executive-level news briefings tailored to your interests, powered by AI that scans thousands of sources daily."
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <a href="#signup">
              {"Start Your Briefings"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
            <Link href="/briefing">{"See Example Briefing"}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
