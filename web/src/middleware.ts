// Explicitly empty middleware - no redirects, no auth checks
// This file must exist to prevent NextAuth from auto-generating middleware

export function middleware() {
    // Do nothing - allow all requests through
}

export const config = {
    matcher: []  // Empty matcher = never runs
}
