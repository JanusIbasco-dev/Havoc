import Image from "next/image";
import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";
import { seasons } from "@/lib/season-hub";

export default function SeasonsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-20 sm:px-5 md:pt-28">
      <div className="cinematic-overlay pointer-events-none fixed inset-0" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.035]" />
      <div className="ember-field pointer-events-none fixed inset-0 opacity-20" />
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#08080a] via-[#08080a]/70 to-transparent" />

      <main className="relative mx-auto w-full max-w-7xl space-y-8">
        <MotionReveal>
          <section className="max-w-3xl py-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300 sm:text-sm sm:tracking-[0.28em]">SEASONS</p>
            <h1 className="blocky-title mt-3 text-[clamp(2.4rem,11vw,3.65rem)] leading-[0.95] text-white md:text-[clamp(3.5rem,8vw,5rem)]">
              Compete. Dominate.
              <br />
              Become Champion.
            </h1>
          </section>
        </MotionReveal>

        <section className="mx-auto grid w-full max-w-5xl gap-4">
          {seasons.map((season, index) => (
            <MotionReveal key={season.id} delay={index * 0.06}>
              <Link
                href={`/seasons/${season.id}`}
                className="glass-panel neon-hover group relative flex min-h-[150px] overflow-hidden rounded-xl border-purple-500/30 p-4 shadow-[0_0_30px_rgba(139,92,246,0.16)] hover:scale-[1.006] hover:border-purple-200/70 hover:shadow-[0_0_44px_rgba(139,92,246,0.3)] sm:min-h-[170px] sm:p-5"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent opacity-50 transition group-hover:opacity-100" />
                <div className="pointer-events-none absolute -left-16 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-purple-600/10 blur-3xl transition group-hover:bg-purple-500/16" />
                <div className="pointer-events-none absolute -right-20 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-red-600/7 blur-3xl" />
                <div className="relative flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <Image src={season.logo} alt={`${season.title} logo`} width={260} height={160} className="h-auto w-[132px] shrink-0 self-center object-contain drop-shadow-[0_0_24px_rgba(168,85,247,0.38)] transition duration-200 group-hover:scale-[1.025] sm:w-[220px] sm:self-auto" priority={index === 0} />

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="blocky-title text-3xl leading-none text-white sm:text-4xl">{season.title}</h2>
                      <StatusBadge status={season.status} />
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-purple-50/68 sm:text-base">{season.summary}</p>
                    <span className="mt-3 inline-flex min-h-10 w-full items-center justify-center border border-purple-300/35 bg-purple-600/78 px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_0_22px_rgba(139,92,246,0.22)] transition group-hover:border-purple-100/70 group-hover:bg-purple-500/86 sm:w-auto sm:self-start sm:text-sm sm:tracking-[0.16em]">
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
