// @ts-ignore
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

export const ADMIN_EMAIL = "eric.adm@agendador.com";

export async function getAdminUser() {
    const user = await prisma.user.findFirst({
        where: { email: ADMIN_EMAIL },
    });

    if (user) {
        return user;
    }

    // Secure fallback: Generate random password if env not set
    const rawPassword = process.env.DEFAULT_ADMIN_PASSWORD || randomBytes(16).toString('hex');

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    console.log(`[Seed] Creating admin user: ${ADMIN_EMAIL}`);
    if (!process.env.DEFAULT_ADMIN_PASSWORD) {
        console.warn(`[Seed] WARNING: DEFAULT_ADMIN_PASSWORD not set. Generated secure password: ${rawPassword}`);
    }

    // Create if not exists
    return await prisma.user.create({
        data: {
            name: "Eric Adm",
            email: ADMIN_EMAIL,
            password: hashedPassword,
        },
    });
}
