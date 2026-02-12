"use client";

import { useEffect, useRef, useState } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    RotateCcw,
    Settings,
    SkipForward
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface VideoControlsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentTime: number;
    duration: number;
    volume: number;
    setVolume: (volume: number) => void;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    lockedUntil: number; // For seek prevention
    maxWatched: number; // For smart seeking
    quizMarkers: number[]; // Array of timestamps for markers
    isCompleted?: boolean;
    onMarkComplete?: () => void;
}

export function VideoControls({
    videoRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isFullscreen,
    toggleFullscreen,
    lockedUntil,
    maxWatched,
    quizMarkers,
    isCompleted = false,
    onMarkComplete
}: VideoControlsProps) {
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const progressPercentage = (currentTime / duration) * 100 || 0;
    const lockedPercentage = (lockedUntil / duration) * 100 || 0;
    const watchedPercentage = (maxWatched / duration) * 100 || 0;

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            // Smart Seek: Allow rewinding, but prevent forward seeking past maxWatched
            // UNLESS the video is completed (optional, but good UX)
            // For now, strict maxWatched

            // Also respect lockedUntil (Quiz block)
            const limit = Math.min(lockedUntil, maxWatched);

            if (!isCompleted && time > limit) {
                // Trying to seek past allowed
                videoRef.current.currentTime = limit;
            } else {
                videoRef.current.currentTime = time;
            }
        }
    };

    return (
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {/* Progress Bar */}
            <div className="relative group/progress h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2">
                {/* Markers */}
                {quizMarkers.map((marker, idx) => (
                    <div
                        key={idx}
                        className="absolute top-1/2 z-20 h-3 w-1 -translate-y-1/2 rounded-full bg-amber-400 shadow-sm"
                        style={{ left: `${(marker / duration) * 100}%` }}
                    />
                ))}

                {/* Max Watched Background */}
                <div
                    className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                    style={{ width: `${watchedPercentage}%` }}
                />

                {/* Progress Fill */}
                <div
                    className="absolute inset-y-0 left-0 bg-teal-500 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                />

                {/* Range Input Overlay - RESTORED for Smart Seek */}
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

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                        onClick={handleTogglePlay}
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </Button>

                    {/* Rewind Button - REMOVED for "No Seek" policy
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                        onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                    >
                        <RotateCcw size={20} />
                    </Button>
                    {/* Mark as Complete Button */}
                    {!isCompleted && onMarkComplete && (
                        <div className="flex items-center ml-2 border-l border-white/20 pl-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMarkComplete}
                                className="text-white hover:bg-emerald-500/20 hover:text-emerald-400 gap-2 h-8 rounded-full px-3 transition-colors border border-white/10"
                                title="Đánh dấu hoàn thành để mở khóa tua video"
                            >
                                <div className="h-4 w-4 rounded-full border-2 border-current" />
                                <span className="text-xs font-medium">Hoàn thành</span>
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>{formatDuration(currentTime)}</span>
                        <span className="opacity-50">/</span>
                        <span className="opacity-50">{formatDuration(duration)}</span>
                    </div>

                    <div
                        className="flex items-center gap-2 group/volume"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </Button>

                        <div className={cn(
                            "overflow-hidden transition-all duration-300",
                            showVolumeSlider ? "w-24 opacity-100" : "w-0 opacity-0"
                        )}>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full accent-teal-500 h-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-10 w-10 rounded-full">
                        <Settings size={20} />
                    </Button>
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
    );
}
