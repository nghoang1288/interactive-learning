import type { NextAuthConfig } from "next-auth";

// This config is Edge-compatible (no Prisma imports)
// Used by middleware for route protection
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            // Public routes
            const publicRoutes = ["/", "/login", "/register"];
            if (publicRoutes.includes(pathname)) {
                // Redirect logged-in users away from auth pages
                if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // API routes - let them handle their own auth
            if (pathname.startsWith("/api")) {
                return true;
            }

            // Protected routes - must be logged in
            if (!isLoggedIn) {
                return false; // Redirects to signIn page
            }

            // Admin routes protection
            if (pathname.startsWith("/admin")) {
                if (auth?.user?.role !== "ADMIN") {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    providers: [], // Providers added in auth.ts
};
