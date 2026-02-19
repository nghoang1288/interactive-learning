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

        <aside className="relative hidden w-72 flex-col bg-white border-r-2 border-slate-900 lg:flex shrink-0 transition-all duration-300">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col gap-6">
                    {/* Section label */}
                    <div className="px-4 pt-2">
                        <div className="inline-block px-3 py-1 bg-accent-pink border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_0px_#0f172a]">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
                                Main Menu
                            </p>
                        </div>
                    </div>

                    {/* Nav items */}
                    <div className="flex flex-col gap-2">
                        {items.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-4 rounded-xl px-5 py-3 text-base font-bold transition-all duration-200 border-2 border-transparent",
                                        isActive
                                            ? "bg-accent-cyan text-slate-900 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] translate-x-1"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-900 hover:shadow-[2px_2px_0px_0px_#0f172a]"
                                    )}
                                >
                                    <div className={cn(
                                        "p-1.5 rounded-lg border-2 border-slate-900 transition-colors",
                                        isActive ? "bg-white" : "bg-slate-100 group-hover:bg-white"
                                    )}>
                                        <item.icon
                                            size={18}
                                            className="text-slate-900"
                                        />
                                    </div>
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom card */}
            <div className="absolute bottom-6 left-4 right-4">
                <div className="neo-card bg-accent-green p-4 overflow-hidden relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-white p-1 rounded-md border-2 border-slate-900">
                            <Stethoscope size={16} className="text-slate-900" />
                        </div>
                        <p className="text-xs font-bold text-slate-900">Doctor Platform</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-2">Nền tảng học Y khoa</p>
                    <div className="h-2 w-full rounded-full bg-white border border-slate-900">
                        <div className="h-full w-2/3 rounded-full bg-slate-900" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
