import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                // PrismaPg adapter may not return enum fields properly
                // Use raw query fallback to ensure role is fetched
                let userRole = (user as Record<string, unknown>).role as string | undefined;

                if (!userRole) {
                    try {
                        const result = await prisma.$queryRawUnsafe<Array<{ role: string }>>(
                            'SELECT "role" FROM "User" WHERE "id" = $1',
                            user.id
                        );
                        userRole = result?.[0]?.role;
                    } catch {
                        // Silently fallback to USER role
                    }
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: userRole || "USER",
                };
            },
        }),
    ],
});
