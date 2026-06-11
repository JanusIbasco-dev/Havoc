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
        <header className="fixed inset-x-0 top-0 z-50 border-b border-purple-500/10 bg-[#08080a]/84 backdrop-blur-md md:bg-[#08080a]/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 md:px-5 md:py-3">
            <Link href="/" aria-label="Seasons" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-purple-500/[0.03] shadow-[0_0_30px_rgba(139,92,246,0.18)] md:h-[74px] md:w-[74px]">
              <Image src="/HavocLogo.png" alt="Havoc logo" width={74} height={74} className="h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(139,92,246,0.32)] md:h-[74px] md:w-[74px]" priority />
            </Link>
            <nav className="mobile-header-nav grid grid-cols-2 gap-x-2 gap-y-1 text-left text-[0.58rem] font-black uppercase leading-none tracking-[0.06em] text-purple-100/78 min-[375px]:text-[0.64rem]">
              <Link className="min-h-8 px-1 py-2 transition hover:text-white" href="/leaderboard">Leaderboard</Link>
              <Link className="min-h-8 px-1 py-2 transition hover:text-white" href="/players">Players</Link>
              <Link className="min-h-8 px-1 py-2 transition hover:text-white" href="/seasons">Seasons</Link>
              <Link className="min-h-8 px-1 py-2 text-red-200 transition hover:text-white" href="/#rules">Rules</Link>
            </nav>
            <Navbar />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
