"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Briefcase } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/schedule", label: "Agenda", icon: Calendar },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/services", label: "Serviços", icon: Briefcase },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white pb-safe pt-2 md:hidden">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-rose-600"
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <item.icon className={clsx("mb-1 h-6 w-6", isActive && "fill-current")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
