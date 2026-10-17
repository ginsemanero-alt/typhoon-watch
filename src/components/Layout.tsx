import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Phone, Siren, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import SetupNotice from './SetupNotice'

const linkBase = 'rounded-full px-5 py-3 text-sm font-black transition lg:py-2.5'
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? 'bg-white text-ink' : 'text-white/80 hover:bg-white/10 hover:text-white'}`

export default function Layout() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const close = () => setOpen(false)

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={close}>
        Home
      </NavLink>
      <NavLink to="/map" className={linkClass} onClick={close}>
        Live Map
      </NavLink>
      <NavLink to="/advisories" className={linkClass} onClick={close}>
        Advisories
      </NavLink>
      {user && (
        <NavLink to="/my-reports" className={linkClass} onClick={close}>
          My Reports
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={linkClass} onClick={close}>
          Admin
        </NavLink>
      )}
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-white">
        <Phone className="h-3.5 w-3.5 shrink-0" />
        Life in danger? Call 911 first, then report here.
      </div>

      <header className="sticky top-0 z-[1000] px-3 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-ink px-4 py-3 shadow-xl shadow-ink/20 sm:px-6">
          <Link to="/" className="flex items-center gap-3" onClick={close}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white">
              <Siren className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight text-white">
              Typhoon<span className="text-sky-400">Watch</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">{links}</nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/report"
              className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-red-600/40 transition hover:bg-red-500 active:scale-95"
            >
              Report now
            </Link>
            {user ? (
              <button
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
                className="flex items-center gap-2 rounded-full border-2 border-white/20 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
                title="Sign out"
              >
                <span className="max-w-[8rem] truncate">{profile?.full_name || user.email}</span>
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-full border-2 border-white/20 px-5 py-2 text-sm font-black text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="mx-auto mt-2 max-w-7xl rounded-[2.5rem] bg-ink p-4 shadow-xl lg:hidden">
            <nav className="flex flex-col gap-1">{links}</nav>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                to="/report"
                onClick={close}
                className="rounded-full bg-red-600 px-6 py-3 text-center text-sm font-black text-white"
              >
                Report now
              </Link>
              {user ? (
                <button
                  onClick={async () => {
                    close()
                    await signOut()
                    navigate('/')
                  }}
                  className="rounded-full border-2 border-white/20 px-6 py-3 text-sm font-black text-white"
                >
                  Sign out ({profile?.full_name || user.email})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={close}
                  className="rounded-full border-2 border-white/20 px-6 py-3 text-center text-sm font-black text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-8 sm:px-6 sm:py-10">
        {isSupabaseConfigured ? <Outlet /> : <SetupNotice />}
      </main>

      <footer className="px-3 pb-6 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-white px-6 py-5 text-center text-xs font-bold leading-relaxed text-slate-500 shadow-sm ring-1 ring-black/5 sm:px-8">
          <span className="font-black text-ink">TyphoonWatch</span> · Community disaster and typhoon
          reporting · Reports are reviewed by local responders before they appear on the public map.
        </div>
      </footer>
    </div>
  )
}
