import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
    request: Request,
    { params }: { params: any }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { amount, paymentMethod, description } = body;

        if (!amount || Number(amount) <= 0) {
            return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update client balance
            const client = await tx.client.update({
                where: { id },
                data: {
                    balance: { increment: Number(amount) }
                }
            });

            // 2. Create wallet history record
            const history = await tx.walletHistory.create({
                data: {
                    clientId: id,
                    amount: Number(amount),
                    description: description || `Pagamento de dívida (${paymentMethod})`,
                }
            });

            return { client, history };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Failed to record debt payment:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao registrar pagamento" },
            { status: 500 }
        );
    }
}
