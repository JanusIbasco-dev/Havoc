import Image from "next/image";
import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
import { seasons } from "@/lib/season-hub";

export default function SeasonsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-24 sm:px-5 sm:pt-28">
      <div className="cinematic-overlay pointer-events-none fixed inset-0" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.035]" />
      <div className="ember-field pointer-events-none fixed inset-0 opacity-20" />
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#08080a] via-[#08080a]/70 to-transparent" />

      <main className="relative mx-auto w-full max-w-7xl space-y-8">
        <MotionReveal>
          <section className="max-w-3xl py-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300 sm:text-sm sm:tracking-[0.28em]">SEASONS</p>
            <h1 className="blocky-title mt-3 text-[clamp(2.5rem,13vw,5rem)] leading-none text-white">Compete. Dominate. Become Champion.</h1>
          </section>
        </MotionReveal>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {seasons.map((season, index) => (
            <MotionReveal key={season.id} delay={index * 0.06}>
              <Link
                href={`/seasons/${season.id}`}
                className="glass-panel neon-hover group relative flex min-h-full overflow-hidden rounded-xl p-5 shadow-[0_0_34px_rgba(139,92,246,0.16)] hover:scale-[1.015] hover:border-purple-200/70 hover:shadow-[0_0_54px_rgba(139,92,246,0.34)] sm:rounded-3xl sm:p-6"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent opacity-50 transition group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-purple-500/12 blur-3xl transition group-hover:bg-purple-400/18" />
                <div className="relative flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start gap-4">
                    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-purple-300/18 bg-black/36 shadow-[0_0_34px_rgba(139,92,246,0.2)] sm:h-28 sm:w-28">
                      <Image src={season.logo} alt={`${season.title} logo`} width={112} height={112} className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.34)] sm:h-24 sm:w-24" priority={index === 0} />
                    </div>
                    <div className="min-w-0 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="blocky-title text-3xl leading-none text-white sm:text-4xl">{season.title}</h2>
                        <StatusBadge status={season.status} />
                      </div>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-purple-100/44">Official Havoc Season</p>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-[8] text-sm leading-6 text-purple-50/68 sm:text-base sm:leading-7">{season.description}</p>

                  <div className="mt-6 flex flex-1 items-end">
                    <span className="neon-hover inline-flex min-h-11 w-full items-center justify-center border border-purple-300/35 bg-purple-600/78 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_28px_rgba(139,92,246,0.28)] sm:w-auto sm:tracking-[0.16em]">
                      View Season
                    </span>
                  </div>
                </div>
              </Link>
            </MotionReveal>
          ))}
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
      {status}
    </span>
  );
}
