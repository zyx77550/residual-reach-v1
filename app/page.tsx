'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Zap, Shield, BarChart3, Mail, Users, Clock } from 'lucide-react'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-[#018AC9]/10 border border-[#018AC9]/30">
            <Image src="/images/logo-symbol.svg" alt="R" width={22} height={22} />
          </div>
          <span className="font-syne font-700 text-[17px] text-[#F0F0F8]">Residual Reach</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'Pricing'].map((item) => (
            <a key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-[14px] font-medium text-[#8888A8] hover:text-[#F0F0F8] transition-colors"
            >{item}</a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-[14px] font-semibold text-[#8888A8] hover:text-[#F0F0F8] transition-colors px-4 py-2"
          >Log in</Link>
          <Link href="/signup"
            className="text-[14px] font-semibold text-white bg-[#018AC9] hover:bg-[#0199DC] transition-colors px-4 py-2 rounded-lg"
          >Get started free</Link>
        </div>
      </div>
    </motion.nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(1,138,201,0.12) 0%, transparent 70%)' }}
      />

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#018AC9]/30 bg-[#018AC9]/8 mb-8"
      >
        <span className="font-mono text-[11px] text-[#018AC9] tracking-widest uppercase">✦ AI-powered B2B outreach</span>
      </motion.div>

      <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="font-syne font-extrabold leading-[1.05] mb-6"
        style={{ fontSize: 'clamp(48px, 7vw, 84px)' }}
      >
        <span className="text-[#F0F0F8]">Find your prospects.</span><br />
        <span className="text-[#018AC9]">Close more deals.</span>
      </motion.h1>

      <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
        className="text-[18px] font-light text-[#8888A8] max-w-[560px] leading-relaxed mb-10"
      >
        Describe your ideal customer in plain language. Residual Reach finds the right people,
        writes a personalized email for each one, and sends the full sequence — automatically.
      </motion.p>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
        className="flex flex-col sm:flex-row items-center gap-4 mb-8"
      >
        <Link href="/signup"
          className="flex items-center gap-2 px-7 py-4 bg-[#018AC9] text-white font-semibold text-[16px] rounded-lg hover:bg-[#0199DC] transition-all hover:scale-[1.02]"
          style={{ boxShadow: '0 0 40px rgba(1,138,201,0.3)' }}
        >
          Start for free <ArrowRight size={18} />
        </Link>
        <a href="#how-it-works"
          className="px-7 py-4 border border-white/10 text-[#8888A8] font-medium text-[16px] rounded-lg hover:border-[#018AC9]/40 hover:text-[#F0F0F8] transition-all"
        >
          See how it works
        </a>
      </motion.div>

      <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={4}
        className="text-[13px] text-[#44445A] mb-16"
      >
        Trusted by 500+ sales teams · No credit card required
      </motion.p>

      {/* Hero illustration */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 4 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotateX: 0 }}
        className="relative max-w-[1000px] w-full mx-auto"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        <div className="rounded-2xl overflow-hidden border border-white/8"
          style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(1,138,201,0.08)' }}
        >
          <Image
            src="/images/hero-illustration.png"
            alt="Residual Reach — AI outreach agent"
            width={1400}
            height={788}
            priority
            className="w-full"
          />
        </div>
      </motion.div>
    </section>
  )
}

// ── Stats bar ─────────────────────────────────────────────────
const STATS = [
  { value: '75%',    label: 'Average open rate' },
  { value: '12%',    label: 'Average reply rate' },
  { value: '<30min', label: 'ICP to first email sent' },
  { value: '0€',     label: 'Operator cost per month' },
]

