"use client"

import React from "react"
import { useSearchParams } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Newspaper, Clock, TrendingUp } from "lucide-react"
import { EmbeddedCedarChat } from '../cedar/components/chatComponents/EmbeddedCedarChat'
import '@/styles/cedar-chat-custom.css'

// Mock briefing data - in a real app, this would come from your backend
const mockBriefing = {
  date: "September 28, 2025",
  topics: [
    {
      title: "AI Technology Advances",
      summary:
        "Major breakthroughs in AI reasoning capabilities announced by leading tech companies, with new models showing significant improvements in complex problem-solving.",
      articles: [
        { title: "OpenAI Announces GPT-6 with Enhanced Reasoning", source: "techcrunch.com", url: "https://techcrunch.com/openai-gpt6" },
        { title: "Google's Gemini Ultra 2.0 Breaks New Benchmarks", source: "theverge.com", url: "https://theverge.com/gemini-ultra-2" },
      ],
    },
    {
      title: "Climate Policy Updates",
      summary:
        "New international climate agreements reached at the Global Climate Summit, with commitments to accelerate renewable energy adoption.",
      articles: [
        { title: "Historic Climate Deal Signed by 50 Nations", source: "reuters.com", url: "https://reuters.com/climate-deal" },
        { title: "Renewable Energy Investment Hits Record High", source: "bloomberg.com", url: "https://bloomberg.com/renewable-energy" },
      ],
    },
    {
      title: "Economic Market Trends",
      summary:
        "Stock markets show mixed signals as investors react to new Federal Reserve policy announcements and inflation data.",
      articles: [
        { title: "Fed Signals Potential Rate Changes", source: "wsj.com", url: "https://wsj.com/fed-policy" },
        { title: "Tech Stocks Rally Despite Market Uncertainty", source: "ft.com", url: "https://ft.com/tech-stocks" },
      ],
    },
  ],
}

// Mock AI responses for different types of questions
export default function BriefingPage() {
  const [briefingData, setBriefingData] = React.useState(mockBriefing)
  const [loading, setLoading] = React.useState(false)
  const [userEmail, setUserEmail] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const [showChat, setShowChat] = React.useState(false)

  // Function to fetch real briefing data
  const fetchBriefing = async (email: string) => {
    if (!email) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/briefing?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setBriefingData(data)
      } else {
        console.error('Failed to fetch briefing:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching briefing:', error)
    } finally {
    }
  }

  // If URL contains ?id=..., fetch briefing from /api/get-briefing, otherwise use mock data
  React.useEffect(() => {
    const rawId = searchParams.get('id') || searchParams.get('ID')
    if (!rawId) {
      const controller = new AbortController()
      
      console.log("No ID parameter found, using mock data")
      setBriefingData(mockBriefing)
      setLoading(false)
      
      return () => controller.abort()
    }

    // URL decode the id parameter
    const id = decodeURIComponent(rawId)

    const controller = new AbortController()
    const fetchById = async () => {
      setLoading(true)
      setError(null)
      try {
        // First try the requested endpoint
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://daily-digest-demo.zackaryia.workers.dev'
        let res = await fetch(`${apiBaseUrl}/api/get-briefing/${id}`,
          { signal: controller.signal }
        )

        // If not found or other error, try the existing endpoint pattern /api/briefing/{id}
        if (!res.ok) {
          throw new Error(`Failed to fetch briefing (status ${res.status})`)
        }
        const data = await res.json()
        setBriefingData(data)
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.error('Error fetching briefing by id:', e)
          setError(e?.message || 'Failed to load briefing')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchById()
    return () => controller.abort()
  }, [searchParams])

  // Wait 500ms before showing chat to ensure briefing data is loaded
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Briefing Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Daily Digest</h1>
              <Badge variant="secondary" className="ml-2">
                {briefingData.date}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Stay informed with today's most important developments across your interests.
            </p>
            {error && (
              <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Briefing Content */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Today's Key Topics</h2>

              {loading && (
                <div className="text-sm text-muted-foreground">Loading briefing...</div>
              )}

              {!loading && briefingData.topics.map((topic, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{topic.summary}</p>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Related Articles:</h4>
                      {topic.articles.map((article, articleIndex) => (
                        <div key={articleIndex} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                          <div className="flex-1">
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-foreground text-sm mb-1 hover:text-primary underline-offset-4 hover:underline block"
                            >
                              {article.title}
                            </a>
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary"
                            >
                              {article.source}
                            </a>
                          </div>
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Badge variant="secondary" className="ml-3 text-xs hover:bg-primary/20 cursor-pointer">
                              {article.source}
                            </Badge>
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Chat Interface */}
            <div className="lg:sticky lg:top-8">
              <div className="cedar-chat-custom">
                <EmbeddedCedarChat 
                  title="Discuss Your Briefing"
                  companyLogo={<Bot className="h-5 w-5 text-primary" />}
                  showHeader={true}
                  stream={true}
                  className="h-[600px] flex flex-col"
                  briefingData={briefingData}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
