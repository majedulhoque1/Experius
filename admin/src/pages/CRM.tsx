import { useState } from 'react'
import { useContacts, type Contact } from '@/hooks/useContacts'

function NotesCell({ contact, onSave }: { contact: Contact; onSave: (notes: string) => Promise<void> }) {
  const [value, setValue] = useState(contact.notes ?? '')
  const [saving, setSaving] = useState(false)
  const dirty = value !== (contact.notes ?? '')

  async function save() {
    setSaving(true)
    try {
      await onSave(value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <textarea className="notes-area" value={value} onChange={(e) => setValue(e.target.value)} rows={2} />
      {dirty && (
        <button className="btn small" style={{ marginTop: '.35rem' }} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save note'}
        </button>
      )}
    </div>
  )
}

export function CRM() {
  const { contacts, isLoading, saveNotes } = useContacts()

  return (
    <div>
      <div className="page-head">
        <h1>CRM</h1>
        <p>Contacts, deduped by phone.</p>
      </div>

      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : contacts.length === 0 ? (
        <div className="empty">No contacts yet — they're created automatically when a booking comes in, or promoted from Submissions.</div>
      ) : (
        <div className="table-scroll">
          <table className="kit-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td data-label="Name">
                    <b>{c.name}</b>
                  </td>
                  <td data-label="Phone">{c.phone ?? '—'}</td>
                  <td data-label="Email">{c.email ?? '—'}</td>
                  <td data-label="Branch">{c.branch ?? '—'}</td>
                  <td data-label="Notes" style={{ minWidth: '16rem' }}>
                    <NotesCell contact={c} onSave={(notes) => saveNotes({ id: c.id, notes })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
