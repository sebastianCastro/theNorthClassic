"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>
      <div className="container-north flex h-16 items-center justify-between lg:h-20">
        <Link
          href="/"
          className="flex items-center gap-3 sm:gap-4"
          aria-label={`${SITE.name} — Inicio`}
        >
          <Image
            src="/the-north-logo.png"
            alt=""
            width={64}
            height={64}
            className="h-12 w-auto shrink-0 object-contain sm:h-14 lg:h-16"
            priority
          />
          <span className="heading-display hidden leading-none text-white sm:inline sm:text-xl lg:text-2xl">
            THE NORTH <span className="text-accent">CLASSIC</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 xl:flex"
          aria-label="Navegación principal"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors",
                pathname === item.href
                  ? "text-accent"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-white xl:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-surface xl:hidden"
          aria-label="Navegación móvil"
        >
          <ul className="container-north flex flex-col py-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block py-3 text-sm font-medium uppercase tracking-wider",
                    pathname === item.href ? "text-accent" : "text-gray-100"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
