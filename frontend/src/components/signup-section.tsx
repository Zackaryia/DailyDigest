"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Mail, Sparkles, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

interface Interest {
  id: string
  topic: string
  description: string
}

export function SignupSection() {
  const [email, setEmail] = useState("")
  const [interests, setInterests] = useState<Interest[]>([{ id: "1", topic: "", description: "" }])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const addInterest = () => {
    const newInterest: Interest = {
      id: Date.now().toString(),
      topic: "",
      description: "",
    }
    setInterests([...interests, newInterest])
  }

  const removeInterest = (id: string) => {
    if (interests.length > 1) {
      setInterests(interests.filter((interest) => interest.id !== id))
    }
  }

  const updateInterest = (id: string, field: keyof Interest, value: string) => {
    setInterests(interests.map((interest) => (interest.id === id ? { ...interest, [field]: value } : interest)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)
    setSubmitting(true)

    try {
      // Map to backend schema: { email, interests: [{ topic, explanation }] }
      const payload = {
        email: email.trim(),
        interests: interests
          .filter((i) => i.topic.trim().length > 0)
          .map((i) => ({ topic: i.topic.trim(), explanation: i.description.trim() })),
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://daily-digest-demo.zackaryia.workers.dev'
      const res = await fetch(`${apiBaseUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log(res)

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed with status ${res.status}`)
      }

      setSubmitSuccess(true)
      // Optional: reset form
      setEmail("")
      setInterests([{ id: Date.now().toString(), topic: "", description: "" }])
    } catch (err: any) {
      setSubmitError(String(err?.message || err || "Failed to register"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="signup" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Start your intelligent news journey</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Get Started in
              <span className="text-primary"> 2 Minutes</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Tell us what you care about, and we'll deliver personalized briefings to your inbox every morning.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  Create Your Briefing Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background border-border"
                    />
                  </div>

                  {/* Interests */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground">Your Interests</Label>
                      <Badge variant="secondary" className="text-xs">
                        {interests.length} topic{interests.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {interests.map((interest, index) => (
                      <Card key={interest.id} className="border-border/50 bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium text-foreground">Interest #{index + 1}</Label>
                              {interests.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInterest(interest.id)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <Input
                              placeholder="e.g., Artificial Intelligence, Climate Policy, Fintech"
                              value={interest.topic}
                              onChange={(e) => updateInterest(interest.id, "topic", e.target.value)}
                              className="bg-background border-border"
                            />

                            <Textarea
                              placeholder="Describe what aspects interest you most (e.g., 'Focus on AI safety research and regulation, especially in healthcare applications')"
                              value={interest.description}
                              onChange={(e) => updateInterest(interest.id, "description", e.target.value)}
                              className="bg-background border-border min-h-[80px] resize-none"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addInterest}
                      className="w-full border-dashed border-border hover:border-primary hover:text-primary bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Interest
                    </Button>
                  </div>

                  {submitError && (
                    <p className="text-sm text-destructive">{submitError}</p>
                  )}
                  {submitSuccess && (
                    <p className="text-sm text-green-600">Registration successful!</p>
                  )}
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? "Submitting..." : "Start My Daily Briefings"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preview/Benefits */}
            <div className="space-y-6">
              <Card className="border-border bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-foreground">What You'll Get</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Daily Morning Briefing</p>
                      <p className="text-sm text-muted-foreground">Delivered to your inbox by 7 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Personalized Content</p>
                      <p className="text-sm text-muted-foreground">Tailored to your specific interests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">AI Insights</p>
                      <p className="text-sm text-muted-foreground">Context and analysis for each story</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Quality Sources</p>
                      <p className="text-sm text-muted-foreground">Credible journalism, no clickbait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Want to see what a briefing looks like first?</p>
                <Link to="/briefing">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Sample Briefing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
