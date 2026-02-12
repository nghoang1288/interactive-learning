"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    Video,
    CheckCircle2,
    AlertCircle,
    X,
    FileVideo,
    ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 500 * 1024 * 1024) {
                setError("File quá lớn. Giới hạn là 500MB.");
                return;
            }
            setFile(selectedFile);
            setError(null);
            if (!title) setTitle(selectedFile.name.split(".")[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        setIsUploading(true);
        setProgress(10);

        setIsUploading(true);
        setProgress(10);

        // Raw Binary Upload Strategy
        // We pass metadata in headers to allow direct stream piping on server

        try {
            const simulateProgress = setInterval(() => {
                setProgress((prev) => (prev < 90 ? prev + 5 : prev));
            }, 500);

            // Encode metadata to base64 to avoid encoding issues in headers
            const safeTitle = Buffer.from(title, 'utf-8').toString('base64');
            const safeDesc = Buffer.from(description || "", 'utf-8').toString('base64');
            const safeName = Buffer.from(file.name, 'utf-8').toString('base64');

            const res = await fetch("/api/videos/upload", {
                method: "POST",
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                    "X-Upload-Title": safeTitle,
                    "X-Upload-Desc": safeDesc,
                    "X-Upload-Filename": safeName,
                },
                body: file, // Send raw file
            });

            clearInterval(simulateProgress);
            setProgress(100);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload thất bại");
            }

            const { video } = await res.json();
            router.push(`/dashboard/lessons/${video.id}`);
        } catch (err: any) {
            setError(err.message);
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                    <Link href="/dashboard">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Upload Bài giảng</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                            <CardTitle>Thông tin video</CardTitle>
                            <CardDescription className="dark:text-slate-400">Nhập tiêu đề và mô tả để mọi người dễ dàng tìm thấy bài giảng của bạn.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpload}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Tiêu đề bài giảng *</label>
                                    <Input
                                        placeholder="VD: Hướng dẫn đọc X-Quang ngực cơ bản"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả chi tiết</label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        placeholder="Người học sẽ biết thêm gì từ video này?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="pt-4">
                                    <label className="text-sm font-semibold text-slate-700">File Video *</label>
                                    <div className={cn(
                                        "mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 transition-all hover:bg-slate-50",
                                        file && "border-teal-200 bg-teal-50/20"
                                    )}>
                                        {!file ? (
                                            <div className="text-center relative">
                                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="mt-4 flex flex-col gap-1">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Click để upload hoặc kéo thả</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">MP4, WebM hoặc MOV (Tối đa 500MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="absolute inset-0 cursor-pointer opacity-0"
                                                    onChange={handleFileChange}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600 text-white shadow-lg shadow-teal-100">
                                                        <FileVideo size={24} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                                        <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setFile(null)}
                                                    className="text-slate-400 hover:text-red-500"
                                                >
                                                    <X size={20} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-red-700">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="border-t border-slate-100 bg-slate-50/30 px-6 py-4">
                                <div className="flex w-full flex-col gap-4">
                                    {isUploading && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-semibold text-slate-600">
                                                <span>Đang tải lên...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full bg-teal-600 transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-3">
                                        <Button asChild variant="ghost" disabled={isUploading}>
                                            <Link href="/dashboard">Hủy</Link>
                                        </Button>
                                        <Button
                                            disabled={!file || !title || isUploading}
                                            isLoading={isUploading}
                                            className="min-w-[140px] bg-teal-600 hover:bg-teal-700"
                                        >
                                            Bắt đầu upload
                                        </Button>
                                    </div>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Mẹo nhỏ 💡</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                    <span className="text-sm font-bold">1</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Sử dụng tiêu đề rõ ràng để mọi người dễ dàng tìm thấy bài giảng.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                    <span className="text-sm font-bold">2</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Sau khi upload, bạn có thể thêm các câu hỏi trắc nghiệm (Quiz) tại bất kỳ mốc thời gian nào.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <span className="text-sm font-bold">3</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Video có Quiz giúp người xem tập trung hơn gấp 3 lần!
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="rounded-2xl bg-teal-50 p-6 border border-teal-100 dark:bg-teal-900/10 dark:border-teal-900/30">
                        <h4 className="font-bold text-teal-900 flex items-center gap-2">
                            <CheckCircle2 size={18} /> Định dạng hỗ trợ
                        </h4>
                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center gap-2 text-xs text-teal-700">
                                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> MP4 là định dạng tốt nhất
                            </li>
                            <li className="flex items-center gap-2 text-xs text-teal-700">
                                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Tỷ lệ khung hình 16:9
                            </li>
                            <li className="flex items-center gap-2 text-xs text-teal-700">
                                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Độ phân giải HD (720p/1080p)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
