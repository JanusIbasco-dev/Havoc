import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Havoc SMP Leaderboard",
  description: "PvP leaderboard for Havoc SMP."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="fixed inset-x-0 top-0 z-50 border-b border-purple-500/10 bg-[#08080a]/36 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
            <Link href="/" aria-label="Seasons" className="grid h-[74px] w-[74px] place-items-center rounded-full bg-purple-500/[0.03] shadow-[0_0_30px_rgba(139,92,246,0.18)]">
              <Image src="/HavocLogo.png" alt="Havoc logo" width={74} height={74} className="h-[74px] w-[74px] object-contain drop-shadow-[0_0_18px_rgba(139,92,246,0.32)]" priority />
            </Link>
            <nav className="flex items-center gap-5 text-sm font-black uppercase tracking-[0.18em] text-purple-100/70">
              <Link className="border-b-2 border-purple-400 pb-1 text-white transition hover:text-purple-200" href="/#leaderboard">
                Leaderboard
              </Link>
              <Link className="border-b-2 border-transparent pb-1 transition hover:border-purple-400 hover:text-white" href="/players">
                Players
              </Link>
              <Link className="hidden border-b-2 border-transparent pb-1 transition hover:border-purple-400 hover:text-white sm:inline-flex" href="/#seasons">
                Seasons
              </Link>
              <Link className="hidden border-b-2 border-transparent pb-1 transition hover:border-red-400 hover:text-white sm:inline-flex" href="/#rules">
                Rules
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
