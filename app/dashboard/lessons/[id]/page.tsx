"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { YouTubePlayer } from "@/components/video/YouTubePlayer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Trash2, Edit, Plus, X, Save, Check, Circle, ArrowLeft, BookOpen, Clock, User, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Option { id: string; text: string; isCorrect: boolean; }
interface Quiz { id: string; question: string; timestamp: number; options: Option[]; }
interface LessonData { id: string; title: string; description: string; url: string; videoType?: string; createdAt: string; authorId: string; author: { name: string }; quizzes: Quiz[]; }

export default function LessonDetailPage() {
    const { data: session } = useSession();
    const { id } = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [progress, setProgress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);

    // Quiz Management State
    const [isEditing, setIsEditing] = useState<string | null>(null); // Quiz ID or "new"
    const [quizForm, setQuizForm] = useState<{ question: string; timestamp: number; options: { id?: string; text: string; isCorrect: boolean }[] }>({
        question: "",
        timestamp: 0,
        options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
    });

    const isAuthor = session?.user?.id === lesson?.authorId;

    useEffect(() => {
        async function fetchData() {
            try {
                const [lessonRes, progressRes] = await Promise.all([
                    fetch(`/api/videos/${id}`),
                    fetch(`/api/progress`)
                ]);
                if (!lessonRes.ok) throw new Error("Video not found");
                const lessonData = await lessonRes.json();
                setLesson(lessonData);
                if (progressRes.ok) {
                    const pd = await progressRes.json();
                    const cp = Array.isArray(pd) ? pd.find((p: any) => p.videoId === id) : pd;
                    setProgress(cp);
                    setIsCompleted(cp?.completed || false);
                }
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        }
        fetchData();
    }, [id, router]);

    const handleProgressUpdate = async (time: number) => {
        if (Math.floor(time) % 5 === 0) {
            try { await fetch("/api/progress/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId: id, currentTime: time }) }); } catch { }
        }
    };

    // Quiz Handlers
    const handleAddQuiz = () => {
        setIsEditing("new");
        setQuizForm({
            question: "",
            timestamp: Math.floor(progress?.currentTime || 0),
            options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
        });
    };

    const handleEditQuiz = (quiz: Quiz) => {
        setIsEditing(quiz.id);
        setQuizForm({
            question: quiz.question,
            timestamp: quiz.timestamp,
            options: quiz.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
    };

    const handleSaveQuiz = async () => {
        if (!lesson) return;
        try {
            const url = isEditing === "new" ? `/api/videos/${id}/quizzes` : `/api/quizzes/${isEditing}`;
            const method = isEditing === "new" ? "POST" : "PUT";

            const payload = {
                ...quizForm,
                timestamp: Math.round(quizForm.timestamp) // Ensure int
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save quiz");
            }

            // Refresh data
            const updatedVideo = await (await fetch(`/api/videos/${id}`)).json();
            setLesson(updatedVideo);
            setIsEditing(null);
        } catch (error: any) {
            alert(`Lỗi: ${error.message}`);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa Quiz này?")) return;
        try {
            const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete quiz");
            // Refresh data
            const updatedVideo = await (await fetch(`/api/videos/${id}`)).json();
            setLesson(updatedVideo);
        } catch (error) {
            alert("Lỗi khi xóa quiz");
        }
    };

    const handleOptionChange = (idx: number, field: keyof Option, value: any) => {
        const newOptions = [...quizForm.options];
        // @ts-ignore
        newOptions[idx][field] = value;
        setQuizForm({ ...quizForm, options: newOptions });
    };

    const addOption = () => {
        setQuizForm({ ...quizForm, options: [...quizForm.options, { text: "", isCorrect: false }] });
    };

    const removeOption = (idx: number) => {
        if (quizForm.options.length <= 2) return;
        setQuizForm({ ...quizForm, options: quizForm.options.filter((_, i) => i !== idx) });
    };

    const handleComplete = async () => {
        setIsCompleted(true);
        try { await fetch("/api/progress/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId: id, completed: true }) }); } catch { }
    };

    if (isLoading) return (<div className="flex h-[80vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" /></div>);

    if (!lesson) return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 font-bold text-3xl dark:bg-slate-800 dark:text-slate-500">!</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Không tìm thấy bài học</h2>
            <p className="text-slate-500 mt-2 max-w-sm dark:text-slate-400">Có lỗi xảy ra. Vui lòng quay lại danh sách.</p>
            <Button asChild className="mt-6 rounded-xl h-11 px-8 bg-teal-600 hover:bg-teal-700"><Link href="/dashboard/lessons">Quay lại</Link></Button>
        </div>
    );

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="rounded-full h-10 w-10"><Link href="/dashboard/lessons"><ArrowLeft size={20} /></Link></Button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-slate-900 line-clamp-1 dark:text-white">{lesson.title}</h1>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 uppercase tracking-widest mt-1 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><User size={12} /> {lesson.author?.name || "Ẩn danh"}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(lesson.createdAt)}</span>
                    </div>
                </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {lesson.videoType === "YOUTUBE" ? (
                        <YouTubePlayer youtubeId={lesson.url} videoId={lesson.id} quizzes={lesson.quizzes} initialTime={progress?.currentTime || 0} onProgressUpdate={handleProgressUpdate} onComplete={handleComplete} />
                    ) : (
                        <VideoPlayer url={lesson.url} videoId={lesson.id} quizzes={lesson.quizzes} initialTime={progress?.currentTime || 0} onProgressUpdate={handleProgressUpdate} onComplete={handleComplete} />
                    )}
                    <Card className="border-0 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                        <CardHeader><CardTitle>Mô tả bài học</CardTitle></CardHeader>
                        <CardContent><p className="text-slate-700 leading-relaxed whitespace-pre-wrap dark:text-slate-300">{lesson.description || "Chưa có mô tả."}</p></CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-teal-100 text-teal-600 shadow-sm"><BookOpen size={18} /></div>
                                <CardTitle className="text-lg">Danh sách Quiz</CardTitle>
                            </div>
                            <CardDescription>Các mốc dừng tương tác.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isAuthor && !isEditing && (
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <Button onClick={handleAddQuiz} className="w-full bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800">
                                        <Plus size={16} className="mr-2" /> Thêm Quiz tại {Math.floor(progress?.currentTime || 0)}s
                                    </Button>
                                </div>
                            )}

                            {isEditing && (
                                <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4 dark:bg-slate-900/50 dark:border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{isEditing === "new" ? "Thêm Quiz Mới" : "Chỉnh Sửa Quiz"}</h4>
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}><X size={16} /></Button>
                                    </div>
                                    <div className="grid gap-4">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-3">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Câu hỏi</label>
                                                <Input className="mt-2" value={quizForm.question} onChange={e => setQuizForm({ ...quizForm, question: e.target.value })} placeholder="Nhập câu hỏi..." />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Thời điểm (s)</label>
                                                <Input className="mt-2" type="number" value={quizForm.timestamp} onChange={e => setQuizForm({ ...quizForm, timestamp: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Các lựa chọn (Tick đáp án đúng)</label>
                                            <div className="space-y-2 mt-2">
                                                {quizForm.options.map((opt, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <input
                                                            type="radio"
                                                            name="correctOption"
                                                            checked={opt.isCorrect}
                                                            onChange={() => {
                                                                const newOptions = quizForm.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                                                                setQuizForm({ ...quizForm, options: newOptions });
                                                            }}
                                                            className="h-4 w-4 accent-teal-600 cursor-pointer"
                                                        />
                                                        <Input
                                                            value={opt.text}
                                                            onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                                                            placeholder={`Lựa chọn ${idx + 1}`}
                                                            className="flex-1 h-9"
                                                        />
                                                        {quizForm.options.length > 2 && (
                                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeOption(idx)}>
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" onClick={addOption} className="w-full mt-2 text-slate-500 border-dashed"><Plus size={14} className="mr-1" /> Thêm lựa chọn</Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button variant="ghost" onClick={handleCancelEdit}>Hủy</Button>
                                            <Button onClick={handleSaveQuiz} className="bg-teal-600 hover:bg-teal-700 text-white"><Save size={16} className="mr-2" /> Lưu Quiz</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {lesson.quizzes.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Không có Quiz.</div>
                                ) : lesson.quizzes.map((quiz, idx) => (
                                    <div key={quiz.id} className="flex items-center justify-between p-4 group hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-900/30">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:text-teal-400">{idx + 1}</div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 line-clamp-1 dark:text-white">{quiz.question}</p>
                                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5 dark:text-slate-400">Tại {quiz.timestamp.toFixed(0)}s • {quiz.options.length} lựa chọn</p>
                                            </div>
                                        </div>
                                        {isAuthor && (
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400" onClick={() => handleEditQuiz(quiz)}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400" onClick={() => handleDeleteQuiz(quiz.id)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    {isCompleted && (
                        <div className="rounded-3xl bg-emerald-600 p-8 text-white shadow-2xl shadow-emerald-100 overflow-hidden relative">
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-4"><CheckCircle2 size={24} /></div>
                            <h3 className="text-xl font-bold">Hoàn thành!</h3>
                            <p className="mt-2 text-sm text-emerald-50">Bạn đã hoàn thành bài học này.</p>
                            <Button asChild variant="secondary" className="w-full mt-6 bg-white text-emerald-600 hover:bg-emerald-50 font-bold h-12"><Link href="/dashboard/lessons">Học tiếp</Link></Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
