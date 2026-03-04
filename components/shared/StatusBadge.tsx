const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  sent:         { label: 'Sent',         color: '#018AC9', bg: 'rgba(1,138,201,0.12)',  dot: '#018AC9' },
  replied:      { label: 'Replied',      color: '#00C48C', bg: 'rgba(0,196,140,0.12)', dot: '#00C48C' },
  opened:       { label: 'Opened',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',dot: '#F59E0B' },
  pending:      { label: 'Pending',      color: '#8888A8', bg: 'rgba(136,136,168,0.1)',dot: '#8888A8' },
  bounced:      { label: 'Bounced',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)', dot: '#EF4444' },
  unsubscribed: { label: 'Unsub.',       color: '#8888A8', bg: 'rgba(136,136,168,0.1)',dot: '#8888A8' },
  running:      { label: 'Running',      color: '#00C48C', bg: 'rgba(0,196,140,0.12)', dot: '#00C48C' },
  draft:        { label: 'Draft',        color: '#8888A8', bg: 'rgba(136,136,168,0.1)',dot: '#8888A8' },
  paused:       { label: 'Paused',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',dot: '#F59E0B' },
  completed:    { label: 'Completed',    color: '#018AC9', bg: 'rgba(1,138,201,0.12)',  dot: '#018AC9' },
  found:        { label: 'Found',        color: '#8888A8', bg: 'rgba(136,136,168,0.1)',dot: '#8888A8' },
  enriched:     { label: 'Enriched',     color: '#018AC9', bg: 'rgba(1,138,201,0.12)',  dot: '#018AC9' },
  email_ready:  { label: 'Email Ready',  color: '#00C48C', bg: 'rgba(0,196,140,0.12)', dot: '#00C48C' },
  verified:     { label: 'Verified',     color: '#00C48C', bg: 'rgba(0,196,140,0.12)', dot: '#00C48C' },
  uncertain:    { label: 'Uncertain',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',dot: '#F59E0B' },
  invalid:      { label: 'Invalid',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)', dot: '#EF4444' },
  active:       { label: 'Active',       color: '#00C48C', bg: 'rgba(0,196,140,0.12)', dot: '#00C48C' },
  paused_smtp:  { label: 'Paused',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',dot: '#F59E0B' },
  connected:    { label: 'Connected',    color: '#00C48C', bg: 'rgba(0,196,140,0.12)', dot: '#00C48C' },
  past_due:     { label: 'Past Due',     color: '#EF4444', bg: 'rgba(239,68,68,0.12)', dot: '#EF4444' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}
