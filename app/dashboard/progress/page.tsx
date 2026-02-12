"use client";

import { useEffect, useState } from "react";
import { History, CheckCircle2, PlayCircle, ChevronRight, User, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";

interface Progress {
    id: string;
    videoId: string;
    currentTime: number;
    completed: boolean;
    updatedAt: string;
    video: { title: string; author: { name: string }; };
}

export default function ProgressPage() {
    const [progresses, setProgresses] = useState<Progress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProgress() {
            try {
                const res = await fetch("/api/progress");
                const data = await res.json();
                setProgresses(data || []);
            } catch { } finally { setIsLoading(false); }
        }
        fetchProgress();
    }, []);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 shadow-sm ring-1 ring-teal-200">
                    <History size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tiến trình học tập</h1>
                    <p className="text-slate-500 dark:text-slate-400">Xem lại các bài giảng bạn đã học và tiếp tục nơi bạn đã dừng.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                    </div>
                ) : progresses.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed border-2">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6"><PlayCircle size={40} /></div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chưa có lịch sử học tập</h3>
                        <p className="text-sm text-slate-500 max-w-xs mt-2 dark:text-slate-400">Hãy bắt đầu buổi học đầu tiên ngay hôm nay!</p>
                        <Button asChild className="mt-6 rounded-xl px-8 shadow-lg shadow-teal-100 bg-teal-600 hover:bg-teal-700">
                            <Link href="/dashboard/lessons">Khám phá bài học ngay</Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-1">
                        {progresses.map((item) => (
                            <Card key={item.id} className="group overflow-hidden hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50/50 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-6">
                                    <div className="relative aspect-video w-full sm:w-48 shrink-0 overflow-hidden rounded-xl bg-slate-900 shadow-inner group-hover:ring-2 group-hover:ring-teal-500/20 transition-all">
                                        <div className="absolute inset-0 flex items-center justify-center text-white/20 group-hover:text-white/80 transition-opacity"><PlayCircle size={32} /></div>
                                        {item.completed && (
                                            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                                <Badge className="bg-emerald-500 text-white border-white/20 font-bold px-3 py-1 shadow-lg">HOÀN THÀNH</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-tight dark:text-white dark:group-hover:text-teal-400">{item.video.title}</h3>
                                                <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                                    <span className="flex items-center gap-1.5"><User size={12} /> {item.video.author?.name || "Ẩn danh"}</span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="flex items-center gap-1.5"><Activity size={12} /> {formatDate(item.updatedAt)}</span>
                                                </div>
                                            </div>
                                            <Button asChild variant={item.completed ? "outline" : "primary"} className="rounded-xl px-5 h-11 shrink-0">
                                                <Link href={`/dashboard/lessons/${item.videoId}`}>
                                                    {item.completed ? "Học lại" : "Tiếp tục học"} <ChevronRight size={16} className="ml-1.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                                <span>Tiến trình</span>
                                                <span className={cn(item.completed ? "text-emerald-600" : "text-teal-600")}>{item.completed ? "100%" : "45%"}</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/50">
                                                <div className={cn("h-full transition-all duration-1000 ease-out shadow-sm", item.completed ? "bg-emerald-500" : "bg-teal-600")} style={{ width: item.completed ? "100%" : "45%" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
