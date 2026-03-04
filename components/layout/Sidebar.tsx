'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Rocket, Users, Inbox, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/campaigns',  icon: Rocket,           label: 'Campaigns'  },
  { href: '/prospects',  icon: Users,            label: 'Prospects'  },
  { href: '/inbox',      icon: Inbox,            label: 'Inbox'      },
  { href: '/settings',   icon: Settings,         label: 'Settings'   },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-14 flex flex-col items-center py-4 z-40 border-r border-white/7"
      style={{ background: '#0C0C1A' }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 w-9 h-9 rounded-lg overflow-hidden bg-[#018AC9]/10 border border-[#018AC9]/30 flex items-center justify-center hover:bg-[#018AC9]/20 transition-colors">
        <Image src="/images/logo-symbol.svg" alt="Residual Reach" width={22} height={22} />
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} title={label}
              className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all group ${
                active
                  ? 'bg-[#018AC9]/10 text-[#018AC9]'
                  : 'text-[#44445A] hover:text-[#8888A8] hover:bg-white/4'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-[#018AC9]" />
              )}
              <Icon size={18} />
              {/* Tooltip */}
              <span className="absolute left-12 px-2 py-1 rounded-md bg-[#0C0C1A] border border-white/10 text-[12px] text-[#F0F0F8] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
