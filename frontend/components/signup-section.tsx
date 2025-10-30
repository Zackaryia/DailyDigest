"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import Link from "next/link"

interface Interest {
  id: string
  topic: string
  description: string
}

export function SignupSection() {
  const [email, setEmail] = useState("")
  const [interests, setInterests] = useState<Interest[]>([{ id: "1", topic: "", description: "" }])

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

  const updateInterest = (id: string, field: "topic" | "description", value: string) => {
    setInterests(interests.map((interest) => (interest.id === id ? { ...interest, [field]: value } : interest)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({ email, interests })
  }

  return (
    <section id="signup" className="py-24 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            {"Start your personalized"} <br />
            <span className="text-muted-foreground">{"news briefings"}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance mb-6">
            {"Tell us what you care about, and we'll deliver the most relevant news to your inbox every morning."}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Want to see how it works?</span>
            <Link href="/briefing" className="text-primary hover:underline font-medium">
              Try our demo briefing
            </Link>
          </div>
        </div>

        <Card className="p-8 bg-card border-border/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-card-foreground">Your Interests</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInterest}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                  Add Interest
                </Button>
              </div>

              <div className="space-y-6">
                {interests.map((interest, index) => (
                  <div key={interest.id} className="space-y-3 p-4 bg-accent/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder={`Interest ${index + 1} (e.g., "Artificial Intelligence")`}
                          value={interest.topic}
                          onChange={(e) => updateInterest(interest.id, "topic", e.target.value)}
                          required
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      {interests.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInterest(interest.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Describe what aspects you're most interested in (e.g., 'Focus on enterprise applications, ethical implications, and breakthrough research rather than consumer products')"
                      value={interest.description}
                      onChange={(e) => updateInterest(interest.id, "description", e.target.value)}
                      required
                      rows={3}
                      className="bg-input border-border text-foreground resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg py-6">
              {"Start My Daily Briefings"}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">{"Free to start. No spam, ever. Unsubscribe anytime."}</p>
        </div>
      </div>
    </section>
  )
}
