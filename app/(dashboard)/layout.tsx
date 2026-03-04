import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#06060F]">
      <Sidebar />
      <div className="flex-1 ml-14 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
