import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Havoc SMP Leaderboard",
  description: "PvP leaderboard for Havoc SMP.",
  icons: {
    icon: "/webicon.png",
    shortcut: "/webicon.png",
    apple: "/webicon.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="fixed inset-x-0 top-0 z-50 border-b border-purple-500/10 bg-[#08080a]/86 backdrop-blur-md md:bg-[#08080a]/70">
          <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 md:h-auto md:px-5 md:py-3">
            <Link href="/" aria-label="Seasons" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-purple-500/[0.03] shadow-[0_0_30px_rgba(139,92,246,0.18)] md:h-[74px] md:w-[74px]">
              <Image src="/HavocLogo.png" alt="Havoc logo" width={74} height={74} className="h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(139,92,246,0.32)] md:h-[74px] md:w-[74px]" priority />
            </Link>
            <details className="mobile-menu-wrapper">
              <summary aria-label="Toggle navigation menu" className="mobile-menu-button grid h-11 w-11 cursor-pointer list-none place-items-center border border-purple-300/32 bg-black/68 text-purple-100 shadow-[0_0_20px_rgba(139,92,246,0.22)] backdrop-blur transition hover:border-purple-200/70 hover:text-white [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              </summary>
              <div className="fixed left-0 top-[72px] z-[80] w-full border-t border-purple-500/20 bg-black/95 px-4 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.56)] backdrop-blur-xl">
                <nav className="mx-auto grid max-w-7xl gap-1 text-sm font-black uppercase tracking-[0.14em] text-purple-100/78">
                  <Link className="block w-full px-1 py-3 transition hover:text-white" href="/leaderboard">Leaderboard</Link>
                  <Link className="block w-full px-1 py-3 transition hover:text-white" href="/players">Players</Link>
                  <Link className="block w-full px-1 py-3 transition hover:text-white" href="/seasons">Seasons</Link>
                </nav>
              </div>
            </details>
            <Navbar />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
