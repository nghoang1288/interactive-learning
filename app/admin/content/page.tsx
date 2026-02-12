import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import { Eye, CheckCircle2, MoreVertical, BarChart2 } from "lucide-react";

export default async function AdminContentPage() {
    const videos = await prisma.video.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: true,
            _count: {
                select: { progress: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Quản lý Nội dung</h2>
                    <p className="text-slate-500">Danh sách bài học và thống kê</p>
                </div>
                <Link
                    href="/dashboard/upload"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                    + Upload Video
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:border-teal-200 transition-all">
                        <div className="aspect-video bg-slate-100 relative">
                            <video
                                src={video.url}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Link
                                    href={`/admin/content/${video.id}`}
                                    className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                                >
                                    <BarChart2 size={16} />
                                    Xem Thống kê
                                </Link>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {formatDuration(video.duration || 0)}
                            </span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{video.title}</h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Upload bởi: {video.author.name}
                            </p>

                            <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-1">
                                    <Eye size={16} />
                                    <span>{video._count.progress} lượt học</span>
                                </div>
                                <Link
                                    href={`/admin/content/${video.id}`}
                                    className="text-teal-600 hover:text-teal-700 font-medium text-xs uppercase tracking-wider"
                                >
                                    Chi tiết
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
