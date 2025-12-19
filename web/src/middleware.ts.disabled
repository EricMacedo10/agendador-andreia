import { NextResponse } from "next/server"

// Temporary Simple Mode: Bypass Auth Middleware
// This keeps the app functional for internal use while eliminating Vercel 500 errors
export default function middleware(req: any) {
    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
