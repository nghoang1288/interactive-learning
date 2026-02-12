import { prisma } from "@/lib/prisma";
import { Users, FileVideo, CheckCircle2, PlayCircle } from "lucide-react";

async function getStats() {
    const [userCount, videoCount, totalProgress, completedCount] = await Promise.all([
        prisma.user.count(),
        prisma.video.count(),
        prisma.progress.count(),
        prisma.progress.count({ where: { completed: true } }),
    ]);

    return {
        userCount,
        videoCount,
        totalProgress,
        completedCount,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h2>
                <p className="text-slate-500">Số liệu thống kê thời gian thực</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Tổng người dùng"
                    value={stats.userCount}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    label="Tổng video bài học"
                    value={stats.videoCount}
                    icon={FileVideo}
                    color="bg-purple-500"
                />
                <StatCard
                    label="Lượt học đang diễn ra"
                    value={stats.totalProgress}
                    icon={PlayCircle}
                    color="bg-amber-500"
                />
                <StatCard
                    label="Lượt hoàn thành"
                    value={stats.completedCount}
                    icon={CheckCircle2}
                    color="bg-emerald-500"
                />
            </div>

            {/* Recent Activity or Charts could go here */}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${color} text-white flex items-center justify-center shadow-lg shadow-opacity-20`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
            </div>
        </div>
    );
}
