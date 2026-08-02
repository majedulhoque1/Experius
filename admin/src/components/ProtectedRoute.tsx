import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin()

  if (isLoading || (isAuthenticated && roleLoading)) {
    return (
      <div className="screen-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate replace to="/login" />

  if (!isAdmin) {
    return (
      <div className="screen-center">
        <div className="notauth">
          <p className="notauth-title">Not authorized</p>
          <p className="notauth-body">This account isn't an admin yet.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
