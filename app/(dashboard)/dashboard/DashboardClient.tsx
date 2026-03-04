'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Plus, TrendingUp } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Avatar } from '@/components/shared/Avatar'
import { MetricCard } from '@/components/dashboard/MetricCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
}

interface Props {
  campaigns: any[]
  prospects: any[]
  stats: { emailsSent: number; openRate: number; replyRate: number; activeCampaigns: number }
  profile: any
}

export default function DashboardClient({ campaigns, prospects, stats, profile }: Props) {
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/7 flex items-center justify-between">
        <div>
          <h1 className="font-syne font-bold text-[26px] text-[#F0F0F8]">Dashboard</h1>
          <p className="text-[14px] text-[#8888A8] mt-1">
            {stats.activeCampaigns > 0
              ? `Agent is running ${stats.activeCampaigns} active campaign${stats.activeCampaigns > 1 ? 's' : ''}.`
              : 'No active campaigns. Create one to get started.'}
          </p>
        </div>
        <Link href="/campaigns/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#018AC9] text-white font-semibold text-[13px] rounded-lg hover:bg-[#0199DC] transition-colors"
        >
          <Plus size={16} /> Launch Agent
        </Link>
      </div>

      <div className="p-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Emails Sent',       value: stats.emailsSent.toLocaleString(), trend: '+12%' },
            { label: 'Open Rate',         value: `${stats.openRate}%`,              trend: '+3%'  },
            { label: 'Reply Rate',        value: `${stats.replyRate}%`,             trend: '+1%'  },
            { label: 'Active Campaigns',  value: stats.activeCampaigns.toString(),  trend: null   },
          ].map((m, i) => (
            <motion.div key={m.label}
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
            >
              <MetricCard {...m} />
            </motion.div>
          ))}
        </div>

        {/* Recent Prospects */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="rounded-xl border border-white/7 bg-[#0F0F1E] overflow-hidden mb-6"
        >
          <div className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#018AC9]" />
              <span className="font-syne font-bold text-[16px] text-[#F0F0F8]">Recent Prospects</span>
            </div>
            <Link href="/campaigns" className="text-[13px] text-[#018AC9] hover:text-[#00B4FF] flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {prospects.length === 0 ? (
            <div className="py-16 text-center text-[#44445A] text-[14px]">
              No prospects yet. <Link href="/campaigns/new" className="text-[#018AC9] hover:underline">Launch your first campaign →</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/7">
                  {['Contact', 'Company', 'Title', 'Email', 'Status'].map(h => (
                    <th key={h} className="label-caps px-6 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prospects.map((p, i) => (
                  <tr key={p.id}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                    style={{ borderLeft: '2px solid transparent' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.contact_name ?? '?'} />
                        <span className="text-[14px] font-medium text-[#F0F0F8]">{p.contact_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#8888A8]">{p.company_name}</td>
                    <td className="px-6 py-4 text-[14px] text-[#8888A8]">{p.contact_title ?? '—'}</td>
                    <td className="px-6 py-4 font-mono text-[12px] text-[#018AC9]">{p.email ?? '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Campaigns list */}
        {campaigns.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
            className="rounded-xl border border-white/7 bg-[#0F0F1E] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
              <span className="font-syne font-bold text-[16px] text-[#F0F0F8]">Campaigns</span>
              <Link href="/campaigns" className="text-[13px] text-[#018AC9] hover:text-[#00B4FF] flex items-center gap-1">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {campaigns.slice(0, 5).map(c => (
                <Link key={c.id} href={`/campaigns/${c.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/2 transition-colors"
                >
                  <div>
                    <p className="font-medium text-[14px] text-[#F0F0F8]">{c.name}</p>
                    <p className="text-[12px] text-[#8888A8] mt-0.5">{c.prospects_count} prospects</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-[13px] text-[#018AC9]">{c.emails_sent ?? 0} sent</p>
                      <p className="text-[11px] text-[#8888A8]">{c.replies ?? 0} replies</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
