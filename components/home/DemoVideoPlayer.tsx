"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn, formatDuration } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface QuizItem {
    id: number;
    triggerTime: number;
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
}

const DEMO_QUIZZES: QuizItem[] = [
    {
        id: 1,
        triggerTime: 5,
        question: "Big Buck Bunny là phim hoạt hình về loài vật nào?",
        options: [
            { id: "1a", text: "🐰 Thỏ", isCorrect: true },
            { id: "1b", text: "🦊 Cáo", isCorrect: false },
            { id: "1c", text: "🐻 Gấu", isCorrect: false },
        ],
    },
    {
        id: 2,
        triggerTime: 10,
        question: "Bối cảnh chính của phim diễn ra ở đâu?",
        options: [
            { id: "2a", text: "🏙️ Thành phố", isCorrect: false },
            { id: "2b", text: "🌲 Khu rừng", isCorrect: true },
            { id: "2c", text: "🏖️ Bãi biển", isCorrect: false },
        ],
    },
    {
        id: 3,
        triggerTime: 15,
        question: "Nhân vật phản diện trong phim là gì?",
        options: [
            { id: "3a", text: "🐿️ Sóc chuột", isCorrect: true },
            { id: "3b", text: "🐺 Sói", isCorrect: false },
            { id: "3c", text: "🦅 Đại bàng", isCorrect: false },
        ],
    },
];

export function DemoVideoPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const [progress, setProgress] = useState(0);

    const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);
    const [completedQuizIds, setCompletedQuizIds] = useState<Set<number>>(new Set());
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
    const [quizNumber, setQuizNumber] = useState(0);

    // Monitor video time to trigger quizzes & update progress
    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        // Update progress visual
        setProgress((video.currentTime / video.duration) * 100);

        if (currentQuiz) return;

        for (const quiz of DEMO_QUIZZES) {
            if (!completedQuizIds.has(quiz.id) && video.currentTime >= quiz.triggerTime) {
                video.pause();
                setIsPlaying(false);
                setCurrentQuiz(quiz);
                setQuizNumber(DEMO_QUIZZES.indexOf(quiz) + 1);
                break;
            }
        }
    }, [currentQuiz, completedQuizIds]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onError = () => setVideoError(true);

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("error", onError);

        // Attempt autoplay
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("error", onError);
        };
    }, [handleTimeUpdate]);

    const handleAnswer = (optionId: string) => {
        if (status !== "idle" || !currentQuiz) return;
        setSelectedOption(optionId);

        const option = currentQuiz.options.find((o) => o.id === optionId);
        if (option?.isCorrect) {
            setStatus("correct");
            setTimeout(() => {
                setCompletedQuizIds((prev) => new Set([...prev, currentQuiz.id]));
                setCurrentQuiz(null);
                setStatus("idle");
                setSelectedOption(null);
                videoRef.current?.play();
            }, 1500);
        } else {
            setStatus("incorrect");
            setTimeout(() => {
                // Rewind to previous quiz's trigger time (or 0 if first quiz)
                const currentIndex = DEMO_QUIZZES.findIndex((q) => q.id === currentQuiz.id);
                const rewindTo = currentIndex > 0 ? DEMO_QUIZZES[currentIndex - 1].triggerTime : 0;
                setCurrentQuiz(null);
                setStatus("idle");
                setSelectedOption(null);
                if (videoRef.current) {
                    videoRef.current.currentTime = rewindTo;
                    videoRef.current.play();
                }
            }, 2000);
        }
    };

    const totalQuizzes = DEMO_QUIZZES.length;
    const completedCount = completedQuizIds.size;

    return (
        <div className="relative rounded-[2.5rem] p-3 sm:p-5 bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-slate-200/60 dark:ring-slate-700/60">
            {/* Header / Progress Info */}
            <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Quiz hoàn thành: {completedCount}/{totalQuizzes}
                </span>
                <div className="flex gap-1.5">
                    {DEMO_QUIZZES.map((q, i) => (
                        <div
                            key={q.id}
                            className={cn(
                                "h-2 w-8 rounded-full transition-colors",
                                completedQuizIds.has(q.id)
                                    ? "bg-emerald-500"
                                    : currentQuiz?.id === q.id
                                        ? "bg-teal-500 animate-pulse"
                                        : "bg-slate-200"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div
                className="aspect-video relative rounded-[1.8rem] overflow-hidden bg-slate-900 shadow-inner group cursor-pointer"
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    loop
                    poster="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80"
                    onError={() => setVideoError(true)}
                />
                {/* Video error fallback overlay */}
                {videoError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-80"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                        <p className="text-lg font-semibold">Demo Video</p>
                        <p className="text-sm opacity-70 mt-1">Quiz sẽ xuất hiện tại các mốc 5s, 10s, 15s</p>
                    </div>
                )}

                {/* Custom Overlay Controls */}
                <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 pointer-events-none">
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center pointer-events-auto">
                        <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all">
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            )}
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Time Display */}
                            <div className="text-white font-medium text-xs bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                                {videoRef.current ? formatDuration(videoRef.current.currentTime) : "0:00"} / {videoRef.current ? formatDuration(videoRef.current.duration) : "0:00"}
                            </div>

                            <button onClick={toggleMute} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all">
                                {isMuted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Big Play Button when paused */}
                {!isPlaying && !currentQuiz && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-teal-600/90 text-white shadow-xl animate-in zoom-in-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                    </div>
                )}

                {/* Quiz Overlay */}
                {currentQuiz && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-default" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white/95 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-2xl border border-white/20 w-[90%] max-w-md animate-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
                                        Quiz {quizNumber}/{totalQuizzes}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">
                                    ⏱ {currentQuiz.triggerTime}s
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {currentQuiz.question}
                            </h3>
                            <p className="text-sm text-slate-500 mb-5">
                                Trả lời đúng để xem tiếp, sai sẽ xem lại!
                            </p>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuiz.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.id)}
                                        disabled={status !== "idle"}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-xl border-2 p-3.5 text-left font-medium transition-all",
                                            "border-slate-200 bg-slate-50 hover:bg-white hover:border-teal-300",
                                            selectedOption === option.id &&
                                            status === "idle" &&
                                            "border-teal-600 bg-teal-50 text-teal-700",
                                            status === "correct" &&
                                            option.isCorrect &&
                                            "border-emerald-500 bg-emerald-50 text-emerald-700",
                                            status === "incorrect" &&
                                            selectedOption === option.id &&
                                            !option.isCorrect &&
                                            "border-red-500 bg-red-50 text-red-700",
                                            status !== "idle" && "cursor-not-allowed opacity-70"
                                        )}
                                    >
                                        <span className="flex-1 text-sm sm:text-base">{option.text}</span>
                                        {status === "correct" && option.isCorrect && (
                                            <CheckCircle2 size={20} className="text-emerald-500" />
                                        )}
                                        {status === "incorrect" &&
                                            selectedOption === option.id &&
                                            !option.isCorrect && (
                                                <XCircle size={20} className="text-red-500" />
                                            )}
                                    </button>
                                ))}
                            </div>

                            {/* Feedback */}
                            {status === "correct" && (
                                <div className="mt-4 text-center text-emerald-600 font-bold text-sm">
                                    ✅ Chính xác! Đang tiếp tục phát video...
                                </div>
                            )}
                            {status === "incorrect" && (
                                <div className="mt-4 text-center text-red-600 font-bold text-sm flex items-center justify-center gap-2">
                                    <RotateCcw size={16} className="animate-spin" />
                                    Sai rồi! Đang tua lại...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
