import { useState } from 'react'
import { useAvailability, type AvailabilityInput } from '@/hooks/useAvailability'
import { generateDaySlots } from '@/lib/slots'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function AddWindowModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (i: AvailabilityInput) => Promise<void> }) {
  const [weekday, setWeekday] = useState(1)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('12:00')
  const [minutes, setMinutes] = useState(60)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const preview = generateDaySlots(start, end, minutes)

  async function save() {
    setErr(null)
    if (end <= start) return setErr('End must be after start.')
    setBusy(true)
    try {
      await onSave({ weekday, start_time: start, end_time: end, slot_minutes: minutes })
      onClose()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add availability window"
      description="Visitors can book any free slot inside this window."
      footer={
        <>
          <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Add window'}</button>
        </>
      }
    >
      <div className="field">
        <label>Day of week</label>
        <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
          {WEEKDAYS.map((d, i) => (
            <option key={i} value={i}>{d}</option>
          ))}
        </select>
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Start</label>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="field">
          <label>End</label>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Slot length (minutes)</label>
        <input type="number" min={5} max={480} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
      </div>
      {err && <p className="login-err">{err}</p>}
      <div style={{ marginTop: '.8rem', fontSize: '.8rem', color: 'var(--ink-3)' }}>
        Preview — {preview.length} slot{preview.length === 1 ? '' : 's'}: {preview.length ? preview.join(', ') : 'none, widen the window'}
      </div>
    </Modal>
  )
}

export function Availability() {
  const { windows, isLoading, create, toggle, remove } = useAvailability()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <div className="page-head-row">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <h1>Availability</h1>
          <p>Weekly windows visitors can book inside.</p>
        </div>
        <button className="btn primary" onClick={() => setModalOpen(true)}>+ Add window</button>
      </div>

      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : windows.length === 0 ? (
        <div className="empty">No availability yet. Add a window so visitors can book.</div>
      ) : (
        WEEKDAYS.map((dayName, day) => {
          const dayWindows = windows.filter((w) => w.weekday === day)
          if (dayWindows.length === 0) return null
          return (
            <div key={day} className="day-group">
              <h3>{dayName}</h3>
              {dayWindows.map((w) => (
                <div key={w.id} className="window-row">
                  <div className="window-meta">
                    <b>{w.start_time.slice(0, 5)} – {w.end_time.slice(0, 5)}</b>
                    <span>{w.slot_minutes} min slots</span>
                    <StatusBadge label={w.active ? 'Active' : 'Off'} tone={w.active ? 'green' : 'gray'} />
                  </div>
                  <div className="row-actions">
                    <button className="btn small" onClick={() => toggle({ id: w.id, active: !w.active })}>
                      {w.active ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn small danger" onClick={() => remove(w.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )
        })
      )}

      <AddWindowModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={create} />
    </div>
  )
}
