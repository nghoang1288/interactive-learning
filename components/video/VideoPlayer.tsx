"use client";

import { useEffect, useRef, useState } from "react";
import { VideoControls } from "./VideoControls";
import { QuizOverlay } from "./QuizOverlay";
import { cn } from "@/lib/utils";

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

interface VideoPlayerProps {
    url: string;
    videoId: string;
    quizzes: Quiz[];
    initialTime?: number;
    onProgressUpdate?: (time: number) => void;
    onComplete?: () => void;
}

export function VideoPlayer({
    url,
    videoId,
    quizzes,
    initialTime = 0,
    onProgressUpdate,
    onComplete
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [answeredQuizIds, setAnsweredQuizIds] = useState<Set<string>>(new Set());
    const [lockedUntil, setLockedUntil] = useState(0);

    const [maxWatched, setMaxWatched] = useState(0);

    // Initialize lockedUntil based on quizzes
    useEffect(() => {
        const sortedQuizzes = [...quizzes].sort((a, b) => a.timestamp - b.timestamp);
        const firstUnanswered = sortedQuizzes.find(q => !answeredQuizIds.has(q.id));
        setLockedUntil(firstUnanswered ? firstUnanswered.timestamp : duration || 0);
    }, [quizzes, answeredQuizIds, duration]);

    useEffect(() => {
        if (videoRef.current && initialTime > 0) {
            videoRef.current.currentTime = initialTime;
        }
    }, [initialTime]);

    // Handle progress updates
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const time = videoRef.current.currentTime;
        setCurrentTime(time);

        // Update Max Watched
        if (time > maxWatched) {
            setMaxWatched(time);
        }

        onProgressUpdate?.(time);

        // Check for quizzes
        const quiz = quizzes.find(q =>
            !answeredQuizIds.has(q.id) &&
            Math.abs(time - q.timestamp) < 0.5
        );

        if (quiz) {
            videoRef.current.pause();
            setIsPlaying(false);
            setActiveQuiz(quiz);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
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

    const handleCorrect = () => {
        if (activeQuiz) {
            setAnsweredQuizIds(prev => new Set(prev).add(activeQuiz.id));
            setActiveQuiz(null);

            // Critical Fix: Jump forward slightly to avoid re-triggering the same quiz due to async state update
            if (videoRef.current) {
                videoRef.current.currentTime += 1;
                videoRef.current.play();
            }
            setIsPlaying(true);
        }
    };

    const handleIncorrect = () => {
        if (videoRef.current && activeQuiz) {
            // Rewind to previous quiz's timestamp (or 0 if first quiz)
            const sortedQuizzes = [...quizzes].sort((a, b) => a.timestamp - b.timestamp);
            const currentIndex = sortedQuizzes.findIndex(q => q.id === activeQuiz.id);
            const rewindTo = currentIndex > 0 ? sortedQuizzes[currentIndex - 1].timestamp : 0;
            videoRef.current.currentTime = rewindTo;
            setActiveQuiz(null);
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div
            ref={containerRef}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl transition-all"
        >
            <video
                ref={videoRef}
                src={url}
                className="h-full w-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={onComplete}
                playsInline
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
            <VideoControls
                videoRef={videoRef}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                setVolume={setVolume}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                lockedUntil={lockedUntil}
                maxWatched={maxWatched}
                quizMarkers={quizzes.map(q => q.timestamp)}
            />
        </div>
    );
}
