"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Perform the actual sign out
        signOut({ redirect: false }).then(() => {
            // Wait 2 seconds then redirect to login
            setTimeout(() => {
                router.push("/api/auth/signin");
            }, 2000);
        });
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                        <LogOut className="w-10 h-10 text-rose-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                        Até logo! 👋
                    </h1>
                    <p className="text-zinc-600 text-lg">
                        Você saiu com sucesso do sistema.
                    </p>
                </div>

                <div className="bg-rose-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-zinc-700">
                        Redirecionando para a página de login...
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <Loader2 className="w-5 h-5 text-rose-600 animate-spin" />
                        <span className="text-xs text-zinc-500">Aguarde</span>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/api/auth/signin")}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                    Ir para Login Agora
                </button>
            </div>
        </div>
    );
}
