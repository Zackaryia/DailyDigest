import { Card } from "@/components/ui/card"
import { Brain, Filter, Mail, Target, TrendingUp, Users } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Curation",
    description:
      "Advanced algorithms analyze thousands of articles daily to find content that matches your specific interests and expertise level.",
  },
  {
    icon: Filter,
    title: "Signal Over Noise",
    description:
      "Cut through the clutter of social media algorithms. Get news that matters to you, not what drives engagement.",
  },
  {
    icon: Target,
    title: "Precision Matching",
    description:
      "Define your interests with detailed descriptions. Our AI understands context and nuance to deliver highly relevant content.",
  },
  {
    icon: Mail,
    title: "Daily Briefings",
    description:
      "Receive your personalized news digest every morning, formatted like executive briefings with key insights and explanations.",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description:
      "Understand not just what happened, but why it matters. Get context and analysis that helps you stay ahead.",
  },
  {
    icon: Users,
    title: "Diverse Sources",
    description:
      "We aggregate from hundreds of trusted sources across industries, ensuring you get a balanced, comprehensive view.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            {"Executive-level intelligence,"} <br />
            <span className="text-muted-foreground">{"for everyone"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            {"Transform how you consume news with AI that works like your personal research team."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card border-border/50 hover:border-border transition-colors">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
