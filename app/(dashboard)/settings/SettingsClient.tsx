'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CreditCard, User, Bell, Plus, Check } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'

const TABS = [
  { id: 'smtp',    label: 'SMTP Accounts', icon: <Mail size={16} />       },
  { id: 'billing', label: 'Billing & Plans', icon: <CreditCard size={16} /> },
  { id: 'profile', label: 'Profile',         icon: <User size={16} />       },
  { id: 'notif',   label: 'Notifications',   icon: <Bell size={16} />       },
]

const PLANS = [
  { id: 'free',    name: 'Free',    price: '€0',   features: ['20 prospects/month', '1 campaign', 'AI emails', 'Basic analytics'] },
  { id: 'starter', name: 'Starter', price: '€49',  features: ['200 prospects/month', '3 campaigns', 'A/B testing', 'Full analytics'] },
  { id: 'pro',     name: 'Pro',     price: '€99',  features: ['1,000 prospects/month', 'Unlimited campaigns', 'API access', 'Priority support'] },
  { id: 'agency',  name: 'Agency',  price: '€199', features: ['5,000 prospects/month', 'Multi-client', 'White-label', 'Custom integrations'] },
]

export default function SettingsClient({ profile, smtpConfigs, subscription }: {
  profile: any; smtpConfigs: any[]; subscription: any
}) {
  const [activeTab, setActiveTab] = useState('smtp')
  const currentPlan = subscription?.plan ?? 'free'

  async function handleUpgrade(plan: string) {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-8 pt-8 pb-6 border-b border-white/7">
        <h1 className="font-syne font-bold text-[26px] text-[#F0F0F8]">Settings</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tab sidebar */}
        <div className="w-56 border-r border-white/7 py-4 px-3 space-y-1" style={{ background: '#0C0C1A' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-[#018AC9]/10 text-[#018AC9] border-l-[3px] border-[#018AC9]'
                  : 'text-[#8888A8] hover:text-[#F0F0F8] hover:bg-white/3'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >

            {/* SMTP */}
            {activeTab === 'smtp' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-syne font-bold text-[20px] text-[#F0F0F8]">Connected Accounts</h2>
                    <p className="text-[13px] text-[#8888A8] mt-1">Email accounts used to send your campaigns.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#018AC9] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0199DC] transition-colors">
                    <Plus size={15} /> Add Account
                  </button>
                </div>

                <div className="space-y-3">
                  {smtpConfigs.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-white/10 rounded-xl">
                      <Mail size={28} className="text-[#44445A] mx-auto mb-3" />
                      <p className="text-[14px] text-[#44445A]">No accounts connected.</p>
                      <button className="mt-4 px-5 py-2 border border-[#018AC9]/30 text-[#018AC9] text-[13px] rounded-lg hover:bg-[#018AC9]/10 transition-colors">
                        Connect Gmail or Outlook
                      </button>
                    </div>
                  ) : smtpConfigs.map(cfg => (
                    <div key={cfg.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/7 bg-[#0F0F1E]">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-syne font-bold text-[14px]"
                        style={{ background: 'rgba(1,138,201,0.15)', color: '#018AC9' }}
                      >
                        {cfg.email?.[0]?.toUpperCase() ?? 'G'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[14px] text-[#F0F0F8]">{cfg.email}</p>
                        <p className="text-[11px] uppercase tracking-wider text-[#8888A8] mt-0.5">
                          {cfg.provider === 'gmail' ? 'Google Workspace' : cfg.provider === 'outlook' ? 'Microsoft Outlook' : 'Custom SMTP'}
                        </p>
                      </div>
                      <StatusBadge status={cfg.is_active ? 'connected' : 'paused_smtp'} />
                      {/* Toggle */}
                      <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${cfg.is_active ? 'bg-[#018AC9]' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${cfg.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div>
                <h2 className="font-syne font-bold text-[20px] text-[#F0F0F8] mb-2">Subscription Plans</h2>
                <p className="text-[13px] text-[#8888A8] mb-8">Current plan: <span className="text-[#018AC9] font-semibold capitalize">{currentPlan}</span></p>

                <div className="grid grid-cols-2 gap-4">
                  {PLANS.map(plan => {
                    const isCurrent = plan.id === currentPlan
                    return (
                      <div key={plan.id}
                        className={`p-6 rounded-xl border bg-[#0F0F1E] ${isCurrent ? 'border-[#018AC9]/50' : 'border-white/7'}`}
                        style={isCurrent ? { boxShadow: '0 0 30px rgba(1,138,201,0.08)' } : {}}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-syne font-bold text-[18px] text-[#F0F0F8]">{plan.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#018AC9] text-white font-mono text-[10px] uppercase rounded">Current</span>
                          )}
                        </div>
                        <div className="flex items-end gap-1 mb-4">
                          <span className="font-syne font-extrabold text-[36px] text-[#F0F0F8] leading-none">{plan.price}</span>
                          <span className="text-[13px] text-[#8888A8] mb-1">/month</span>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-[13px] text-[#8888A8]">
                              <Check size={13} className="text-[#018AC9]" /> {f}
                            </li>
                          ))}
                        </ul>
                        {!isCurrent && (
                          <button
                            onClick={() => handleUpgrade(plan.id)}
                            className="w-full py-2.5 border border-white/12 text-[#8888A8] text-[13px] font-semibold rounded-lg hover:border-[#018AC9]/40 hover:text-[#F0F0F8] transition-all"
                          >
                            {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="max-w-md space-y-5">
                <h2 className="font-syne font-bold text-[20px] text-[#F0F0F8] mb-6">Profile</h2>
                {[
                  { label: 'Full name',    value: profile?.full_name ?? '', placeholder: 'Your name'  },
                  { label: 'Email',        value: profile?.email ?? '',     placeholder: 'your@email.com', disabled: true },
                ].map(field => (
                  <div key={field.label}>
                    <label className="label-caps block mb-2">{field.label}</label>
                    <input defaultValue={field.value} placeholder={field.placeholder}
                      disabled={field.disabled}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0F0F1E] text-[#F0F0F8] text-[14px] outline-none focus:border-[#018AC9]/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                ))}
                <button className="px-6 py-2.5 bg-[#018AC9] text-white text-[14px] font-semibold rounded-lg hover:bg-[#0199DC] transition-colors">
                  Save changes
                </button>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notif' && (
              <div className="max-w-md">
                <h2 className="font-syne font-bold text-[20px] text-[#F0F0F8] mb-6">Notifications</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Email replied',    desc: 'When a prospect replies to your email' },
                    { label: 'Campaign complete', desc: 'When all emails in a sequence are sent' },
                    { label: 'New prospect',      desc: 'When agent finds a new validated prospect' },
                    { label: 'Blacklist alert',   desc: 'When your domain appears on a blacklist' },
                  ].map((n, i) => (
                    <div key={n.label} className="flex items-center justify-between p-4 rounded-xl border border-white/7 bg-[#0F0F1E]">
                      <div>
                        <p className="font-medium text-[14px] text-[#F0F0F8]">{n.label}</p>
                        <p className="text-[12px] text-[#8888A8] mt-0.5">{n.desc}</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full cursor-pointer transition-colors ${i < 2 ? 'bg-[#018AC9]' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${i < 2 ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  )
}
