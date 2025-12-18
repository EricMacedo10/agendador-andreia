import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
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

                // In a real app, hash and compare password. 
                // For this restart/dev phase, we'll accept the plain text match or a simple check.
                // TODO: Implement bcrypt
                if (user.password !== credentials.password) {
                    return null
                }

                return user
            },
        }),
    ],
    pages: {
        signIn: "/api/auth/signin", // Use default for now, can customize later
    },
    callbacks: {
        async session({ session, token }) {
            if (session?.user && token.sub) {
                session.user.id = token.sub;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        }
    },
    secret: process.env.AUTH_SECRET || "segredo-temporario-andreia-123", // Fallback for testing if env is missing
})

