"use client";

import { createClient } from "@/app/actions/clients";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useActionState } from "react";

export default function NewClientPage() {
    const [state, action, isPending] = useActionState(createClient, null);

    return (
        <div className="space-y-6">
            {/* Header com Voltar */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/clients"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-bold text-zinc-900">Novo Cliente</h1>
            </div>

            <form action={action} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">

                {state?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        <p>{state.error}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-zinc-900">
                        Nome Completo
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        placeholder="Ex: Maria da Silva"
                        className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-black font-bold placeholder:text-zinc-400"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-zinc-900">
                        WhatsApp / Telefone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        placeholder="Ex: (11) 99999-9999"
                        className="w-full rounded-lg border border-zinc-300 p-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-black font-bold placeholder:text-zinc-400"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 py-4 font-bold text-white transition-colors hover:bg-rose-700 md:w-auto md:px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Salvando..." : (
                        <>
                            <Save className="h-5 w-5" />
                            Salvar Cliente
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
