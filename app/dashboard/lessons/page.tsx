"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Video as VideoIcon,
    Clock,
    User,
    GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { cn, formatDuration, getYouTubeThumbnail } from "@/lib/utils";

interface Lesson {
    id: string;
    title: string;
    description: string;
    url: string;
    duration: number | null;
    videoType?: string;
    createdAt: string;
    author: {
        name: string;
    };
    _count: {
        quizzes: number;
    };
}

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchLessons() {
            try {
                const res = await fetch(`/api/lessons?search=${encodeURIComponent(searchTerm)}`);
                const data = await res.json();
                setLessons(data);
            } catch (error) {
                console.error("Failed to fetch lessons");
            } finally {
                setIsLoading(false);
            }
        }

        const timer = setTimeout(() => {
            fetchLessons();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Khám phá bài học</h1>
                    <p className="text-slate-600">Tìm kiếm và chọn bài giảng video có Quiz tương tác để bắt đầu học.</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Tìm theo tên bài học hoặc chủ đề..."
                        className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-12 rounded-xl px-6 gap-2 border-slate-200 hover:bg-slate-50">
                    <Filter size={18} /> Bộ lọc
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden animate-pulse">
                            <div className="aspect-video bg-slate-100" />
                            <CardHeader className="space-y-2">
                                <div className="h-4 w-2/3 bg-slate-100 rounded" />
                                <div className="h-3 w-full bg-slate-100 rounded" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : lessons.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-6">
                        <GraduationCap size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Không tìm thấy bài học nào</h3>
                    <p className="text-sm text-slate-500 max-w-xs text-center mt-2 px-6">
                        Thử tìm kiếm với một từ khóa khác hoặc quay lại sau nhé.
                    </p>
                    <Button onClick={() => setSearchTerm("")} variant="ghost" className="mt-4 text-teal-600">
                        Xem tất cả bài giảng
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {lessons.map((lesson) => (
                        <Link key={lesson.id} href={`/dashboard/lessons/${lesson.id}`} className="group">
                            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-teal-100/50 hover:-translate-y-1 group-hover:border-teal-100">
                                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                                    {lesson.videoType === "YOUTUBE" ? (
                                        <img
                                            src={getYouTubeThumbnail(lesson.url)}
                                            alt={lesson.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                                                <VideoIcon size={48} className="drop-shadow-lg" />
                                            </div>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
                                        {lesson.videoType === "YOUTUBE" && (
                                            <Badge className="bg-red-600 text-white border-0 px-2 py-0.5 font-bold text-[10px]">
                                                YouTube
                                            </Badge>
                                        )}
                                        {lesson.duration != null && (
                                            <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm px-2 py-0.5 font-bold">
                                                {formatDuration(lesson.duration)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <CardHeader className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-teal-50 text-teal-600 border-0">
                                            {lesson._count.quizzes} Quizzes
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">
                                        {lesson.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardFooter className="pt-0 flex flex-col items-start gap-4">
                                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                        {lesson.description || "Tìm hiểu thêm qua bài giảng video tương tác này."}
                                    </p>
                                    <div className="flex w-full items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 ring-1 ring-slate-200">
                                                <User size={14} />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700">{lesson.author?.name || "Ẩn danh"}</span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                            Xem ngay
                                        </span>
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
