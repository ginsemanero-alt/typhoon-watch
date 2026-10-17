import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Report, ReportStatus } from '../lib/types'

interface Options {
  /** Only reports created by this user. */
  mineOf?: string
  /** Restrict to these statuses (e.g. the public map shows only verified ones). */
  statuses?: ReportStatus[]
  /** Re-fetch automatically when anything changes (Supabase Realtime). */
  live?: boolean
  enabled?: boolean
}

export function useReports({ mineOf, statuses, live = false, enabled = true }: Options = {}) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const statusKey = statuses?.join(',') ?? ''

  const load = useCallback(async () => {
    if (!enabled) return
    let q = supabase
      .from('reports')
      .select('*, profiles(full_name, phone)')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (mineOf) q = q.eq('reporter_id', mineOf)
    if (statusKey) q = q.in('status', statusKey.split(','))

    const { data, error: err } = await q
    if (err) setError(err.message)
    else {
      setError(null)
      setReports((data as Report[]) ?? [])
    }
    setLoading(false)
  }, [enabled, mineOf, statusKey])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!live || !enabled) return
    const channel = supabase
      .channel(`reports-live-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        void load()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [live, enabled, load])

  return { reports, loading, error, reload: load, setReports }
}
