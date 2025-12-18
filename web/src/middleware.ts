import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
    const isOnServices = req.nextUrl.pathname.startsWith("/services")
    const isOnClients = req.nextUrl.pathname.startsWith("/clients")

    if ((isOnDashboard || isOnServices || isOnClients) && !isLoggedIn) {
        return Response.redirect(new URL("/api/auth/signin", req.nextUrl))
    }

    // Protect Admin Routes
    if (req.nextUrl.pathname.startsWith("/dashboard/settings/users")) {
        // @ts-ignore
        if (req.auth?.user?.role !== "ADMIN") {
            return Response.redirect(new URL("/dashboard", req.nextUrl))
        }
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
