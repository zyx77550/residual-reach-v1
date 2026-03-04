'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  label: string
  value: string
  trend?: string | null
}

export function MetricCard({ label, value, trend }: Props) {
  return (
    <div
      className="p-6 rounded-xl border border-white/7 bg-[#0F0F1E] hover:border-[#018AC9]/30 transition-all group"
    >
      <p className="label-caps mb-3">{label}</p>
      <p className="font-syne font-extrabold text-[38px] text-[#F0F0F8] leading-none">{value}</p>
      {trend && (
        <p className="text-[12px] text-[#00C48C] mt-2 font-medium">{trend} this week</p>
      )}
    </div>
  )
}
