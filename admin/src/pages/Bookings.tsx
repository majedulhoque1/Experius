import { useState } from 'react'
import { useBookings, type BookingRow, type BookingStatus } from '@/hooks/useBookings'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'

const TONE: Record<BookingStatus, 'amber' | 'green' | 'red'> = {
  pending: 'amber',
  confirmed: 'green',
  cancelled: 'red',
}

function RescheduleModal({
  booking,
  onClose,
  onSave,
}: {
  booking: BookingRow | null
  onClose: () => void
  onSave: (args: { id: string; date: string; time: string }) => Promise<{ status: string }>
}) {
  const [date, setDate] = useState(booking?.date ?? '')
  const [time, setTime] = useState(booking?.time?.slice(0, 5) ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!booking) return null

  async function save() {
    setErr(null)
    setBusy(true)
    try {
      const result = await onSave({ id: booking!.id, date, time })
      if (result.status !== 'ok') {
        setErr(
          {
            forbidden: 'Not authorized.',
            not_found: 'Booking not found or already inactive.',
            invalid_slot: 'That slot is outside an active availability window, or in the past.',
            slot_taken: 'That slot is already booked.',
          }[result.status] ?? result.status,
        )
        return
      }
      onClose()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Reschedule"
      description={`Moving ${booking.contact?.name ?? 'this booking'}.`}
      footer={
        <>
          <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn primary" onClick={save} disabled={busy || !date || !time}>
            {busy ? 'Saving…' : 'Move booking'}
          </button>
        </>
      }
    >
      <div className="grid-2">
        <div className="field">
          <label>New date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>New time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      {err && <p className="login-err">{err}</p>}
    </Modal>
  )
}

export function Bookings() {
  const { bookings, isLoading, setStatus, reschedule } = useBookings()
  const [rescheduling, setRescheduling] = useState<BookingRow | null>(null)

  const byDate = new Map<string, BookingRow[]>()
  for (const b of bookings) {
    if (!byDate.has(b.date)) byDate.set(b.date, [])
    byDate.get(b.date)!.push(b)
  }

  return (
    <div>
      <div className="page-head">
        <h1>Bookings</h1>
        <p>Confirm, cancel, or move a request.</p>
      </div>

      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="empty">No bookings yet.</div>
      ) : (
        [...byDate.entries()].map(([date, rows]) => (
          <div key={date} className="day-group">
            <h3>{new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</h3>
            {rows.map((b) => (
              <div key={b.id} className="window-row">
                <div className="window-meta">
                  <b>{b.time.slice(0, 5)}</b>
                  <span>{b.contact?.name ?? 'Unknown'}</span>
                  {b.contact?.phone && <span>{b.contact.phone}</span>}
                  <StatusBadge label={b.status} tone={TONE[b.status]} />
                </div>
                <div className="row-actions">
                  {b.status === 'pending' && (
                    <button className="btn small" onClick={() => setStatus({ id: b.id, status: 'confirmed' })}>
                      Confirm
                    </button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button className="btn small danger" onClick={() => setStatus({ id: b.id, status: 'cancelled' })}>
                      Cancel
                    </button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button className="btn small" onClick={() => setRescheduling(b)}>Reschedule</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <RescheduleModal booking={rescheduling} onClose={() => setRescheduling(null)} onSave={reschedule} />
    </div>
  )
}
