"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGate({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user.role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [session, status, router]);

    if (status === "loading" || !session || session.user.role !== "ADMIN") {
        return <div className="p-8 flex justify-center">Loading...</div>;
    }

    return <>{children}</>;
}
