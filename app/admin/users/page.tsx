import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { progress: true, quizResults: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Quản lý Người dùng</h2>
                    <p className="text-slate-500">Danh sách tất cả thành viên trong hệ thống</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Tên / Email</th>
                            <th className="px-6 py-4">Vai trò</th>
                            <th className="px-6 py-4">Ngày tham gia</th>
                            <th className="px-6 py-4">Tiến độ học</th>
                            <th className="px-6 py-4">Quiz đã làm</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{user.name}</div>
                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-slate-100 text-slate-800"
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {format(user.createdAt, "dd/MM/yyyy", { locale: vi })}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {user._count.progress} bài học
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {user._count.quizResults} lượt
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
