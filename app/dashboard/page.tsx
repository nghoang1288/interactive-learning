"use client";

import { useEffect, useState } from "react";
import {
    Video,
    Users,
    TrendingUp,
    PlusCircle,
    CheckCircle2,
    Activity,
    PlayCircle,
    BookOpen,
    Trophy,
    ArrowRight,
    Search,
    ChevronRight,
    Video as VideoIcon,
    GraduationCap,
    Stethoscope
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface Stats {
    totalVideos: number;
    totalLearners: number;
    completionRate: number;
    recentActivity: any[];
    dailyCompletions: any[];
}

interface Progress {
    videoId: string;
    currentTime: number;
    completed: boolean;
    video: {
        title: string;
        author: { name: string };
    };
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats | null>(null);
    const [progresses, setProgresses] = useState<Progress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const [statsRes, progressRes] = await Promise.all([
                    fetch("/api/teacher/stats/general"),
                    fetch("/api/progress"),
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
                if (progressRes.ok) {
                    const progressData = await progressRes.json();
                    setProgresses(progressData || []);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    const statsCards = [
        { title: "Video đã tạo", value: stats?.totalVideos || 0, icon: Video, color: "text-teal-600", bg: "bg-teal-50" },
        { title: "Người học", value: stats?.totalLearners || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Tỷ lệ hoàn thành", value: `${stats?.completionRate || 0}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Đang học", value: progresses.filter(p => !p.completed).length, icon: PlayCircle, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Xin chào, {session?.user?.name || "Bác sĩ"} 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Tổng quan hoạt động học tập và chia sẻ kiến thức của bạn.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline" className="rounded-xl border-slate-200">
                        <Link href="/dashboard/lessons">
                            <GraduationCap className="mr-2 h-4 w-4" /> Khám phá bài học
                        </Link>
                    </Button>
                    <Button asChild className="rounded-xl shadow-lg shadow-teal-100 bg-teal-600 hover:bg-teal-700">
                        <Link href="/dashboard/upload">
                            <PlusCircle className="mr-2 h-4 w-4" /> Upload Video
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                    <Card key={stat.title} className="hover:shadow-md transition-shadow border-slate-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</CardTitle>
                            <div className={cn("rounded-xl p-2.5", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* In-progress lessons */}
                <Card className="lg:col-span-2 shadow-sm border-slate-100">
                    <CardHeader className="border-b border-slate-50 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Đang học dở</CardTitle>
                                <CardDescription>Tiếp tục bài giảng bạn đang xem gần đây.</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/dashboard/progress">Xem tất cả</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {progresses.filter(p => !p.completed).length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                    <PlayCircle size={32} />
                                </div>
                                <p className="text-slate-500 font-medium">Bạn chưa có bài học nào đang dở.</p>
                                <Link href="/dashboard/lessons" className="mt-2 inline-block text-sm font-bold text-teal-600">
                                    Tìm bài giảng hay →
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {progresses.filter(p => !p.completed).slice(0, 3).map((item) => (
                                    <Link key={item.videoId} href={`/dashboard/lessons/${item.videoId}`} className="group flex items-center gap-4 p-5 transition-colors hover:bg-slate-50">
                                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-900 shadow-sm">
                                            <div className="absolute inset-0 flex items-center justify-center text-white/30 group-hover:text-white/80 transition-colors">
                                                <VideoIcon size={20} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate dark:text-white dark:group-hover:text-teal-400">
                                                {item.video.title}
                                            </h4>
                                            <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 dark:text-slate-300">
                                                {item.video.author?.name || "Ẩn danh"}
                                            </p>
                                        </div>
                                        <ArrowRight size={18} className="text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Daily challenge card */}
                    <Card className="border-0 bg-teal-600 text-white shadow-xl shadow-teal-100/50 overflow-hidden relative">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Stethoscope size={20} className="text-teal-200" />
                                Mục tiêu hôm nay
                            </CardTitle>
                            <CardDescription className="text-teal-100">Hoàn thành ít nhất 1 bài giảng để duy trì chuỗi học!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span>Tiến độ</span>
                                <span className="font-bold">{progresses?.filter(p => p.completed).length || 0} bài hoàn thành</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/20">
                                <div className="h-full rounded-full bg-white shadow-sm" style={{ width: `${Math.min(100, (progresses?.filter(p => p.completed).length || 0) * 50)}%` }} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="secondary" className="w-full bg-white text-teal-600 hover:bg-teal-50 border-0 font-bold">
                                <Link href="/dashboard/lessons">Bắt đầu học ngay</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Recent activity */}
                    <Card className="border-slate-100 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Hoạt động gần đây</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
                                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                        Chưa có hoạt động nào.
                                    </div>
                                ) : (
                                    stats.recentActivity.map((act: any) => (
                                        <div key={act.id} className="flex items-start gap-3 p-4">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    <span className="font-bold">{act.user?.name || "Người dùng"}</span>
                                                    {act.completed ? " đã hoàn thành " : " đang xem "}
                                                    <span className="text-teal-600 dark:text-teal-400">{act.video?.title}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-600 mt-1 uppercase font-semibold tracking-wider dark:text-slate-400">
                                                    {formatDate(act.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
