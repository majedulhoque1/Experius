import { useEffect, useState } from 'react'
import { useSettings } from '@/hooks/useSettings'

export function Settings() {
  const { settings, isLoading, update } = useSettings()
  const [timezone, setTimezone] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [savedAt, setSavedAt] = useState<'timezone' | 'phone' | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setTimezone(settings.timezone ?? 'UTC')
      setStaffPhone(settings.notify_staff_phone ?? '')
    }
  }, [isLoading, settings.timezone, settings.notify_staff_phone])

  async function saveTimezone() {
    await update({ key: 'timezone', value: timezone })
    setSavedAt('timezone')
    setTimeout(() => setSavedAt(null), 1500)
  }
  async function savePhone() {
    await update({ key: 'notify_staff_phone', value: staffPhone })
    setSavedAt('phone')
    setTimeout(() => setSavedAt(null), 1500)
  }

  return (
    <div>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Every booking RPC reads these at runtime.</p>
      </div>

      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : (
        <div style={{ maxWidth: '26rem' }}>
          <div className="field">
            <label>Timezone (IANA)</label>
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Dhaka" />
          </div>
          <button className="btn primary" onClick={saveTimezone} disabled={!timezone}>
            {savedAt === 'timezone' ? 'Saved' : 'Save timezone'}
          </button>

          <div className="field" style={{ marginTop: '1.5rem' }}>
            <label>Staff notification phone</label>
            <input value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} placeholder="Leave blank to disable" />
          </div>
          <button className="btn primary" onClick={savePhone}>
            {savedAt === 'phone' ? 'Saved' : 'Save phone'}
          </button>
        </div>
      )}
    </div>
  )
}