function StatsBar() {
  return (
    <section className="py-16 border-y border-white/7" style={{ background: '#0C0C1A' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i}
              className="text-center"
            >
              <div className="font-syne font-extrabold text-[42px] text-[#F0F0F8] mb-1">{s.value}</div>
              <div className="text-[13px] text-[#8888A8]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Define your target',           desc: 'Describe your ideal customer in plain language. Job title, industry, company size, location. The agent understands natural language — no forms to fill.' },
  { n: '02', title: 'Agent discovers prospects',     desc: 'Residual Reach searches across multiple public sources in real-time. No stale databases. Fresh data, found the day your email is sent.' },
  { n: '03', title: 'Emails verified automatically', desc: 'Every email address is validated before sending — pattern matching, DNS verification, SMTP check. 80%+ deliverability guaranteed.' },
  { n: '04', title: 'AI writes a unique email',      desc: 'The agent reads recent news, LinkedIn activity, and company context. Every email references something specific. No templates. No copy-paste.' },
  { n: '05', title: 'Sequence sent on autopilot',   desc: 'Initial email + 3 follow-ups sent automatically. Stops the moment someone replies. Your inbox fills with real conversations.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 bg-[#06060F]">
      <div className="max-w-2xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <p className="font-mono text-[11px] text-[#018AC9] uppercase tracking-[0.12em] mb-4">How it works</p>
          <h2 className="font-syne font-extrabold text-[#F0F0F8] leading-tight"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}
          >From idea to inbox<br />in 5 steps.</h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-px border-l border-dashed border-[#018AC9]/20" />
          <div className="space-y-12">
            {STEPS.map((step, i) => (
              <motion.div key={step.n}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i * 0.5}
                className="flex gap-8"
              >
                <div className="shrink-0 w-11 h-7 flex items-center justify-center rounded-md border border-[#018AC9]/25 bg-[#018AC9]/8 z-10">
                  <span className="font-mono text-[12px] text-[#018AC9] font-medium">{step.n}</span>
                </div>
                <div>
                  <h3 className="font-syne font-bold text-[20px] text-[#F0F0F8] mb-2">{step.title}</h3>
                  <p className="text-[15px] text-[#8888A8] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────
const FEATURES = [
  { icon: <Zap size={24} />,      title: 'Real-time prospecting',    desc: 'No static databases. Prospects are found fresh the day your campaign launches.' },
  { icon: <Mail size={24} />,     title: 'Hyper-personalized emails', desc: 'Every email references a specific recent event, post, or announcement from the prospect.' },
  { icon: <Shield size={24} />,   title: 'Email validation',          desc: 'DNS + SMTP verification on every address before sending. No bounces destroying your domain.' },
  { icon: <Clock size={24} />,    title: 'Automated sequences',       desc: 'Multi-step follow-up sequences that stop automatically when someone replies.' },
  { icon: <BarChart3 size={24} />,title: 'Real-time analytics',       desc: 'Track opens, replies, and bounces live. Know exactly which campaigns are working.' },
  { icon: <Users size={24} />,    title: 'Your SMTP, your reputation', desc: 'Sends via your own Gmail or Outlook. Full control of your domain reputation.' },
]

function Features() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: '#0C0C1A' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <p className="font-mono text-[11px] text-[#018AC9] uppercase tracking-[0.12em] mb-4">Features</p>
          <h2 className="font-syne font-extrabold text-[#F0F0F8] leading-tight"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}
          >Everything you need.<br />Nothing you don't.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i * 0.1}
              className="p-8 rounded-xl border border-white/7 bg-[#0F0F1E] hover:border-[#018AC9]/30 transition-all group"
              style={{ ':hover': { boxShadow: '0 0 30px rgba(1,138,201,0.06)' } } as React.CSSProperties}
            >
              <div className="text-[#018AC9] mb-4">{f.icon}</div>
              <h3 className="font-syne font-bold text-[18px] text-[#F0F0F8] mb-2">{f.title}</h3>
              <p className="text-[14px] text-[#8888A8] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I used to spend 3 hours a day just finding contacts and writing first emails. Residual Reach does it in 20 minutes and the replies are way more qualified.",
    name:  "Thomas R.", role: "Head of Sales · DataFlow", initials: "TR",
  },
  {
    quote: "The personalization is genuinely impressive. Prospects keep asking how I knew about their recent product launch. Open rate jumped to 48% on my first campaign.",
    name:  "Marie L.", role: "Founder · CloudBase", initials: "ML",
  },
  {
    quote: "I replaced Lemlist + Apollo + Hunter with just this. Same results, 80% less cost. I can't go back.",
    name:  "Ahmed K.", role: "Growth Lead · TechScale", initials: "AK",
  },
]

function Testimonials() {
  return (
    <section className="py-28 px-6 bg-[#06060F]">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <p className="font-mono text-[11px] text-[#018AC9] uppercase tracking-[0.12em] mb-4">What people say</p>
          <h2 className="font-syne font-extrabold text-[#F0F0F8] leading-tight"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}
          >Results speak louder.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i * 0.15}
              className="p-8 rounded-xl border border-white/7 bg-[#0F0F1E]"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-[#018AC9] text-[15px]">★</span>
                ))}
              </div>
              <p className="text-[15px] text-[#F0F0F8] leading-relaxed mb-6 font-light">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#018AC9]/15 border border-[#018AC9]/3 flex items-center justify-center">
                  <span className="font-syne font-bold text-[13px] text-[#018AC9]">{t.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-[14px] text-[#F0F0F8]">{t.name}</div>
                  <div className="text-[12px] text-[#8888A8]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Free', price: '€0', period: '/month', featured: false,
    features: ['20 prospects / month', '1 active campaign', 'AI email generation', 'Email validation', 'Basic analytics'],
    cta: 'Get started free', href: '/signup',
  },
  {
    name: 'Starter', price: '€49', period: '/month', featured: false,
    features: ['200 prospects / month', '3 active campaigns', 'AI email generation', 'Email validation', 'Full analytics', 'A/B testing'],
    cta: 'Get started', href: '/signup',
  },
  {
    name: 'Pro', price: '€99', period: '/month', featured: true,
    features: ['1,000 prospects / month', 'Unlimited campaigns', 'AI email generation', 'Email validation', 'Full analytics', 'A/B testing', 'API access'],
    cta: 'Get started', href: '/signup',
  },
  {
    name: 'Agency', price: '€199', period: '/month', featured: false,
    features: ['5,000 prospects / month', 'Unlimited campaigns', 'Multi-client workspace', 'White-label option', 'Priority support', 'Custom integrations'],
    cta: 'Contact us', href: 'mailto:hello@residual-labs.com',
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6" style={{ background: '#0C0C1A' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <p className="font-mono text-[11px] text-[#018AC9] uppercase tracking-[0.12em] mb-4">Pricing</p>
          <h2 className="font-syne font-extrabold text-[#F0F0F8] leading-tight mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}
          >Start free. Scale when ready.</h2>
          <p className="text-[16px] text-[#8888A8]">No credit card required. Cancel anytime.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i * 0.1}
              className={`relative p-7 rounded-2xl border bg-[#0F0F1E] flex flex-col ${
                plan.featured
                  ? 'border-[#018AC9]/50'
                  : 'border-white/7'
              }`}
              style={plan.featured ? { boxShadow: '0 0 60px rgba(1,138,201,0.1)' } : {}}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-[#018AC9] text-white font-mono text-[10px] uppercase tracking-widest rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="font-syne font-bold text-[18px] text-[#F0F0F8] mb-3">{plan.name}</div>
                <div className="flex items-end gap-1">
                  <span className="font-syne font-extrabold text-[40px] text-[#F0F0F8] leading-none">{plan.price}</span>
                  <span className="text-[14px] text-[#8888A8] mb-1">{plan.period}</span>
                </div>
              </div>

              <div className="h-px bg-white/7 mb-6" />

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-[#8888A8]">
                    <Check size={14} className="text-[#018AC9] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                className={`w-full py-3 rounded-lg text-center font-semibold text-[14px] transition-all ${
                  plan.featured
                    ? 'bg-[#018AC9] text-white hover:bg-[#0199DC]'
                    : 'border border-white/12 text-[#8888A8] hover:border-[#018AC9]/40 hover:text-[#F0F0F8]'
                }`}
              >{plan.cta}</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="py-24 px-6 bg-[#06060F]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative rounded-3xl border border-[#018AC9]/25 bg-[#0F0F1E] p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(1,138,201,0.1) 0%, transparent 70%)' }}
          />
          <h2 className="font-syne font-extrabold text-[#F0F0F8] mb-4 relative z-10"
            style={{ fontSize: 'clamp(28px, 5vw, 44px)' }}
          >Ready to fill your pipeline?</h2>
          <p className="text-[17px] text-[#8888A8] mb-10 relative z-10">
            Join 500+ sales teams using Residual Reach to automate their outreach.
          </p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-9 py-4 bg-[#018AC9] text-white font-semibold text-[16px] rounded-lg hover:bg-[#0199DC] transition-all hover:scale-[1.02] relative z-10"
            style={{ boxShadow: '0 0 60px rgba(1,138,201,0.35)' }}
          >
            Start for free <ArrowRight size={18} />
          </Link>
          <p className="mt-5 text-[13px] text-[#44445A] relative z-10">
            No credit card · Free forever on the free plan
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/7" style={{ background: '#0C0C1A' }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#018AC9]/10 border border-[#018AC9]/30 flex items-center justify-center">
                <Image src="/images/logo-symbol.svg" alt="R" width={18} height={18} />
              </div>
              <span className="font-syne font-bold text-[15px]">Residual Reach</span>
            </div>
            <p className="text-[12px] text-[#44445A]">Engineering the Impossible.</p>
          </div>

          {[
            { label: 'Product',  links: ['Features', 'How it works', 'Pricing', 'Changelog'] },
            { label: 'Company',  links: ['About', 'Blog', 'Careers', 'Contact'] },
            { label: 'Legal',    links: ['Privacy Policy', 'Terms of Service', 'GDPR'] },
          ].map(col => (
            <div key={col.label}>
              <p className="label-caps mb-4">{col.label}</p>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-[14px] text-[#8888A8] hover:text-[#F0F0F8] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/7 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#44445A]">© 2025 Residual Labs. All rights reserved.</p>
          <p className="text-[13px] text-[#44445A]">Made in Paris 🇫🇷</p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <CtaBanner />
      <Footer />
    </main>
  )
}
