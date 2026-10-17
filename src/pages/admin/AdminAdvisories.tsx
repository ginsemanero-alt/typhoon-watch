import { useState } from 'react'
import type { FormEvent } from 'react'
import { Archive, CloudLightning, Droplets, Loader2, Megaphone, Radio, RotateCcw, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdvisories } from '../../hooks/useAdvisories'
import { supabase } from '../../lib/supabase'
import { ADVISORY_KINDS } from '../../lib/constants'
import type { AdvisoryKind } from '../../lib/types'
import AdvisoryCard from '../../components/AdvisoryCard'
import { EmptyState, FieldLabel, PageHeader, Skeleton, errorBox, ghostBtn, inputClass, primaryBtn, textareaClass } from '../../components/ui'

const KIND_ICON = { typhoon: CloudLightning, flood: Droplets, general: Megaphone }

export default function AdminAdvisories() {
  const { user } = useAuth()
  const { advisories, loading, error, reload } = useAdvisories({ includeInactive: true })

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [kind, setKind] = useState<AdvisoryKind>('typhoon')
  const [signal, setSignal] = useState<number>(1)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const publish = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setFormError(null)
    setBusy(true)
    const { error: err } = await supabase.from('advisories').insert({
      title: title.trim(),
      body: body.trim(),
      kind,
      signal_level: kind === 'typhoon' ? signal : null,
      is_active: true,
      created_by: user.id,
    })
    setBusy(false)
    if (err) return setFormError(err.message)
    setTitle('')
    setBody('')
    void reload()
  }

  const toggle = async (id: string, is_active: boolean) => {
    const { error: err } = await supabase.from('advisories').update({ is_active }).eq('id', id)
    if (err) window.alert(err.message)
    else void reload()
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this advisory permanently?')) return
    const { error: err } = await supabase.from('advisories').delete().eq('id', id)
    if (err) window.alert(err.message)
    else void reload()
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Broadcast"
        title="Advisories"
        subtitle="Post typhoon wind signals, flood warnings and announcements. Active advisories appear on the home page."
      />

      <form onSubmit={publish} className="space-y-6 rounded-[3.5rem] bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-12">
        <div>
          <FieldLabel>Type</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {ADVISORY_KINDS.map((k) => {
              const Icon = KIND_ICON[k.value]
              return (
                <button
                  key={k.value}
                  type="button"
                  aria-pressed={kind === k.value}
                  onClick={() => setKind(k.value)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition active:scale-95 ${
                    kind === k.value ? 'bg-ink text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {k.label}
                </button>
              )
            })}
          </div>
        </div>

        {kind === 'typhoon' && (
          <div>
            <FieldLabel>Wind signal level</FieldLabel>
            <select
              className={inputClass}
              value={signal}
              onChange={(e) => setSignal(Number(e.target.value))}
            >
              <option value={0}>No signal</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  Wind Signal No. {n}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <FieldLabel>Headline</FieldLabel>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wind Signal No. 3 raised over the municipality"
            required
          />
        </div>

        <div>
          <FieldLabel hint="Optional">Message</FieldLabel>
          <textarea
            className={textareaClass}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Evacuation centers, class suspensions, what residents should do…"
          />
        </div>

        {formError && (
          <div role="alert" className={errorBox}>
            {formError}
          </div>
        )}

        <button type="submit" disabled={busy || !title.trim()} className={primaryBtn}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Megaphone className="h-5 w-5" />}
          Publish advisory
        </button>
      </form>

      {error && <div className={errorBox}>{error}</div>}

      {loading ? (
        <div className="space-y-5" role="status" aria-label="Loading">
          <Skeleton className="h-56 !rounded-[3.5rem]" />
          <Skeleton className="h-56 !rounded-[3.5rem]" />
        </div>
      ) : advisories.length === 0 ? (
        <EmptyState icon={Radio} title="No advisories yet" hint="Publish your first advisory above." />
      ) : (
        <div className="space-y-5">
          {advisories.map((a) => (
            <AdvisoryCard
              key={a.id}
              advisory={a}
              actions={
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggle(a.id, !a.is_active)}
                    className={`${ghostBtn} !border-transparent !bg-white/90 !px-5 !py-2 !text-sm`}
                  >
                    {a.is_active ? <Archive className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                    {a.is_active ? 'Archive' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className={`${ghostBtn} !border-transparent !bg-white/90 !px-5 !py-2 !text-sm !text-rose-600`}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
