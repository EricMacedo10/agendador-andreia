import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const session = await auth()

    // Rotas públicas (não requerem autenticação)
    const publicRoutes = ['/api/auth', '/book', '/api/setup-admin']
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    // Se é rota pública, permitir acesso
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Se não está autenticado e tentando acessar rota protegida
    if (!session && request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Se está autenticado e tentando acessar a home, redirecionar para dashboard
    if (session && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm)$).*)'],
}
