"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Bug, Zap, Globe, Code2, Database, Search, RefreshCw,
  Download, Check, ChevronDown, Menu, X, Moon, Sun, XCircle, CheckCircle2,
  TrendingUp, Users, Briefcase, ShoppingCart, Code, Newspaper,
} from "lucide-react";
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
          {["#how-it-works", "#use-cases", "#pricing", "#faq"].map((h) => (
            <a key={h} href={h} className="hover:text-foreground transition-colors capitalize">{h.slice(1).replace("-", " ")}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
            <Moon className="h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all absolute" />
          </button>
          <Link href="/auth/login" className="hidden sm:block text-sm px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">Sign in</Link>
          <Link href="/auth/signup" className="text-sm px-4 py-1.5 rounded-lg gradient-brand text-white font-medium hover:opacity-90 transition-opacity">Try it free</Link>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          {["#how-it-works", "#use-cases", "#pricing", "#faq"].map((h) => (
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
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 mb-8">
          <Zap className="h-3 w-3" /> Turn any website into your personal data source
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-5">
          Stop copying data by hand.<br />
          <span className="gradient-text">Get a live API instead.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Universal Scraper turns any webpage into a structured REST API in seconds — no coding, no spreadsheets, no scraping scripts. Paste a URL, get clean JSON.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity text-base">
            Try it free — no credit card <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-border font-semibold hover:bg-accent transition-colors text-base">
            See a live demo
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { value: "60s", label: "From URL to live API" },
            { value: "$0", label: "To get started" },
            { value: "5+", label: "Export formats" },
            { value: "Any", label: "Website supported" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-border/60 bg-card">
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const painPoints = [
  { pain: "Copy-pasting data into spreadsheets", painDesc: "Hours wasted every week, data goes stale the moment you're done.", gain: "Paste a URL, get structured JSON", gainDesc: "Prices, titles, ratings, images — auto-extracted in one click." },
  { pain: "Paying for expensive data providers", painDesc: "$500/mo for data that's already public on the web.", gain: "Live REST API, instantly", gainDesc: "Your data is queryable, searchable, and paginated — right now." },
  { pain: "Writing scraper scripts that break", painDesc: "Site changes its HTML once and your whole pipeline dies.", gain: "Re-scrape with one click", gainDesc: "Always have the latest data. No scripts to maintain." },
  { pain: "Waiting on engineering to build an integration", painDesc: "Weeks on the backlog for something you need today.", gain: "Export to CSV, JSON, or OpenAPI", gainDesc: "Plug it into Excel, Notion, Zapier, or your own app." },
];

function ProblemSolution() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-2 mb-2">
          <h2 className="text-2xl font-bold text-muted-foreground">Sound familiar?</h2>
          <h2 className="text-2xl font-bold">With Universal Scraper</h2>
        </div>
        <div className="space-y-3">
          {painPoints.map((p) => (
            <div key={p.pain} className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex gap-3">
                <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{p.pain}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.painDesc}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{p.gain}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.gainDesc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const useCases = [
  { icon: TrendingUp, tag: "Growth & marketing", tagColor: "text-pink-400 bg-pink-500/10", title: "Track competitor pricing", desc: "Monitor competitor product prices daily. Get alerted when they change. Never lose a deal on price again." },
  { icon: Users, tag: "Sales teams", tagColor: "text-blue-400 bg-blue-500/10", title: "Build lead lists automatically", desc: "Scrape directories, company pages, and job boards. Get clean contact data directly into your CRM." },
  { icon: Briefcase, tag: "Analysts & researchers", tagColor: "text-green-400 bg-green-500/10", title: "Collect data without code", desc: "Pull tables, articles, and listings into clean datasets. Export to CSV or connect directly to your BI tool." },
  { icon: ShoppingCart, tag: "E-commerce", tagColor: "text-orange-400 bg-orange-500/10", title: "Monitor your market", desc: "Track stock levels, reviews, and pricing across competitors. React to market shifts in real time." },
  { icon: Code, tag: "Indie developers", tagColor: "text-purple-400 bg-purple-500/10", title: "Build data-powered apps fast", desc: "Skip the backend. Get a live REST API with search and pagination — use it directly in your front end." },
  { icon: Newspaper, tag: "Content teams", tagColor: "text-cyan-400 bg-cyan-500/10", title: "Aggregate content feeds", desc: "Pull news, blog posts, and social content from across the web into one structured feed your team can query." },
];

function UseCases() {
  return (
    <section id="use-cases" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Who uses Universal Scraper?</h2>
          <p className="text-muted-foreground text-lg">You don&apos;t need to be a developer. If you&apos;ve ever needed data from a website, this is for you.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((u) => (
            <div key={u.title} className="p-5 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                  <u.icon className="h-4 w-4 text-foreground" />
                </div>
                <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${u.tagColor}`}>{u.tag}</span>
              </div>
              <h3 className="font-semibold mb-2">{u.title}</h3>
              <p className="text-sm text-muted-foreground">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "1", title: "Paste any URL", desc: "Drop in a product page, news site, job board, directory — anything publicly accessible on the web.", code: "https://example.com/products" },
  { n: "2", title: "We extract the data", desc: "Our engine auto-detects titles, prices, images, dates, links — and structures it into clean JSON. No selectors to write.", code: `{ "title": "...", "price": 49, "rating": 4.8 }` },
  { n: "3", title: "Use your live API", desc: "You get instant endpoints for data, search, filtering, and pagination. Export to CSV or plug directly into your app, Zapier, or dashboard.", code: "GET /api/projects/proj_abc/data?search=nike&page=2" },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground text-lg">Three steps from URL to live API — no setup, no code.</p>
        </div>
        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="h-9 w-9 shrink-0 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">{s.n}</div>
              <div className="flex-1 pt-0.5">
                <h3 className="font-semibold text-lg mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                <pre className="text-xs font-mono p-3 bg-card border border-border/60 rounded-lg overflow-x-auto text-green-400">{s.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { quote: "I used to spend 3 hours every Monday copying competitor prices into a spreadsheet. Now I hit refresh and export the CSV in 30 seconds.", author: "E-commerce store owner" },
  { quote: "Our sales team pulls fresh lead data every morning. No more stale lists, no more manual research.", author: "Sales manager at a SaaS company" },
  { quote: "Built a price comparison side project in a weekend. The API was ready before I even started on the front end.", author: "Indie developer" },
  { quote: "I'm not a coder at all. I was able to get data from 5 different sites into one dashboard in an afternoon.", author: "Marketing analyst" },
];

function Testimonials() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">What people say</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <div key={t.author} className="p-5 rounded-2xl border-l-2 border-indigo-500 bg-card">
              <p className="text-sm italic mb-3">&quot;{t.quote}&quot;</p>
              <p className="text-xs text-muted-foreground">— {t.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Self-hosted", price: "$0", desc: "Your infrastructure, forever free", highlight: false,
    features: ["Unlimited projects & URLs", "Full REST API with search & pagination", "JSON, CSV, Markdown export", "API key management", "Swagger / OpenAPI docs", "Your data, your database"],
    cta: "Get started free", href: "/auth/signup",
  },
  {
    name: "Firecrawl+", price: "$0", priceNote: "*", desc: "For JavaScript-heavy sites", highlight: true, badge: "Recommended",
    features: ["Everything in Self-hosted", "Scrape React & Vue apps", "Bypass anti-bot protection", "Full JavaScript rendering", "Works on SPAs & dynamic pages", "*Free Firecrawl API key needed"],
    cta: "Get Firecrawl+ free", href: "/auth/signup",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Start free, scale as you grow</h2>
          <p className="text-muted-foreground text-lg">Host it yourself on Vercel + Supabase — both free. Pay nothing until you need more.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`relative p-7 rounded-2xl border ${p.highlight ? "border-indigo-500/50 bg-indigo-500/5" : "border-border/60 bg-card"}`}>
              {p.badge && <span className="absolute -top-3 left-7 text-[11px] font-medium px-2 py-1 rounded-full bg-indigo-500 text-white">{p.badge}</span>}
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <div className="text-4xl font-bold mb-1">{p.price}<span className="text-base font-normal text-muted-foreground">{p.priceNote}</span></div>
              <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
              <ul className="space-y-2 mb-8">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{f}</li>)}
              </ul>
              <Link href={p.href} className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-opacity ${p.highlight ? "gradient-brand text-white hover:opacity-90" : "border border-border hover:bg-accent"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">No credit card. No hidden costs. MIT open source license — use commercially, forever.</p>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Do I need to know how to code?", a: "No. Pasting a URL and using the dashboard requires zero coding. You only need basic comfort with a terminal if you self-host the project from scratch." },
  { q: "What kinds of websites can I scrape?", a: "Any publicly accessible page — product listings, blogs, news, directories, job boards. Always respect a site's robots.txt and terms of service." },
  { q: "How do I get the data out?", a: "Export as JSON, CSV, or Markdown directly from your project, or query the live REST API endpoints we generate for you with search, filtering, and pagination." },
  { q: "Is my data private?", a: "Yes. Everything is stored in your own database that only you control. Generated APIs are protected by your personal API keys." },
  { q: "Is it really free? What's the catch?", a: "The software is MIT-licensed and free forever. You self-host it on free tiers of Vercel and Supabase. The only cost would come from exceeding those providers' free usage limits." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Common questions</h2>
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

function FinalCTA() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Ready to stop copying data by hand?</h2>
        <p className="text-muted-foreground text-lg mb-8">Join non-technical users turning websites into clean, queryable data — in minutes.</p>
        <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity text-base">
          Start free today <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-muted-foreground mt-4">No credit card · MIT open source · Deploy in 10 minutes</p>
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
      <ProblemSolution />
      <UseCases />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}