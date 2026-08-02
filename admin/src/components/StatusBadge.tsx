const TONES: Record<string, string> = {
  green: 'green',
  gray: 'gray',
  amber: 'amber',
  red: 'red',
  blue: 'blue',
}

export function StatusBadge({ label, tone }: { label: string; tone: keyof typeof TONES }) {
  return <span className={`badge ${TONES[tone]}`}>{label}</span>
}
