'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Users, Building2, MapPin, Zap } from 'lucide-react'

const CHIP_ICONS: Record<string, React.ReactNode> = {
  titles:         <Users size={12} />,
  sector:         <Building2 size={12} />,
  city:           <MapPin size={12} />,
  trigger:        <Zap size={12} />,
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [text, setText]       = useState('')
  const [parsed, setParsed]   = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState<'write' | 'confirm'>('write')
  const [name, setName]       = useState('')

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/agent/parse-icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setParsed(data)
      setName(`Campaign ${new Date().toLocaleDateString('fr-FR')}`)
      setStep('confirm')
    } catch {
      alert('Parsing failed — check your API keys')
    } finally {
      setLoading(false)
    }
  }

  async function handleLaunch() {
    if (!parsed || !name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icp_raw: text, icp_parsed: parsed }),
      })
      const { id } = await res.json()
      router.push(`/campaigns/${id}`)
    } catch {
      alert('Launch failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/7">
        <h1 className="font-syne font-bold text-[26px] text-[#F0F0F8]">New Campaign</h1>
        <p className="text-[14px] text-[#8888A8] mt-1">Describe your ideal customer and let the agent do the rest.</p>
      </div>

      {/* Step indicator */}
      <div className="px-8 py-4 flex items-center gap-3">
        {['Define ICP', 'Confirm', 'Launch'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
              i === 0 && step === 'write' ? 'bg-[#018AC9] text-white' :
              i === 1 && step === 'confirm' ? 'bg-[#018AC9] text-white' :
              i < (step === 'confirm' ? 1 : 0) ? 'bg-[#018AC9]/20 text-[#018AC9]' :
              'bg-white/7 text-[#8888A8]'
            }`}>{i + 1}</div>
            <span className="text-[13px] text-[#8888A8]">{s}</span>
            {i < 2 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="flex-1 px-8 py-6 max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 'write' ? (
            <motion.div key="write"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="label-caps block mb-3">Describe your target in plain language</label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Example: Sales directors of B2B SaaS startups between 20 and 200 employees in France, who raised funding in the last 18 months..."
                  rows={6}
                  className="w-full px-5 py-4 rounded-xl border bg-[#0F0F1E] text-[#F0F0F8] text-[15px] leading-relaxed resize-none outline-none placeholder-[#44445A] transition-colors focus:border-[#018AC9]/50"
                  style={{ borderColor: text ? 'rgba(1,138,201,0.4)' : 'rgba(255,255,255,0.07)' }}
                />
              </div>

              <button
                onClick={handleParse}
                disabled={!text.trim() || loading}
                className="w-full py-4 bg-[#018AC9] text-white font-semibold text-[15px] rounded-xl hover:bg-[#0199DC] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                style={{ boxShadow: text ? '0 0 40px rgba(1,138,201,0.25)' : 'none' }}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles size={18} /> Parse ICP with AI</>
                )}
              </button>
            </motion.div>

          ) : (
            <motion.div key="confirm"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="label-caps block mb-3">Campaign name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0F0F1E] text-[#F0F0F8] text-[15px] outline-none focus:border-[#018AC9]/50 transition-colors"
                />
              </div>

              <div>
                <label className="label-caps block mb-3">Extracted parameters</label>
                <div className="p-5 rounded-xl border border-white/7 bg-[#0F0F1E] space-y-4">
                  {parsed && Object.entries(parsed).map(([key, val]) => {
                    if (key === 'confidence' || key === 'search_queries') return null
                    const display = Array.isArray(val) ? (val as string[]).join(', ') : String(val)
                    if (!display || display === 'null') return null
                    return (
                      <div key={key} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded bg-[#018AC9]/15 flex items-center justify-center text-[#018AC9] mt-0.5">
                          {CHIP_ICONS[key] ?? <Zap size={12} />}
                        </div>
                        <div>
                          <span className="label-caps block mb-0.5">{key.replace(/_/g, ' ')}</span>
                          <span className="text-[14px] text-[#F0F0F8]">{display}</span>
                        </div>
                      </div>
                    )
                  })}
                  {parsed?.confidence && (
                    <div className="pt-3 border-t border-white/7 flex items-center gap-2">
                      <span className="label-caps">Confidence</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/7">
                        <div className="h-1.5 rounded-full bg-[#018AC9]"
                          style={{ width: `${Math.round(parsed.confidence * 100)}%` }} />
                      </div>
                      <span className="font-mono text-[12px] text-[#018AC9]">{Math.round(parsed.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('write')}
                  className="px-5 py-3 border border-white/10 text-[#8888A8] rounded-xl text-[14px] hover:border-white/20 hover:text-[#F0F0F8] transition-all"
                >
                  ← Edit
                </button>
                <button onClick={handleLaunch} disabled={loading}
                  className="flex-1 py-3 bg-[#018AC9] text-white font-semibold text-[15px] rounded-xl hover:bg-[#0199DC] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                  ) : (
                    <>Launch Agent <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
