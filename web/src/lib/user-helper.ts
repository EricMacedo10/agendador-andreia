import prisma from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Gets the current authorized admin user from the session.
 * Throws an error if the user is not authenticated or not an admin.
 */
export async function getAuthorizedAdmin() {
    const session = await auth();
    
    if (!session?.user?.email) {
        throw new Error("Não autorizado: Sessão não encontrada");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
        throw new Error("Não autorizado: Permissões de administrador necessárias");
    }

    return user;
}

// Keep the old name as an alias for backward compatibility, but update logic
export const getAdminUser = getAuthorizedAdmin;
