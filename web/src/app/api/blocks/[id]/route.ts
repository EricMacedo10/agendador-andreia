import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Helper function to get user ID from session
async function getUserIdFromEmail(email: string | null | undefined): Promise<string> {
    if (!email) {
        throw new Error("Email not found in session");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user.id;
}

// DELETE /api/blocks/[id] - Delete a block
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        const userId = await getUserIdFromEmail(session.user.email);

        // Check that block exists and belongs to user
        const block = await prisma.dayBlock.findUnique({
            where: { id: params.id }
        });

        if (!block) {
            return NextResponse.json(
                { error: "Bloqueio não encontrado" },
                { status: 404 }
            );
        }

        if (block.createdBy !== userId) {
            return NextResponse.json(
                { error: "Você não tem permissão para deletar este bloqueio" },
                { status: 403 }
            );
        }

        // Delete block
        await prisma.dayBlock.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to delete block:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao deletar bloqueio" },
            { status: 500 }
        );
    }
}
