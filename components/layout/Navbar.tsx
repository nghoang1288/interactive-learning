"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LogOut, User, LayoutDashboard, Stethoscope } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Navbar() {
    const { data: session } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white shadow-sm flex justify-center transition-colors duration-300 dark:bg-slate-950 dark:border-slate-800">
            <div className="w-full max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-lg shadow-teal-200/50 dark:shadow-teal-900/20">
                            <Stethoscope className="text-white" size={22} />
                        </div>
                        <span className="hidden text-xl font-bold tracking-tight text-slate-900 sm:block dark:text-white">
                            Doctor <span className="text-teal-600 dark:text-teal-400">Learning</span>
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {session ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 transition-colors hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                                    <User size={18} />
                                </div>
                                <div className="hidden flex-col items-start sm:flex">
                                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{session.user?.name}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Thành viên</span>
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-20 dark:bg-slate-900 dark:border-slate-800">
                                        <div className="px-3 py-2 border-b border-slate-100 mb-1 dark:border-slate-800">
                                            <p className="text-sm font-medium text-slate-900 truncate dark:text-white">{session.user?.name}</p>
                                            <p className="text-xs text-slate-500 truncate dark:text-slate-400">{session.user?.email}</p>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={16} /> Dashboard
                                        </Link>
                                        <button
                                            onClick={() => { signOut({ callbackUrl: "/login" }); setIsDropdownOpen(false); }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm" className="dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"><Link href="/login">Đăng nhập</Link></Button>
                            <Button asChild variant="primary" size="sm"><Link href="/register">Tham gia miễn phí</Link></Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
