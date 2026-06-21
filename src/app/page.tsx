"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bug, Zap, Globe, Code2, Database, Search, Key, RefreshCw, Download, Shield, Check, ChevronDown, Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function NavBar() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center">
            <Bug className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:block">Universal Scraper</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {["#features","#how-it-works","#pricing","#faq"].map((h) => (
            <a key={h} href={h} className="hover:text-foreground transition-colors capitalize">{h.slice(1).replace("-", " ")}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
            <Moon className="h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all absolute" />
          </button>
          <Link href="/auth/login" className="hidden sm:block text-sm px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">Sign in</Link>
          <Link href="/auth/signup" className="text-sm px-4 py-1.5 rounded-lg gradient-brand text-white font-medium hover:opacity-90 transition-opacity">Get Started</Link>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          {["#features","#how-it-works","#pricing","#faq"].map((h) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground capitalize">{h.slice(1).replace("-", " ")}</a>
          ))}
          <Link href="/auth/login" className="block py-2 text-sm">Sign in</Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative py-24 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 mb-8">
          <Zap className="h-3 w-3" /> No Python. No server. Just GitHub → Vercel.
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
          Any website becomes<br /><span className="gradient-text">a REST API</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Paste a URL. We scrape it, extract structured JSON, and generate live API endpoints — with Swagger docs, search, and pagination.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity text-base">
            Start free — deploy to Vercel <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border font-semibold hover:bg-accent transition-colors text-base">
            Sign in
          </Link>
        </div>
        <div className="mt-16 rounded-2xl border border-border/60 bg-card overflow-hidden text-left shadow-2xl max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-yellow-400" /><div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-muted-foreground">GET /api/projects/proj_abc/data</span>
          </div>
          <pre className="p-5 text-sm json-view text-green-400 overflow-auto">{`{
  "data": [
    { "title": "MacBook Pro 16\\"", "price": 2499, "rating": 4.8, "inStock": true },
    { "title": "iPhone 16 Pro",    "price": 999,  "rating": 4.9, "inStock": true }
  ],
  "pagination": { "page": 1, "total": 128, "totalPages": 7 }
}`}</pre>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Globe, title: "Smart Scraper", desc: "Auto-detects static vs dynamic sites. Uses Cheerio for speed, falls back gracefully.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Code2, title: "Instant REST APIs", desc: "Every project gets /data, /search, /schema, /docs endpoints immediately.", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Search, title: "Full-Text Search", desc: "Built-in search with field filtering and relevance scoring.", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Database, title: "Structured JSON", desc: "AI-style extraction: title, price, author, date, links, images — all auto-detected.", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Key, title: "API Key Auth", desc: "Generate keys, set usage limits, track calls. Each key tied to your account.", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { icon: Download, title: "Export Anywhere", desc: "Download your data as JSON, CSV, Markdown, or full OpenAPI spec.", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: RefreshCw, title: "Re-scrape Anytime", desc: "One-click refresh to get the latest data from any URL.", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Shield, title: "Secure by Default", desc: "JWT sessions, rate limiting, Zod validation, SQL injection protection.", color: "text-red-500", bg: "bg-red-500/10" },
];

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-lg">A complete data extraction and API platform in one Next.js app.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="p-5 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-colors">
              <div className={`h-10 w-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}><f.icon className={`h-5 w-5 ${f.color}`} /></div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "1", title: "Push to GitHub", desc: "Clone this repo, push to your GitHub account. One command." },
  { n: "2", title: "Connect Vercel", desc: "Import the repo in Vercel. Auto-deploys on every push." },
  { n: "3", title: "Add 3 env keys", desc: "DATABASE_URL (Supabase free), NEXTAUTH_SECRET, NEXTAUTH_URL. That's it." },
  { n: "4", title: "Scrape any URL", desc: "Paste a URL in the dashboard. Get a live API in seconds." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Up and running in <span className="gradient-text">10 minutes</span></h2>
          <p className="text-muted-foreground text-lg">No server to manage. No Python. Pure Next.js on Vercel.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-lg">{s.n}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-6 rounded-2xl border border-border/60 bg-card">
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick deploy commands</p>
          <pre className="text-sm font-mono text-green-400">{`git clone https://github.com/YOUR_USERNAME/universal-scraper
cd universal-scraper
git push origin main
# → connect on vercel.com → add env keys → done ✅`}</pre>
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Self-hosted", price: "$0", desc: "Your own Vercel + Supabase", highlight: false,
    features: ["Unlimited projects", "All scraping engines", "Full REST API generation", "API key management", "JSON / CSV export", "Swagger docs", "Dark + light mode"],
    cta: "Deploy free", href: "/auth/signup",
  },
  {
    name: "Firecrawl+", price: "$0*", desc: "Add Firecrawl for JS-heavy sites", highlight: true,
    features: ["Everything in Self-hosted", "Firecrawl premium engine", "React/Vue SPA scraping", "Anti-bot bypass", "JavaScript rendering", "*Firecrawl API key required"],
    cta: "Get started", href: "/auth/signup",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Free forever</h2>
          <p className="text-muted-foreground text-lg">Self-host on Vercel + Supabase. Infrastructure costs are $0 for small projects.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`p-7 rounded-2xl border ${p.highlight ? "border-indigo-500/50 bg-indigo-500/5" : "border-border/60 bg-card"}`}>
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <div className="text-4xl font-bold mb-1">{p.price}</div>
              <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
              <ul className="space-y-2 mb-8">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{f}</li>)}
              </ul>
              <Link href={p.href} className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-opacity ${p.highlight ? "gradient-brand text-white hover:opacity-90" : "border border-border hover:bg-accent"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">Supabase free: 500MB · Vercel free: 100GB bandwidth · No credit card needed</p>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Do I need to install Python or Docker?", a: "No. This is a pure Next.js app. Everything — scraping, APIs, auth, database — runs on Vercel. Just connect GitHub and add 3 env keys." },
  { q: "What's the minimum setup?", a: "Just DATABASE_URL (free Supabase), NEXTAUTH_SECRET (random string), and NEXTAUTH_URL (your Vercel URL). That's it. GitHub/Google login are optional extras." },
  { q: "How does scraping work without Python?", a: "We use Cheerio (a Node.js HTML parser) which runs directly in Vercel's serverless functions. It handles most static and semi-dynamic websites perfectly." },
  { q: "What about JavaScript-heavy sites (React, Vue)?", a: "Add your Firecrawl API key in Settings. Firecrawl handles full browser rendering. Free tier at firecrawl.dev gives 500 credits/month." },
  { q: "Is my scraped data private?", a: "Yes. All data is stored in your own Supabase database that only you control. Generated APIs are protected by your personal API keys." },
  { q: "Can I use this commercially?", a: "Yes. MIT license — free for personal and commercial use. Your data, your infrastructure." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12"><h2 className="text-4xl font-bold">FAQ</h2></div>
        <div className="border border-border/60 rounded-2xl bg-card divide-y divide-border/60 overflow-hidden">
          {faqs.map((f, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left flex justify-between items-center p-5 hover:bg-muted/30 transition-colors gap-4">
                <span className="font-medium text-sm">{f.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium">
          <div className="h-6 w-6 rounded gradient-brand flex items-center justify-center"><Bug className="h-3 w-3 text-white" /></div>
          Universal Scraper API Builder
        </div>
        <div className="flex items-center gap-5">
          <Link href="/auth/login" className="hover:text-foreground">Sign In</Link>
          <Link href="/auth/signup" className="hover:text-foreground">Sign Up</Link>
          <a href="https://github.com" target="_blank" className="hover:text-foreground">GitHub</a>
        </div>
        <p className="text-xs">MIT License · Open Source · Free Forever</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
