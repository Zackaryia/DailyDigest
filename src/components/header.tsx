import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"

export function Header() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-semibold text-foreground">DailyDigest</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {isHomePage ? (
            <>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <Link to="/briefing" className="text-muted-foreground hover:text-foreground transition-colors">
                Demo Briefing
              </Link>
              <a href="#signup" className="text-muted-foreground hover:text-foreground transition-colors">
                Get Started
              </a>
            </>
          ) : (
            <>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/briefing" className="text-muted-foreground hover:text-foreground transition-colors">
                Demo Briefing
              </Link>
              <Link to="/#signup" className="text-muted-foreground hover:text-foreground transition-colors">
                Get Started
              </Link>
            </>
          )}
        </nav>

        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </div>
    </header>
  )
}
