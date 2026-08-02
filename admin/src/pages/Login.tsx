import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabaseConfigMessage } from '@/lib/supabase'

export function Login() {
  const { isAuthenticated, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (isAuthenticated) return <Navigate replace to="/" />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) setError(error)
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-mark">EXPERIUS</div>
        <p className="login-sub">Admin</p>
        {supabaseConfigMessage ? (
          <p className="login-err">{supabaseConfigMessage}</p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              {/* autocomplete so a password manager recognises this as a real
                  sign-in pair rather than an anonymous form. */}
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="login-err">{error}</p>}
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
      {/* A plain anchor, not a router Link — this leaves the admin SPA entirely
          (the router is mounted under basename="/admin"), so it has to be a
          real navigation. History-back is no use on a freshly opened tab. */}
      <a className="login-back" href="/">
        ← Back to experius.xyz
      </a>
    </div>
  )
}
