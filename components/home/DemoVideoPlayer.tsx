"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn, formatDuration } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw, BrainCircuit } from "lucide-react";

interface QuizItem {
    id: number;
    triggerTime: number;
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
}

const DEMO_QUIZZES: QuizItem[] = [
    {
        id: 1,
        triggerTime: 10,
        question: "Hệ thống nào đang được hiển thị trong video?",
        options: [
            { id: "1a", text: "🦴 Hệ xương khớp", isCorrect: false },
            { id: "1b", text: "🫀 Hệ tuần hoàn & Nội tạng", isCorrect: true },
            { id: "1c", text: "🧠 Hệ thần kinh", isCorrect: false },
        ],
    },
    {
        id: 2,
        triggerTime: 35,
        question: "Cơ quan nào có vai trò lọc máu chính trong cơ thể?",
        options: [
            { id: "2a", text: "Gan", isCorrect: false },
            { id: "2b", text: "Thận", isCorrect: true },
            { id: "2c", text: "Tim", isCorrect: false },
        ],
    },
    {
        id: 3,
        triggerTime: 60,
        question: "Máu giàu oxy được vận chuyển qua loại mạch nào?",
        options: [
            { id: "3a", text: "Động mạch", isCorrect: true },
            { id: "3b", text: "Tĩnh mạch", isCorrect: false },
            { id: "3c", text: "Mao mạch phổi", isCorrect: false },
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
            if (!completedQuizIds.has(quiz.id) && Math.abs(video.currentTime - quiz.triggerTime) < 0.5) {
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
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BrainCircuit size={14} className="text-teal-600" />
                    Quiz hoàn thành: <span className="text-slate-900 dark:text-white font-bold">{completedCount}/{totalQuizzes}</span>
                </span>
                <div className="flex gap-1.5">
                    {DEMO_QUIZZES.map((q, i) => (
                        <div
                            key={q.id}
                            className={cn(
                                "h-2 w-8 rounded-full transition-all duration-300",
                                completedQuizIds.has(q.id)
                                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                    : currentQuiz?.id === q.id
                                        ? "bg-teal-500 animate-pulse scale-110"
                                        : "bg-slate-200 dark:bg-slate-700"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div
                className="aspect-video relative rounded-[1.8rem] overflow-hidden bg-slate-900 shadow-inner group cursor-pointer border border-slate-100 dark:border-slate-800"
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    // Medical animation video (Royalty Free from Pixabay)
                    src="https://cdn.pixabay.com/video/2016/07/28/4058-176749056_large.mp4"
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    playsInline
                    loop
                    // Medical poster
                    poster="https://cdn.pixabay.com/photo/2018/07/15/10/44/dna-3539309_1280.jpg"
                    onError={() => setVideoError(true)}
                />

                {/* Video error fallback overlay */}
                {videoError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-cyan-700 text-white p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-80"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                        <p className="text-xl font-bold mb-2">Demo Video Unavailable</p>
                        <p className="text-sm opacity-80">Video source might be restricted in your region.<br />Reload page or try checking network connection.</p>
                    </div>
                )}

                {/* Custom Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity opacity-0 group-hover:opacity-100 flex flex-col justify-end p-6 pointer-events-none">
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-4 backdrop-blur-sm">
                        <div className="h-full bg-teal-500 transition-all duration-300 relative" style={{ width: `${progress}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pointer-events-auto">
                        <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all ring-1 ring-white/20">
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            )}
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Time Display */}
                            <div className="text-white font-mono font-medium text-xs bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                                {videoRef.current ? formatDuration(videoRef.current.currentTime) : "0:00"} / {videoRef.current ? formatDuration(videoRef.current.duration) : "0:00"}
                            </div>

                            <button onClick={toggleMute} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all ring-1 ring-white/20">
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
                        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-teal-600/90 text-white shadow-2xl animate-in zoom-in-50 backdrop-blur-sm ring-4 ring-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                    </div>
                )}

                {/* Quiz Overlay */}
                <div className={cn(
                    "absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm cursor-default transition-all duration-500",
                    currentQuiz ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )} onClick={(e) => e.stopPropagation()}>
                    {currentQuiz && (
                        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-[90%] max-w-md animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-2.5 w-2.5 rounded-full bg-teal-600 animate-pulse ring-4 ring-teal-100 dark:ring-teal-900/30" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                                        Câu hỏi {quizNumber}/{totalQuizzes}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                    ⏱ 00:{currentQuiz.triggerTime}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                {currentQuiz.question}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                                Trả lời đúng để tiếp tục xem bài giảng.
                            </p>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuiz.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.id)}
                                        disabled={status !== "idle"}
                                        className={cn(
                                            "w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left font-medium transition-all group/opt",
                                            // Default state (Light mode contrast fix: darker text, stronger border)
                                            "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-teal-400 hover:text-teal-700 hover:shadow-md",
                                            // Dark mode
                                            "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-teal-500 dark:hover:text-teal-300",

                                            // Selected state
                                            selectedOption === option.id && status === "idle" &&
                                            "border-teal-600 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-900/20 dark:text-teal-300 shadow-inner",

                                            // Correct state
                                            status === "correct" && option.isCorrect &&
                                            "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]",

                                            // Incorrect state
                                            status === "incorrect" && selectedOption === option.id && !option.isCorrect &&
                                            "border-red-500 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-900/20 dark:text-red-300",

                                            status !== "idle" && "cursor-not-allowed opacity-80"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold text-sm transition-colors",
                                            selectedOption === option.id
                                                ? "border-current bg-current text-white"
                                                : "border-slate-300 text-slate-500 group-hover/opt:border-teal-400 group-hover/opt:text-teal-600 dark:border-slate-600 dark:text-slate-400"
                                        )}>
                                            {option.id.replace(/[0-9]/g, '').toUpperCase()}
                                        </div>
                                        <span className="flex-1 text-sm sm:text-base font-semibold">{option.text}</span>

                                        {status === "correct" && option.isCorrect && (
                                            <CheckCircle2 size={24} className="text-emerald-500 animate-in zoom-in spin-in-90" />
                                        )}
                                        {status === "incorrect" && selectedOption === option.id && !option.isCorrect && (
                                            <XCircle size={24} className="text-red-500 animate-in zoom-in shake" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Feedback */}
                            <div className="h-8 mt-4 flex items-center justify-center">
                                {status === "correct" && (
                                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full animate-in slide-in-from-bottom-2 fade-in">
                                        🎉 Chính xác! Đang tiếp tục phát...
                                    </div>
                                )}
                                {status === "incorrect" && (
                                    <div className="text-red-600 dark:text-red-400 font-bold text-sm flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-full animate-in slide-in-from-bottom-2 fade-in">
                                        <RotateCcw size={14} className="animate-spin" />
                                        Sai rồi! Đang tua lại 1 đoạn...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                💡 <span className="hidden sm:inline">Mẹo: </span> Đây là video demo. Trong thực tế, bạn có thể thêm Quiz tại bất kỳ giây nào của video.
            </p>
        </div>
    );
}
