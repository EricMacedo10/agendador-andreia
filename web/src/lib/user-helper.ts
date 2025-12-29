import prisma from "@/lib/prisma";

export const ADMIN_EMAIL = "eric.adm@agendador.com";

export async function getAdminUser() {
    const user = await prisma.user.findFirst({
        where: { email: ADMIN_EMAIL },
    });

    if (user) {
        return user;
    }

    // Create if not exists
    return await prisma.user.create({
        data: {
            name: "Eric Adm",
            email: ADMIN_EMAIL,
            password: process.env.DEFAULT_ADMIN_PASSWORD || "adm123", // Default password, should be changed
        },
    });
}
