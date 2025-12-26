import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

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

                // TEMPORARY: Plain-text comparison for testing
                // TODO: Implement edge-compatible password hashing (Web Crypto API)
                // bcryptjs is incompatible with Next.js 16.1.0 + Turbopack Edge Runtime
                if (user.password !== credentials.password) {
                    return null
                }

                return user
            },
        }),
    ],
})
