import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    FileVideo,
    Settings,
    LogOut,
    Shield
} from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-teal-500" />
                    <div>
                        <h1 className="font-bold text-lg">Admin</h1>
                        <p className="text-xs text-slate-400">Control Panel</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                    >
                        <LayoutDashboard size={20} />
                        <span>Tổng quan</span>
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                    >
                        <Users size={20} />
                        <span>Người dùng</span>
                    </Link>
                    <Link
                        href="/admin/content"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                    >
                        <FileVideo size={20} />
                        <span>Quản lý Nội dung</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
                        <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                            {session.user.name?.[0] || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                            <p className="text-xs truncate">Admin</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard"
                        className="mt-2 flex items-center gap-2 justify-center w-full px-4 py-2 border border-slate-700 rounded-lg text-xs hover:bg-slate-800 transition-colors"
                    >
                        <LogOut size={14} />
                        <span>Về Dashboard</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 md:hidden">
                    <div className="font-bold text-slate-900">Admin Panel</div>
                    {/* Mobile menu trigger could go here */}
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
