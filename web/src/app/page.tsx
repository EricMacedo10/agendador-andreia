import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-900/20 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex flex-col items-center text-center gap-8 relative z-10 max-w-md">

        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl mb-4">
          <Sparkles className="w-8 h-8 text-rose-500" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          Agendador <span className="text-rose-500">Andreia</span>
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed">
          Gerencie seus clientes, serviços e agenda de forma simples e elegante, tudo em um só lugar.
        </p>

        <Link
          href="/dashboard"
          className="group flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-rose-900/20"
        >
          Entrar no Sistema
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

      </main>

      <footer className="absolute bottom-6 text-zinc-600 text-sm">
        © 2024 Agendador Andreia
      </footer>
    </div>
  );
}
