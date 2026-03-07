import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function NewCreditPage({ params }: { params: any }) {
    const { id: clientId } = await params;

    const client = await prisma.client.findUnique({
        where: { id: clientId }
    });

    if (!client) notFound();

    const services = await prisma.service.findMany({
        orderBy: { name: 'asc' }
    });

    async function addCredit(formData: FormData) {
        "use server";

        const serviceId = formData.get("serviceId") as string;
        const amountStr = formData.get("amount") as string;
        const amount = parseInt(amountStr, 10);
        const reason = formData.get("reason") as string || "Adicionado manualmente";

        if (!serviceId || !amount || amount <= 0) return;

        // Upsert the client credit
        await prisma.clientCredit.upsert({
            where: {
                clientId_serviceId: {
                    clientId,
                    serviceId
                }
            },
            update: {
                balance: { increment: amount }
            },
            create: {
                clientId,
                serviceId,
                balance: amount
            }
        });

        // Add to history
        await prisma.creditHistory.create({
            data: {
                clientId,
                serviceId,
                amount,
                reason
            }
        });

        revalidatePath(`/dashboard/clients/${clientId}`);
        redirect(`/dashboard/clients/${clientId}`);
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/clients/${clientId}`} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Adicionar Créditos</h1>
                    <p className="text-zinc-500 text-sm">Adicione um novo pacote para {client.name}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden p-6">
                <form action={addCredit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Serviço do Pacote</label>
                        <select
                            name="serviceId"
                            required
                            className="w-full border-zinc-300 rounded-lg shadow-sm focus:border-zinc-500 focus:ring-zinc-500 py-2 border px-3 bg-white text-zinc-900 h-10"
                        >
                            <option value="">Selecione um serviço</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Quantidade de Sessões</label>
                        <input
                            type="number"
                            name="amount"
                            min="1"
                            required
                            className="w-full border-zinc-300 rounded-lg shadow-sm focus:border-zinc-500 focus:ring-zinc-500 py-2 border px-3 text-zinc-900 h-10"
                            placeholder="Ex: 2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Motivo / Observação (Opcional)</label>
                        <input
                            type="text"
                            name="reason"
                            className="w-full border-zinc-300 rounded-lg shadow-sm focus:border-zinc-500 focus:ring-zinc-500 py-2 border px-3 text-zinc-900 h-10"
                            placeholder="Ex: Pagou pacote antecipado via PIX"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Link href={`/dashboard/clients/${clientId}`} className="flex-1 bg-white border border-zinc-300 text-zinc-700 py-2.5 rounded-lg font-medium text-center hover:bg-zinc-50 transition-colors">
                            Cancelar
                        </Link>
                        <button type="submit" className="flex-1 bg-zinc-900 text-white py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
                            Salvar Créditos
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
