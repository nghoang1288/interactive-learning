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
    ArrowLeft,
    Youtube,
    Link2,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { cn, extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils";

type UploadMode = "file" | "youtube";

export default function UploadPage() {
    const router = useRouter();
    const [mode, setMode] = useState<UploadMode>("youtube");

    // Shared state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    // File upload state
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // YouTube state
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubePreview, setYoutubePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleYoutubeUrlChange = (url: string) => {
        setYoutubeUrl(url);
        setError(null);
        const videoId = extractYouTubeId(url);
        if (videoId) {
            setYoutubePreview(getYouTubeThumbnail(videoId));
        } else {
            setYoutubePreview(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        setIsUploading(true);
        setProgress(0);

        try {
            // 1. Get Presigned URL
            const initRes = await fetch("/api/videos/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    size: file.size
                })
            });

            if (!initRes.ok) {
                const errorData = await initRes.json();
                throw new Error(errorData.error || "Không thể khởi tạo upload");
            }

            const { uploadUrl, publicUrl, storage } = await initRes.json();

            // 2. Upload File to R2 (Directly) using XHR for progress
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", uploadUrl);
                xhr.setRequestHeader("Content-Type", file.type);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        setProgress(Math.round(percentComplete));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error("Upload failed"));
                    }
                };

                xhr.onerror = () => reject(new Error("Network Error"));
                xhr.send(file);
            });

            // 3. Save Metadata
            const completeRes = await fetch("/api/videos/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    filename: file.name,
                    publicUrl,
                    size: file.size,
                    storage
                })
            });

            if (!completeRes.ok) throw new Error("Lỗi lưu thông tin video");

            const { video } = await completeRes.json();
            router.push(`/dashboard/lessons/${video.id}`);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Upload thất bại. Nếu file lớn hãy thử lại hoặc dùng YouTube.");
            setIsUploading(false);
            setProgress(0);
        }
    };

    const handleYoutubeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!youtubeUrl || !title) return;

        const videoId = extractYouTubeId(youtubeUrl);
        if (!videoId) {
            setError("URL YouTube không hợp lệ. Vui lòng nhập đúng link YouTube.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/videos/youtube", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: youtubeUrl, title, description }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Lưu thất bại");
            }

            const { video } = await res.json();
            router.push(`/dashboard/lessons/${video.id}`);
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Thêm Bài giảng</h1>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 bg-slate-200 rounded-xl w-fit">
                <button
                    onClick={() => { setMode("youtube"); setError(null); }}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                        mode === "youtube"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                    )}
                >
                    <Youtube size={18} /> YouTube Link
                </button>
                <button
                    onClick={() => { setMode("file"); setError(null); }}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                        mode === "file"
                            ? "bg-white text-teal-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                    )}
                >
                    <Upload size={18} /> Upload File
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-slate-900">{mode === "youtube" ? "Thêm video từ YouTube" : "Upload video"}</CardTitle>
                            <CardDescription>
                                {mode === "youtube"
                                    ? "Dán link YouTube để tạo bài giảng — không cần upload file."
                                    : "Nhập tiêu đề và mô tả để mọi người dễ dàng tìm thấy bài giảng của bạn."}
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={mode === "youtube" ? handleYoutubeSubmit : handleUpload}>
                            <CardContent className="space-y-4 pt-6">
                                {/* YouTube URL field */}
                                {mode === "youtube" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Link YouTube *</label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <Input
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                value={youtubeUrl}
                                                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                        {/* YouTube Preview */}
                                        {youtubePreview && (
                                            <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200">
                                                <img
                                                    src={youtubePreview}
                                                    alt="YouTube preview"
                                                    className="w-full aspect-video object-cover"
                                                    onError={() => setYoutubePreview(null)}
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
                                                        <Youtube size={14} /> YouTube
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                    <label className="text-sm font-semibold text-slate-700">Mô tả chi tiết</label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 transition-all"
                                        placeholder="Người học sẽ biết thêm gì từ video này?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                {/* File upload zone - only for file mode */}
                                {mode === "file" && (
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
                                                        <p className="text-sm font-bold text-slate-900">Click để upload hoặc kéo thả</p>
                                                        <p className="text-xs text-slate-500">MP4, WebM hoặc MOV (Tối đa 500MB)</p>
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
                                )}

                                {error && (
                                    <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-red-700">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="border-t border-slate-100 bg-slate-50/30 px-6 py-4">
                                <div className="flex w-full flex-col gap-4">
                                    {isUploading && mode === "file" && (
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
                                        <Button asChild variant="ghost" disabled={isUploading || isSubmitting}>
                                            <Link href="/dashboard">Hủy</Link>
                                        </Button>
                                        {mode === "youtube" ? (
                                            <Button
                                                disabled={!youtubeUrl || !title || !extractYouTubeId(youtubeUrl) || isSubmitting}
                                                isLoading={isSubmitting}
                                                className="min-w-[140px] bg-red-600 hover:bg-red-700"
                                            >
                                                <Youtube size={18} className="mr-2" />
                                                Thêm từ YouTube
                                            </Button>
                                        ) : (
                                            <Button
                                                disabled={!file || !title || isUploading}
                                                isLoading={isUploading}
                                                className="min-w-[140px] bg-teal-600 hover:bg-teal-700"
                                            >
                                                Bắt đầu upload
                                            </Button>
                                        )}
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
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    {mode === "youtube"
                                        ? "Dán link YouTube rồi đặt tiêu đề hay — không cần upload file nặng."
                                        : "Sử dụng tiêu đề rõ ràng để mọi người dễ dàng tìm thấy bài giảng."}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                    <span className="text-sm font-bold">2</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Sau khi thêm, bạn có thể thêm các câu hỏi trắc nghiệm (Quiz) tại bất kỳ mốc thời gian nào.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <span className="text-sm font-bold">3</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Video có Quiz giúp người xem tập trung hơn gấp 3 lần!
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="rounded-2xl bg-teal-50 p-6 border border-teal-100">
                        <h4 className="font-bold text-teal-900 flex items-center gap-2">
                            <CheckCircle2 size={18} /> {mode === "youtube" ? "Hỗ trợ" : "Định dạng hỗ trợ"}
                        </h4>
                        <ul className="mt-4 space-y-2">
                            {mode === "youtube" ? (
                                <>
                                    <li className="flex items-center gap-2 text-xs text-teal-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> youtube.com/watch?v=...
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-teal-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> youtu.be/...
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-teal-700">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> youtube.com/embed/...
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> MP4 là định dạng tốt nhất
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Tỷ lệ khung hình 16:9
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Độ phân giải HD (720p/1080p)
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
