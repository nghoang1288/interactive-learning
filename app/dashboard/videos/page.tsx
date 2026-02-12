"use client";

import { useEffect, useState } from "react";
import {
    Video as VideoIcon,
    Search,
    Edit,
    Trash2,
    MessageSquare,
    Clock,
    Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Video {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    url: string;
    _count: {
        quizzes: number;
    };
}

export default function MyVideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchVideos();
    }, []);

    async function fetchVideos() {
        try {
            const res = await fetch("/api/videos");
            const data = await res.json();
            setVideos(data);
        } catch (error) {
            console.error("Failed to fetch videos");
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa video này? Tất cả quiz đi kèm cũng sẽ bị xóa.")) return;

        try {
            const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
            if (res.ok) {
                setVideos(videos.filter(v => v.id !== id));
            } else {
                alert("Lỗi khi xóa video");
            }
        } catch (error) {
            alert("Lỗi server");
        }
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Video của tôi</h1>
                        <p className="text-slate-500 dark:text-slate-400">Xem danh sách, chỉnh sửa hoặc thêm Quiz cho video bạn đã upload.</p>
                    </div>
                </div>
                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/dashboard/upload">
                        <Plus className="mr-2 h-4 w-4" /> Upload Video mới
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Tìm kiếm theo tiêu đề..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                        </div>
                    ) : filteredVideos.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 dark:bg-slate-900">
                                <VideoIcon size={32} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chưa có video nào</h3>
                            <p className="text-sm text-slate-500 max-w-xs mt-1 dark:text-slate-400">
                                Hãy upload video bài giảng đầu tiên để bắt đầu dạy học.
                            </p>
                            <Button asChild className="mt-4 bg-teal-600 hover:bg-teal-700" variant="outline">
                                <Link href="/dashboard/upload">Bắt đầu ngay</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                        <th className="px-6 py-4">Bài giảng</th>
                                        <th className="px-6 py-4">Ngày tạo</th>
                                        <th className="px-6 py-4">Quiz</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredVideos.map((video) => (
                                        <tr key={video.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                                                        <VideoIcon size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 line-clamp-1 dark:text-white">{video.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 dark:text-slate-400">{video.description || "Không có mô tả"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                    <Clock size={14} className="text-slate-400" /> {formatDate(video.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-teal-50 text-teal-700 hover:bg-teal-100">
                                                    <MessageSquare size={12} /> {video._count.quizzes} Quizzes
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button asChild variant="outline" size="sm" className="h-9 px-3">
                                                        <Link href={`/dashboard/lessons/${video.id}`}>
                                                            <Edit className="h-3.5 w-3.5 mr-1.5" /> Quản lý Quiz
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                        onClick={() => handleDelete(video.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
