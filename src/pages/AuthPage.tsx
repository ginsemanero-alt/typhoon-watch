import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { FieldLabel, inputClass, primaryBtn } from '../components/ui'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [barangay, setBarangay] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!loading && user) return <Navigate to={from} replace />

  const isRegister = mode === 'register'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)

    if (isRegister) {
      if (password.length < 6) {
        setBusy(false)
        return setError('Password must be at least 6 characters.')
      }
      const res = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        barangay: barangay.trim() || undefined,
      })
      setBusy(false)
      if (res.error) return setError(res.error)
      if (res.needsConfirmation) {
        return setNotice('Account created. Check your email and confirm your address, then sign in.')
      }
      navigate(from, { replace: true })
    } else {
      const res = await signIn(email.trim(), password)
      setBusy(false)
      if (res.error) return setError(res.error)
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[3.5rem] bg-white p-8 shadow-xl ring-1 ring-black/5 sm:p-12">
        <span className="inline-block rounded-full bg-sky-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-700">
          {isRegister ? 'Create account' : 'Welcome back'}
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          {isRegister ? 'Join TyphoonWatch' : 'Sign in'}
        </h1>
        <p className="mt-2 font-semibold text-slate-500">
          {isRegister
            ? 'An account lets responders contact you about your report.'
            : 'Sign in to report incidents and track their status.'}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {isRegister && (
            <>
              <div>
                <FieldLabel>Full name</FieldLabel>
                <input
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel hint="Optional">Mobile number</FieldLabel>
                  <input
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <FieldLabel hint="Optional">Barangay</FieldLabel>
                  <input className={inputClass} value={barangay} onChange={(e) => setBarangay(e.target.value)} />
                </div>
              </div>
            </>
          )}
          <div>
            <FieldLabel>Email</FieldLabel>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div className="rounded-[2rem] bg-rose-50 px-6 py-4 font-bold text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-[2rem] bg-emerald-50 px-6 py-4 font-bold text-emerald-800 ring-1 ring-emerald-200">
              {notice}
            </div>
          )}

          <button type="submit" disabled={busy} className={`${primaryBtn} w-full py-4 text-lg`}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            {isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-7 text-center font-bold text-slate-500">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <Link
            to={isRegister ? '/login' : '/register'}
            state={location.state}
            className="font-black text-sky-700 hover:underline"
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </div>
  )
}
