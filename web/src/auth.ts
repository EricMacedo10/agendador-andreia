import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

// @ts-ignore
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string,
                    },
                })

                if (!user) {
                    return null
                }

                const inputPassword = credentials.password as string;
                let isValid = false;
                let needsRehash = false;

                // 1. Tentar comparar como Hash (bcrypt)
                try {
                    isValid = await bcrypt.compare(inputPassword, user.password);
                } catch (error) {
                    // Se der erro (ex: senha no banco não é hash válido), assumimos que não é válido por enquanto
                    isValid = false;
                }

                // 2. Fallback: Se falhar o hash, tentar comparar como Texto Plano (Legado)
                if (!isValid) {
                    if (user.password === inputPassword) {
                        isValid = true;
                        needsRehash = true; // Precisa atualizar para hash
                    }
                }

                if (!isValid) {
                    return null
                }

                // 3. Rolling Migration: Se foi validado por texto plano, atualizar para hash agora
                if (needsRehash) {
                    const hashedPassword = await bcrypt.hash(inputPassword, 10);
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { password: hashedPassword }
                    });
                    console.log(`[Auth] Password migrated to hash for user ${user.email}`);
                }

                return user
            },
        }),
    ],
})
