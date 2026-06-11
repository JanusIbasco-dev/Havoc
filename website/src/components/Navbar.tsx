"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Leaderboard", href: "/leaderboard", activePath: "/leaderboard" },
  { label: "Players", href: "/players", activePath: "/players" },
  { label: "Seasons", href: "/seasons", activePath: "/seasons" },
  { label: "Rules", href: "/#rules", activePath: "/rules", danger: true }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav-underline-group hidden min-w-0 flex-1 items-center justify-end gap-5 text-sm font-black uppercase tracking-[0.18em] text-purple-100/70 lg:flex">
      {navItems.map((item) => {
        const active = isActive(pathname, item.activePath);
        return (
          <Link
            key={item.label}
            className={[
              "nav-underline-link pb-1 transition hover:text-white",
              active ? "nav-underline-active text-white" : "",
              item.danger ? "nav-underline-danger" : ""
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
