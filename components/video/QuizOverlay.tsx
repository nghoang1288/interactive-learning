"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Quiz {
    id: string;
    question: string;
    options: Option[];
}

interface QuizOverlayProps {
    quiz: Quiz;
    onCorrect: () => void;
    onIncorrect: () => void;
}

export function QuizOverlay({ quiz, onCorrect, onIncorrect }: QuizOverlayProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");

    const handleSubmit = () => {
        if (!selectedOption) return;

        const option = quiz.options.find(o => o.id === selectedOption);
        if (option?.isCorrect) {
            setStatus("correct");
            setTimeout(() => onCorrect(), 1500);
        } else {
            setStatus("incorrect");
            setTimeout(() => {
                setStatus("idle");
                setSelectedOption(null);
                onIncorrect();
            }, 2000);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="mx-4 w-full max-w-lg shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-500">
                <CardHeader className="text-center pb-2">
                    <Badge className="mx-auto bg-amber-100 text-amber-700 w-fit mb-2">CÂU HỎI TƯƠNG TÁC</Badge>
                    <CardTitle className="text-xl sm:text-2xl font-bold leading-tight">
                        {quiz.question}
                    </CardTitle>
                    <CardDescription>Hãy trả lời đúng để có thể xem tiếp bài học nhé!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-3">
                        {quiz.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => status === "idle" && setSelectedOption(option.id)}
                                className={cn(
                                    "flex items-center justify-between rounded-xl border-2 p-4 text-left font-medium transition-all group",
                                    selectedOption === option.id
                                        ? "border-teal-600 bg-teal-50 text-teal-700"
                                        : "border-slate-200 bg-slate-50 hover:bg-white hover:border-teal-300",
                                    status === "correct" && option.isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-700",
                                    status === "incorrect" && selectedOption === option.id && !option.isCorrect && "border-red-500 bg-red-50 text-red-700"
                                )}
                            >
                                <span className="flex-1">{option.text}</span>
                                {status === "correct" && option.isCorrect && <CheckCircle2 size={20} className="text-emerald-500 animate-in zoom-in" />}
                                {status === "incorrect" && selectedOption === option.id && !option.isCorrect && <AlertCircle size={20} className="text-red-500 animate-shake" />}
                            </button>
                        ))}
                    </div>

                    <Button
                        className="w-full mt-4 h-12 text-lg font-bold shadow-lg shadow-teal-100"
                        disabled={!selectedOption || status !== "idle"}
                        onClick={handleSubmit}
                        isLoading={status !== "idle"}
                    >
                        {status === "correct" ? "Chính xác! Đang tiếp tục..." :
                            status === "incorrect" ? "Sai rồi! Hãy xem lại nhé..." :
                                "Xác nhận đáp án"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
