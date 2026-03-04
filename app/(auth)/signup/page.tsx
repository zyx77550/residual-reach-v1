'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#06060F]"
      style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(1,138,201,0.08) 0%, transparent 70%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#018AC9]/10 border border-[#018AC9]/30 flex items-center justify-center">
              <Image src="/images/logo-symbol.svg" alt="R" width={22} height={22} />
            </div>
            <span className="font-syne font-bold text-[17px]">Residual Reach</span>
          </Link>
          <h1 className="font-syne font-bold text-[26px] text-[#F0F0F8]">Create your account</h1>
          <p className="text-[14px] text-[#8888A8] mt-2">Free forever on the free plan</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="label-caps block mb-2">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0F0F1E] text-[#F0F0F8] text-[14px] outline-none focus:border-[#018AC9]/50 transition-colors placeholder-[#44445A]"
            />
          </div>
          <div>
            <label className="label-caps block mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0F0F1E] text-[#F0F0F8] text-[14px] outline-none focus:border-[#018AC9]/50 transition-colors placeholder-[#44445A]"
            />
          </div>
          <div>
            <label className="label-caps block mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0F0F1E] text-[#F0F0F8] text-[14px] outline-none focus:border-[#018AC9]/50 transition-colors placeholder-[#44445A]"
            />
          </div>

          {error && <p className="text-[13px] text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#018AC9] text-white font-semibold text-[15px] rounded-xl hover:bg-[#0199DC] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: '0 0 30px rgba(1,138,201,0.2)' }}
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              : 'Get started free'
            }
          </button>
        </form>

        <p className="text-center text-[13px] text-[#8888A8] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#018AC9] hover:underline font-medium">Sign in</Link>
        </p>

        <p className="text-center text-[11px] text-[#44445A] mt-4">
          By signing up, you agree to our{' '}
          <a href="#" className="hover:text-[#8888A8]">Terms</a> and{' '}
          <a href="#" className="hover:text-[#8888A8]">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
