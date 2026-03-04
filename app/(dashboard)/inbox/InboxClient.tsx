'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Archive } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'

const TABS = ['All', 'Unread', 'Positive']

export default function InboxClient({ emails }: { emails: any[] }) {
  const [activeTab, setActiveTab] = useState('All')
  const [selected, setSelected]  = useState<any | null>(emails[0] ?? null)
  const [search, setSearch]      = useState('')

  const filtered = emails.filter(e => {
    const name = e.prospects?.contact_name ?? ''
    const comp = e.prospects?.company_name ?? ''
    return (name + comp).toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 pt-8 pb-4 border-b border-white/7">
        <h1 className="font-syne font-bold text-[26px] text-[#F0F0F8]">Inbox</h1>
        <p className="text-[14px] text-[#8888A8] mt-1">{emails.length} conversations</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List panel */}
        <div className="w-80 border-r border-white/7 flex flex-col" style={{ background: '#0C0C1A' }}>
          {/* Search */}
          <div className="px-4 py-3 border-b border-white/7">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/7 bg-[#0F0F1E]">
              <Search size={14} className="text-[#44445A]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search replies..."
                className="flex-1 bg-transparent text-[14px] text-[#F0F0F8] placeholder-[#44445A] outline-none"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/7">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[13px] font-semibold transition-colors relative ${
                  activeTab === tab ? 'text-[#018AC9]' : 'text-[#8888A8] hover:text-[#F0F0F8]'
                }`}
              >
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#018AC9] rounded-full" />}
              </button>
            ))}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[13px] text-[#44445A]">No conversations yet</div>
            ) : filtered.map((e, i) => (
              <motion.button key={e.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(e)}
                className={`w-full flex items-start gap-3 px-4 py-4 border-b border-white/5 text-left transition-colors hover:bg-white/2 ${
                  selected?.id === e.id ? 'bg-[#018AC9]/6 border-l-2 border-l-[#018AC9]' : ''
                }`}
              >
                <div className="relative">
                  <Avatar name={e.prospects?.contact_name ?? '?'} size={36} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#0C0C1A]"
                    style={{ background: e.status === 'replied' ? '#00C48C' : '#F59E0B' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-[13px] text-[#F0F0F8] truncate">{e.prospects?.contact_name ?? 'Unknown'}</span>
                    <span className="text-[11px] text-[#44445A] shrink-0">2m ago</span>
                  </div>
                  <p className="text-[12px] text-[#8888A8] truncate">{e.subject}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(1,138,201,0.1)', color: '#018AC9' }}
                  >{e.prospects?.company_name}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.prospects?.contact_name ?? '?'} size={40} />
                  <div>
                    <p className="font-syne font-bold text-[16px] text-[#F0F0F8]">{selected.prospects?.contact_name ?? 'Unknown'}</p>
                    <p className="text-[12px] text-[#8888A8]">{selected.prospects?.contact_title} · {selected.prospects?.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selected.status} />
                  <button className="p-2 rounded-lg border border-white/10 text-[#8888A8] hover:text-[#F0F0F8] hover:border-white/20 transition-colors">
                    <Archive size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Sent email */}
                <div className="max-w-lg">
                  <p className="label-caps mb-2">You sent</p>
                  <div className="p-5 rounded-xl border border-white/7 bg-[#0F0F1E]">
                    <p className="font-semibold text-[14px] text-[#F0F0F8] mb-3">{selected.subject}</p>
                    <p className="text-[14px] text-[#8888A8] leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                  </div>
                </div>

                {/* Reply placeholder */}
                {selected.status === 'replied' && (
                  <div className="max-w-lg ml-auto">
                    <p className="label-caps mb-2 text-right">Their reply</p>
                    <div className="p-5 rounded-xl border border-[#00C48C]/20 bg-[#00C48C]/5">
                      <p className="text-[14px] text-[#F0F0F8] leading-relaxed italic">
                        Reply received. View in your email client for the full thread.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#44445A] text-[14px]">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
