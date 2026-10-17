import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Advisory } from '../lib/types'

export function useAdvisories({ includeInactive = false }: { includeInactive?: boolean } = {}) {
  const [advisories, setAdvisories] = useState<Advisory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    let q = supabase.from('advisories').select('*').order('created_at', { ascending: false }).limit(100)
    if (!includeInactive) q = q.eq('is_active', true)
    const { data, error: err } = await q
    if (err) setError(err.message)
    else {
      setError(null)
      setAdvisories((data as Advisory[]) ?? [])
    }
    setLoading(false)
  }, [includeInactive])

  useEffect(() => {
    void load()
  }, [load])

  return { advisories, loading, error, reload: load }
}
