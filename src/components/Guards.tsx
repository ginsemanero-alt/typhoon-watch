import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function RequireAdmin() {
  const { user, profile, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  // The profile may still be loading right after sign-in.
  if (!profile) return <Spinner label="Loading your profile…" />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
