"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Criar um novo cliente
export async function createClient(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    if (!name || !phone) {
        return { error: "Nome e Telefone são obrigatórios" };
    }

    try {
        // Double check manually (optional but good for custom messages)
        const existing = await prisma.client.findUnique({ where: { phone } });
        if (existing) {
            return { error: "Este número de telefone já está cadastrado." };
        }

        await prisma.client.create({
            data: { name, phone },
        });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Este número de telefone já está cadastrado." };
        }
        console.error("Create Client Error:", error);
        return { error: "Erro ao criar cliente. Tente novamente." };
    }

    revalidatePath("/dashboard/clients");
    redirect("/dashboard/clients");
}

// Listar todos os clientes
export async function getClients() {
    const clients = await prisma.client.findMany({
        orderBy: {
            name: "asc",
        },
    });
    return clients;
}
