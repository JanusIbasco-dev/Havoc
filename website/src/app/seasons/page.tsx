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
            <h1 className="blocky-title mt-3 text-[clamp(2.5rem,13vw,5rem)] leading-none text-white">
              Compete. Dominate.
              <br />
              Become Champion.
            </h1>
          </section>
        </MotionReveal>

        <section className="mx-auto grid w-full max-w-4xl gap-4">
          {seasons.map((season, index) => (
            <MotionReveal key={season.id} delay={index * 0.06}>
              <Link
                href={`/seasons/${season.id}`}
                className="glass-panel neon-hover group relative flex overflow-hidden rounded-xl p-4 shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:scale-[1.01] hover:border-purple-200/70 hover:shadow-[0_0_46px_rgba(139,92,246,0.32)] sm:rounded-2xl sm:p-5"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent opacity-50 transition group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-purple-500/12 blur-3xl transition group-hover:bg-purple-400/18" />
                <div className="relative flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
                  <div className="grid h-28 w-28 shrink-0 place-items-center rounded-xl border border-purple-300/18 bg-black/34 shadow-[0_0_34px_rgba(139,92,246,0.22)] sm:h-36 sm:w-36 sm:rounded-2xl">
                    <Image src={season.logo} alt={`${season.title} logo`} width={144} height={144} className="h-24 w-24 object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.38)] sm:h-32 sm:w-32" priority={index === 0} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="blocky-title text-3xl leading-none text-white sm:text-4xl">{season.title}</h2>
                    <div className="mt-2">
                      <StatusBadge status={season.status} />
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-50/68 sm:text-base sm:leading-7">{season.summary}</p>
                    <span className="mt-4 inline-flex min-h-10 items-center justify-center border border-purple-300/35 bg-purple-600/78 px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(139,92,246,0.24)] transition group-hover:border-purple-100/70 group-hover:bg-purple-500/86 sm:text-sm sm:tracking-[0.16em]">
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
