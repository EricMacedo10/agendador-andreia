"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Briefcase, Settings, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { signOut } from "next-auth/react";

const navItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/dashboard/schedule", label: "Agenda", icon: Calendar },
    { href: "/dashboard/clients", label: "Clientes", icon: Users },
    { href: "/dashboard/services", label: "Serviços", icon: Briefcase },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-zinc-200 bg-white md:flex">
            <div className="flex h-16 items-center justify-center border-b border-zinc-200">
                <span className="text-xl font-bold text-rose-600">Agendador</span>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-rose-50 text-rose-700"
                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-zinc-200 p-4">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                >
                    <Settings className="h-5 w-5" />
                    Configurações
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </aside>
    );
}
