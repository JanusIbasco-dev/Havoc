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
        <header className="fixed inset-x-0 top-0 z-50 border-b border-purple-500/10 bg-[#08080a]/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-5 sm:py-3">
            <Link href="/" aria-label="Seasons" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-purple-500/[0.03] shadow-[0_0_30px_rgba(139,92,246,0.18)] sm:h-[74px] sm:w-[74px]">
              <Image src="/HavocLogo.png" alt="Havoc logo" width={74} height={74} className="h-14 w-14 object-contain drop-shadow-[0_0_18px_rgba(139,92,246,0.32)] sm:h-[74px] sm:w-[74px]" priority />
            </Link>
            <Navbar />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
