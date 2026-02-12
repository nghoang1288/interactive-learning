"use client";

import { useSession } from "next-auth/react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Public pages that don't need the dashboard layout
    const isPublicPage = ["/", "/login", "/register"].includes(pathname);

    if (isPublicPage || !session) {
        return (
            <div className="relative min-h-screen bg-white flex flex-col items-center">
                <Navbar />
                <main className="w-full flex-1 flex flex-col items-center">{children}</main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col bg-bg-gray overflow-hidden transition-colors duration-300">
            {/* Fixed Navbar */}
            <Navbar />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar (Fixed width, internal scroll if needed) */}
                <Sidebar />

                {/* Main Content (Scrollable) */}
                <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-8 lg:p-10 scroll-smooth">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Add some global styles for custom scrollbar in this layout context if needed,
// but usually sticking to browser defaults or simple Tailwind scrollbar plugin is best.
// For "Clean Medical", a thin slate-200 scrollbar is nice.
