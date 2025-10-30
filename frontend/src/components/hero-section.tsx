import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Executive-level intelligence for everyone</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
            Get Your Daily News
            <span className="text-primary block">Like a CEO</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto leading-relaxed">
            Stop scrolling through social media for news. Get AI-curated briefings tailored to your interests, just like
            executives get from their staff.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">10,000+ professionals trust us</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">95% more informed readers</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={() => {
                const signupSection = document.getElementById('signup');
                if (signupSection) {
                  signupSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Start Your Free Briefing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/briefing">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto bg-transparent">
                View Demo Briefing
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="text-sm text-muted-foreground mt-8">
            No spam, no clickbait. Just the news that matters to you.
          </p>
        </div>
      </div>
    </section>
  )
}
