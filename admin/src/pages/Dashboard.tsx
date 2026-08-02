import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type Conversions = {
  bookings_by_status?: Record<string, number>
  contact_submissions?: number
  consultation_submissions?: number
}

function last30() {
  const to = new Date()
  const from = new Date(to.getTime() - 30 * 86_400_000)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { p_from: iso(from), p_to: iso(to) }
}

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-conversions'],
    queryFn: async () => {
      if (!supabase) return {} as Conversions
      const { data, error } = await supabase.rpc('analytics_conversions', last30())
      if (error) throw error
      return (data ?? {}) as Conversions
    },
  })

  const byStatus = data?.bookings_by_status ?? {}
  const pending = byStatus.pending ?? 0
  const confirmed = byStatus.confirmed ?? 0
  const cancelled = byStatus.cancelled ?? 0

  return (
    <div>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>Last 30 days.</p>
      </div>

      {error && <p className="login-err">Could not load — {(error as Error).message}</p>}

      <div className="stats">
        <div className="stat">
          <b>{isLoading ? '—' : pending}</b>
          <span>Pending bookings</span>
        </div>
        <div className="stat">
          <b>{isLoading ? '—' : confirmed}</b>
          <span>Confirmed bookings</span>
        </div>
        <div className="stat">
          <b>{isLoading ? '—' : cancelled}</b>
          <span>Cancelled</span>
        </div>
        <div className="stat">
          <b>{isLoading ? '—' : (data?.contact_submissions ?? 0)}</b>
          <span>Contact form submissions</span>
        </div>
        <div className="stat">
          <b>{isLoading ? '—' : (data?.consultation_submissions ?? 0)}</b>
          <span>Consultation requests</span>
        </div>
      </div>
    </div>
  )
}
