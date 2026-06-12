import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MotionReveal } from "@/components/MotionReveal";
import { getSeasonById, seasons } from "@/lib/season-hub";

type SeasonDetailsPageProps = {
  params: Promise<{ seasonId: string }>;
};

export function generateStaticParams() {
  return seasons.filter((season) => season.status !== "COMING SOON").map((season) => ({ seasonId: season.id }));
}

export default async function SeasonDetailsPage({ params }: SeasonDetailsPageProps) {
  const { seasonId } = await params;
  const season = getSeasonById(seasonId);

  if (!season || season.status === "COMING SOON") {
    notFound();
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-[76px] sm:px-5 md:pt-28">
      <div className="cinematic-overlay pointer-events-none fixed inset-0" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.035]" />
      <div className="ember-field pointer-events-none fixed inset-0 opacity-20" />
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#08080a] via-[#08080a]/70 to-transparent" />

      <main className="relative mx-auto w-full max-w-7xl space-y-8">
        <MotionReveal>
          <Link className="inline-flex min-h-11 items-center text-sm font-bold text-purple-200/70 transition hover:text-purple-100" href="/seasons">
            Back to Seasons
          </Link>
        </MotionReveal>

        <MotionReveal>
          <section className="grid items-center gap-7 py-3 lg:grid-cols-[auto_minmax(0,1fr)]">
            <div className="grid h-32 w-32 place-items-center rounded-2xl border border-purple-300/18 bg-black/42 shadow-[0_0_54px_rgba(139,92,246,0.24)] sm:h-52 sm:w-52 sm:rounded-3xl">
              <Image src={season.logo} alt={`${season.title} logo`} width={208} height={208} className="h-24 w-24 object-contain drop-shadow-[0_0_24px_rgba(168,85,247,0.38)] sm:h-44 sm:w-44" priority />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="blocky-title text-[clamp(2.35rem,11vw,3.65rem)] leading-[0.95] text-white md:text-[clamp(3.75rem,8vw,5.5rem)]">{season.heroTitle}</h1>
                <StatusBadge status={season.status} />
              </div>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-purple-50/82 sm:mt-5 sm:text-lg sm:leading-8 sm:text-purple-50/72">{season.description}</p>
            </div>
          </section>
        </MotionReveal>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <MotionReveal>
            <article className="glass-panel min-h-full rounded-xl p-5 shadow-[0_0_34px_rgba(139,92,246,0.14)] sm:rounded-3xl sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-red-300/72">Victory Path</p>
              <h2 className="blocky-title mt-2 text-3xl text-white sm:text-4xl">How to Become Champion</h2>
              <ul className="mt-6 space-y-3">
                {season.championSteps.map((step) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-purple-50/72 sm:text-base">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple-300 shadow-[0_0_14px_rgba(216,180,254,0.64)]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </article>
          </MotionReveal>

          <MotionReveal delay={0.08}>
            <article className="glass-panel neon-hover min-h-full rounded-xl p-5 shadow-[0_0_34px_rgba(139,92,246,0.14)] sm:rounded-3xl sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-purple-300/72">Season Rewards</p>
              <h2 className="blocky-title mt-2 text-3xl text-white sm:text-4xl">{season.rewardTitle}</h2>
              <p className="mt-6 text-sm leading-6 text-purple-50/72 sm:text-base sm:leading-7">{season.rewardDescription}</p>
              <div className="mt-7 border border-purple-400/18 bg-black/32 p-4 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-100/46">Champion Status</p>
                <p className="mt-2 text-xl font-black text-purple-100">Permanent Havoc Recognition</p>
              </div>
            </article>
          </MotionReveal>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.16)] sm:text-xs">
      {status}
    </span>
  );
}
