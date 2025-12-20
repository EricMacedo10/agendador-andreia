import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/api/auth/signin",
    },
    providers: [
        // Added later in auth.ts
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            const isOnSettings = nextUrl.pathname.startsWith("/settings")

            // Proteger rotas do dashboard
            if (isOnDashboard || isOnSettings) {
                return isLoggedIn
            }

            return true
        },
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
    // Hardcoded secret to bypass Vercel Edge environment variable issues
    secret: "andreia-agendador-secret-key-2024-fixed",
    trustHost: true,
} satisfies NextAuthConfig
