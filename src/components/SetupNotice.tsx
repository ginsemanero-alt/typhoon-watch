import { DatabaseZap } from 'lucide-react'

export default function SetupNotice() {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-[3.5rem] bg-ink p-10 text-white shadow-2xl sm:p-14">
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-950">
        <DatabaseZap className="h-4 w-4" /> Setup needed
      </span>
      <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Connect your Supabase project</h1>
      <p className="mt-4 font-semibold text-sky-100/80">
        TyphoonWatch can't find your Supabase credentials yet. Follow these steps, then restart the dev server.
      </p>
      <ol className="mt-8 space-y-4 font-semibold">
        {[
          'Create a project at supabase.com.',
          'Open SQL Editor and run the whole file supabase/schema.sql.',
          'Copy .env.example to .env and paste your Project URL and anon key (Project Settings → API).',
          'Run npm run dev again.',
        ].map((t, i) => (
          <li key={t} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 font-black">
              {i + 1}
            </span>
            <span className="pt-1">{t}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
