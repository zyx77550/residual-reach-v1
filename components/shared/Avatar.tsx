const COLORS = [
  '#018AC9','#00C48C','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16',
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

interface Props {
  name: string
  size?: number
}

export function Avatar({ name, size = 36 }: Props) {
  const color = getColor(name)
  const initials = getInitials(name)
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{
        width:  size,
        height: size,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        color,
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  )
}
