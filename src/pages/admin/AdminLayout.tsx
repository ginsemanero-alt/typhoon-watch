import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, ClipboardList, Megaphone, ShieldCheck } from 'lucide-react'

const tab = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition active:scale-95 ${
    isActive ? 'bg-ink text-white shadow-lg' : 'bg-white text-slate-600 ring-1 ring-black/5 hover:bg-slate-100'
  }`

export default function AdminLayout() {
  return (
    <div>
      <div className="-mx-1 mb-8 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:mb-10">
        <span className="mr-1 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin
        </span>
        <NavLink to="/admin" end className={tab}>
          <BarChart3 className="h-4 w-4" /> Dashboard
        </NavLink>
        <NavLink to="/admin/reports" className={tab}>
          <ClipboardList className="h-4 w-4" /> Reports
        </NavLink>
        <NavLink to="/admin/advisories" className={tab}>
          <Megaphone className="h-4 w-4" /> Advisories
        </NavLink>
      </div>
      <Outlet />
    </div>
  )
}
