import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { CheckCircle2, Clock, PlayCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface Props {
    params: Promise<{ videoId: string }>;
}

export default async function LessonAnalyticsPage(props: Props) {
    const params = await props.params; // Ensure `params` is awaited
    const { videoId } = params;

    const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
            _count: { select: { quizzes: true } }
        }
    });

    if (!video) {
        return <div>Video not found</div>;
    }

    // Fetch all users and their progress for this video
    const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
        include: {
            progress: {
                where: { videoId: videoId }
            },
            quizResults: {
                where: {
                    quiz: { videoId: videoId }
                }
            }
        }
    });

    const totalUsers = users.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    const userStats = users.map(user => {
        const prog = user.progress[0];
        const status = prog?.completed ? "completed" : prog ? "in-progress" : "not-started";

        if (status === "completed") completed++;
        else if (status === "in-progress") inProgress++;
        else notStarted++;

        return {
            ...user,
            status,
            progressPercent: (prog && video.duration) ? Math.round((prog.currentTime / video.duration) * 100) : 0,
            lastActivity: prog?.updatedAt,
            correctQuizzes: user.quizResults.filter(q => q.isCorrect).length
        };
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/content" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{video.title}</h1>
                    <div className="flex gap-4 text-slate-500 text-sm mt-1">
                        <span>⏱ {formatDuration(video.duration || 0)}</span>
                        <span>❓ {video._count.quizzes} câu hỏi</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2 text-emerald-700">
                        <CheckCircle2 size={24} />
                        <span className="font-semibold">Đã hoàn thành</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-900">{completed} <span className="text-sm font-normal text-emerald-600">/ {totalUsers}</span></div>
                    <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(completed / totalUsers) * 100}%` }} />
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2 text-amber-700">
                        <PlayCircle size={24} />
                        <span className="font-semibold">Đang học</span>
                    </div>
                    <div className="text-3xl font-bold text-amber-900">{inProgress}</div>
                    <p className="text-sm text-amber-600 mt-1">Chưa hoàn thành hết video</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <XCircle size={24} />
                        <span className="font-semibold">Chưa bắt đầu</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{notStarted}</div>
                    <p className="text-sm text-slate-500 mt-1">Người dùng chưa xem</p>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">
                    Chi tiết từng học viên
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Học viên</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Tiến độ</th>
                            <th className="px-6 py-4">Quiz đúng</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {userStats.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{user.name}</div>
                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.status === "completed" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                            <CheckCircle2 size={12} /> Hoàn thành
                                        </span>
                                    )}
                                    {user.status === "in-progress" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            <PlayCircle size={12} /> Đang học
                                        </span>
                                    )}
                                    {user.status === "not-started" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            <Clock size={12} /> Chưa xem
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${user.status === 'completed' ? 'bg-emerald-500' : 'bg-teal-500'}`}
                                                style={{ width: `${user.progressPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-8 text-right">{user.progressPercent}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <span className="font-medium">{user.correctQuizzes}</span>
                                    <span className="text-slate-400">/{video._count.quizzes}</span>
                                </td>
                            </tr>
                        ))}
                        {userStats.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    Chưa có dữ liệu học viên
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
