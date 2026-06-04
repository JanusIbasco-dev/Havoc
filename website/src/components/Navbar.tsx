"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Leaderboard", href: "/leaderboard", activePath: "/leaderboard" },
  { label: "Players", href: "/players", activePath: "/players" },
  { label: "Seasons", href: "/#seasons", activePath: "/seasons", hiddenOnMobile: true },
  { label: "Rules", href: "/#rules", activePath: "/rules", hiddenOnMobile: true, danger: true }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav-underline-group flex items-center gap-5 text-sm font-black uppercase tracking-[0.18em] text-purple-100/70">
      {navItems.map((item) => {
        const active = isActive(pathname, item.activePath);
        return (
          <Link
            key={item.label}
            className={[
              "nav-underline-link pb-1 transition hover:text-white",
              active ? "nav-underline-active text-white" : "",
              item.danger ? "nav-underline-danger" : "",
              item.hiddenOnMobile ? "hidden sm:inline-flex" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isActive(pathname: string, activePath: string) {
  if (activePath === "/players") {
    return pathname.startsWith("/players");
  }

  if (activePath === "/leaderboard") {
    return pathname === "/" || pathname.startsWith("/leaderboard");
  }

  return pathname.startsWith(activePath);
}
