import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, Target, Shield, Zap, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Curation",
      description:
        "Advanced algorithms analyze thousands of sources to find articles that match your specific interests and expertise level.",
      badge: "Smart",
    },
    {
      icon: Target,
      title: "Personalized Topics",
      description:
        "Define your interests with detailed descriptions. Get news about 'renewable energy policy' not just 'energy'.",
      badge: "Precise",
    },
    {
      icon: Clock,
      title: "Daily Briefings",
      description:
        "Receive your personalized news digest every morning, formatted like executive briefings with key insights.",
      badge: "Consistent",
    },
    {
      icon: Shield,
      title: "Quality Sources",
      description:
        "We prioritize credible journalism from established publications, filtering out clickbait and misinformation.",
      badge: "Trusted",
    },
    {
      icon: Zap,
      title: "Quick Insights",
      description: "Each article comes with AI-generated summaries and context, so you understand why it matters.",
      badge: "Efficient",
    },
    {
      icon: Users,
      title: "Professional Focus",
      description:
        "Built for knowledge workers who need to stay informed without getting lost in social media rabbit holes.",
      badge: "Professional",
    },
  ]

  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            News Intelligence,
            <span className="text-primary"> Reimagined</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Move beyond social media algorithms. Get the executive-level news experience you deserve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
