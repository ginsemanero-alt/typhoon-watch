import { useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ImagePlus, Loader2, Send, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { REPORT_TYPES, SEVERITIES, SEVERITY_STYLE } from '../lib/constants'
import type { ReportType, Severity } from '../lib/types'
import LocationPicker from '../components/LocationPicker'
import type { LatLng } from '../components/LocationPicker'
import { FieldLabel, PageHeader, errorBox, inputClass, primaryBtn, textareaClass } from '../components/ui'

const MAX_PHOTO_MB = 5

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-3 text-xl font-black tracking-tight">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm text-white">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ReportPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [type, setType] = useState<ReportType>('typhoon_damage')
  const [severity, setSeverity] = useState<Severity>('moderate')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [barangay, setBarangay] = useState(profile?.barangay ?? '')
  const [position, setPosition] = useState<LatLng | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])

  const onPickPhoto = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`Photo is too large. Maximum is ${MAX_PHOTO_MB} MB.`)
      return
    }
    setError(null)
    setPhoto(file)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)

    if (!title.trim()) return setError('Please add a short title.')
    if (!position) return setError('Please set the location: use your GPS or tap the map.')

    setSubmitting(true)
    try {
      let photo_url: string | null = null
      if (photo) {
        const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${user.id}/${Date.now()}-${safeName}`
        const { error: upErr } = await supabase.storage
          .from('report-photos')
          .upload(path, photo, { contentType: photo.type, upsert: false })
        if (upErr) throw new Error(`Photo upload failed: ${upErr.message}`)
        photo_url = supabase.storage.from('report-photos').getPublicUrl(path).data.publicUrl
      }

      const { error: insErr } = await supabase.from('reports').insert({
        reporter_id: user.id,
        type,
        severity,
        title: title.trim(),
        description: description.trim(),
        barangay: barangay.trim(),
        lat: position.lat,
        lng: position.lng,
        photo_url,
      })
      if (insErr) throw new Error(insErr.message)

      navigate('/my-reports', { state: { submitted: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="New report"
        title="Report an incident"
        subtitle="Be as accurate as you can. A responder will review your report before it appears on the public map."
      />

      <form
        onSubmit={onSubmit}
        className="space-y-12 rounded-[3.5rem] bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-12"
      >
        {/* 1. What and how serious */}
        <Step n={1} title="What is happening?">
          <div>
            <FieldLabel>Incident type</FieldLabel>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {REPORT_TYPES.map((t) => {
                const Icon = t.icon
                const active = type === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setType(t.value)}
                    className={`flex min-h-14 items-center gap-3 rounded-[1.75rem] px-4 py-3 text-left text-sm font-black transition active:scale-95 ${
                      active
                        ? 'bg-ink text-white shadow-lg'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        active ? 'bg-sky-500 text-white' : 'bg-white text-sky-700'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="leading-tight">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <FieldLabel hint="Pick the closest match">How serious is it?</FieldLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SEVERITIES.map((s) => {
                const active = severity === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSeverity(s.value)}
                    className={`flex flex-col rounded-[2rem] px-5 py-4 text-left transition active:scale-95 ${
                      active
                        ? `${SEVERITY_STYLE[s.value]} shadow-lg ring-4 ring-ink/10 ring-offset-2`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-lg font-black">
                      <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />
                      {s.label}
                    </span>
                    <span className="mt-1 text-xs font-bold leading-snug opacity-80">{s.hint}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Step>

        {/* 2. Details */}
        <Step n={2} title="Describe it">
          <div>
            <FieldLabel>Short title</FieldLabel>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Waist-deep flood along the main road"
              maxLength={120}
              required
            />
          </div>

          <div>
            <FieldLabel hint="Optional">Details</FieldLabel>
            <textarea
              className={textareaClass}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How many people are affected? Is anyone hurt? What help is needed?"
            />
          </div>

          <div>
            <FieldLabel hint="Optional">Barangay / Purok</FieldLabel>
            <input
              className={inputClass}
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              placeholder="Your barangay"
            />
          </div>
        </Step>

        {/* 3. Location */}
        <Step n={3} title="Where is it?">
          <LocationPicker value={position} onChange={setPosition} />
        </Step>

        {/* 4. Photo */}
        <Step n={4} title="Add a photo">
          <div>
            <FieldLabel hint={`Optional · max ${MAX_PHOTO_MB} MB`}>Photo</FieldLabel>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
            {preview ? (
              <div className="relative overflow-hidden rounded-[2.5rem] ring-4 ring-white shadow-lg">
                <img src={preview} alt="Preview" className="h-64 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-ink/80 text-white backdrop-blur transition hover:bg-ink"
                  aria-label="Remove photo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group flex w-full flex-col items-center justify-center gap-3 rounded-[2.5rem] border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-sky-400 hover:bg-sky-50"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm ring-1 ring-black/5 transition group-hover:scale-105">
                  <ImagePlus className="h-7 w-7" />
                </span>
                <span className="font-black text-ink">Take or upload a photo</span>
                <span className="text-xs font-semibold text-slate-400">
                  A clear photo helps responders verify faster
                </span>
              </button>
            )}
          </div>
        </Step>

        {error && (
          <div role="alert" className={`${errorBox} flex items-start gap-3`}>
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className={`${primaryBtn} w-full py-4 text-lg`}>
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Sending report…
            </>
          ) : (
            <>
              <Send className="h-5 w-5" /> Submit report
            </>
          )}
        </button>
      </form>
    </div>
  )
}
