"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Video,
    PlusCircle,
    GraduationCap,
    History,
    Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
    title: string;
    href: string;
    icon: React.ElementType;
}

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const items: SidebarItem[] = [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Video của tôi", href: "/dashboard/videos", icon: Video },
        { title: "Upload Video", href: "/dashboard/upload", icon: PlusCircle },
        { title: "Khám phá bài học", href: "/dashboard/lessons", icon: GraduationCap },
        { title: "Tiến trình học", href: "/dashboard/progress", icon: History },
        ...(session?.user?.role === "ADMIN" ? [{ title: "Admin Portal", href: "/admin", icon: Stethoscope }] : []),
    ];

    if (!session) return null;

    return (

        <aside className="relative hidden w-72 flex-col bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-900 lg:flex shrink-0 transition-all duration-300">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col gap-6">
                    {/* Section label */}
                    <p className="px-4 pt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Main Menu
                    </p>

                    {/* Nav items */}
                    <div className="flex flex-col gap-1">
                        {items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-4 rounded-xl px-5 py-4 text-base font-bold transition-all duration-200",
                                        isActive
                                            ? "bg-teal-900/50 text-teal-200 border-l-[4px] border-teal-400 shadow-md shadow-teal-900/20"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                                    )}
                                >
                                    <item.icon
                                        size={24}
                                        className={cn(
                                            "transition-colors",
                                            isActive ? "text-teal-400" : "text-slate-400 group-hover:text-white"
                                        )}
                                    />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom card */}
            <div className="absolute bottom-6 left-4 right-4">
                <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-4 text-white overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="flex items-center gap-2 mb-1">
                        <Stethoscope size={16} className="text-teal-200" />
                        <p className="text-xs font-medium text-teal-200">Doctor Platform</p>
                    </div>
                    <p className="text-sm font-bold">Nền tảng học Y khoa</p>
                    <div className="mt-3 flex h-1.5 w-full rounded-full bg-white/20">
                        <div className="h-full w-2/3 rounded-full bg-white" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
