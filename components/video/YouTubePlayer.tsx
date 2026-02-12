"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { QuizOverlay } from "./QuizOverlay";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatDuration } from "@/lib/utils";

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Quiz {
    id: string;
    question: string;
    timestamp: number;
    options: Option[];
}

interface YouTubePlayerProps {
    youtubeId: string;
    videoId: string; // DB video ID
    quizzes: Quiz[];
    initialTime?: number;
    onProgressUpdate?: (time: number) => void;
    onComplete?: () => void;
}

// YouTube IFrame API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function YouTubePlayer({
    youtubeId,
    videoId,
    quizzes,
    initialTime = 0,
    onProgressUpdate,
    onComplete,
}: YouTubePlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [answeredQuizIds, setAnsweredQuizIds] = useState<Set<string>>(new Set());
    const [lockedUntil, setLockedUntil] = useState(0);
    const [showControls, setShowControls] = useState(true);

    const [maxWatched, setMaxWatched] = useState(0);

    // Lock calculation
    useEffect(() => {
        const sortedQuizzes = [...quizzes].sort((a, b) => a.timestamp - b.timestamp);
        const firstUnanswered = sortedQuizzes.find(q => !answeredQuizIds.has(q.id));
        setLockedUntil(firstUnanswered ? firstUnanswered.timestamp : duration || 0);
    }, [quizzes, answeredQuizIds, duration]);



    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const initPlayer = useCallback(() => {
        if (playerRef.current) return;

        playerRef.current = new window.YT.Player(`yt-player-${videoId}`, {
            videoId: youtubeId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                rel: 0,
                start: Math.floor(initialTime),
                fs: 0,
                iv_load_policy: 3, // Hide annotations
                playsinline: 1,
            },
            events: {
                onReady: (event: any) => {
                    setIsReady(true);
                    setDuration(event.target.getDuration());
                    event.target.setVolume(100);
                },
                onStateChange: (event: any) => {
                    // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0
                    if (event.data === 1) {
                        setIsPlaying(true);
                        startTimeTracking();
                    } else if (event.data === 2) {
                        setIsPlaying(false);
                        stopTimeTracking();
                    } else if (event.data === 0) {
                        setIsPlaying(false);
                        stopTimeTracking();
                        onComplete?.();
                    }
                },
            },
        });
    }, [youtubeId, videoId, initialTime, onComplete]);

    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = () => {
                initPlayer();
            };
        } else {
            initPlayer();
        }
    }, [initPlayer]);

    const startTimeTracking = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (!playerRef.current?.getCurrentTime) return;
            const time = playerRef.current.getCurrentTime();
            setCurrentTime(time);

            // Update Max Watched
            if (time > maxWatched) {
                setMaxWatched(time);
            }

            onProgressUpdate?.(time);

            // Check for quizzes
            const quiz = quizzes.find(
                (q) => !answeredQuizIds.has(q.id) && Math.abs(time - q.timestamp) < 1
            );
            if (quiz) {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
                setActiveQuiz(quiz);
            }
        }, 500);
    }, [quizzes, answeredQuizIds, onProgressUpdate, maxWatched]);

    const stopTimeTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Clean up interval with the latest callback
    useEffect(() => {
        if (isPlaying) startTimeTracking();
        return () => stopTimeTracking();
    }, [isPlaying, startTimeTracking]);

    const handleCorrect = () => {
        if (activeQuiz) {
            setAnsweredQuizIds((prev) => new Set(prev).add(activeQuiz.id));
            setActiveQuiz(null);

            // Critical Fix: Jump forward to avoid re-triggering
            if (playerRef.current) {
                const safeTime = Math.min(activeQuiz.timestamp + 2, duration);
                playerRef.current.seekTo(safeTime, true);
                playerRef.current.playVideo();
            }
            setIsPlaying(true);
        }
    };

    const handleIncorrect = () => {
        if (playerRef.current && activeQuiz) {
            const sortedQuizzes = [...quizzes].sort((a, b) => a.timestamp - b.timestamp);
            const currentIndex = sortedQuizzes.findIndex((q) => q.id === activeQuiz.id);
            const rewindTo = currentIndex > 0 ? sortedQuizzes[currentIndex - 1].timestamp : 0;
            playerRef.current.seekTo(rewindTo, true);
            setActiveQuiz(null);
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (playerRef.current) {
            const limit = Math.min(lockedUntil, maxWatched);
            if (time > limit) {
                playerRef.current.seekTo(limit, true);
            } else {
                playerRef.current.seekTo(time, true);
            }
        }
    };

    const progressPercentage = (currentTime / duration) * 100 || 0;
    const lockedPercentage = (lockedUntil / duration) * 100 || 0;
    // maxWatched visual
    const watchedPercentage = (maxWatched / duration) * 100 || 0;

    return (
        <div
            ref={containerRef}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl transition-all"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* YouTube IFrame */}
            <div id={`yt-player-${videoId}`} className="h-full w-full" />

            {/* Loading overlay */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                </div>
            )}

            {/* Click overlay to toggle play (covers the YouTube player to prevent native clicks) */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                style={{ bottom: '50px' }}
                onClick={togglePlay}
            />

            {/* Quiz Overlay */}
            {activeQuiz && (
                <QuizOverlay
                    quiz={activeQuiz}
                    onCorrect={handleCorrect}
                    onIncorrect={handleIncorrect}
                />
            )}

            {/* Custom Controls */}
            <div className={cn(
                "absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300",
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
            )}>
                {/* Progress Bar */}
                <div className="relative group/progress h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2">
                    {/* Quiz Markers */}
                    {quizzes.map((q, idx) => (
                        <div
                            key={idx}
                            className="absolute top-1/2 z-20 h-3 w-1 -translate-y-1/2 rounded-full bg-amber-400 shadow-sm"
                            style={{ left: `${(q.timestamp / duration) * 100}%` }}
                        />
                    ))}

                    {/* Max Watched Background (Grayish, shows what IS available) */}
                    <div
                        className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                        style={{ width: `${watchedPercentage}%` }}
                    />

                    {/* Locked/Blocked Background (Red/Overlay? Actually we just show what IS available. Anything past maxWatched is transparent/disabled) */}

                    {/* Progress Fill (Teal) */}
                    <div
                        className="absolute inset-y-0 left-0 bg-teal-500 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />

                    {/* Seek Input */}
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 z-30 w-full cursor-pointer opacity-0"
                    />
                </div>

                {/* ... Buttons ... */}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </Button>

                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <span>{formatDuration(currentTime)}</span>
                            <span className="opacity-50">/</span>
                            <span className="opacity-50">{formatDuration(duration)}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                            onClick={() => {
                                if (!playerRef.current) return;
                                if (isMuted) {
                                    playerRef.current.unMute();
                                    setIsMuted(false);
                                } else {
                                    playerRef.current.mute();
                                    setIsMuted(true);
                                }
                            }}
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
