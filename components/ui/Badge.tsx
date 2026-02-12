import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "primary", ...props }: BadgeProps) {
    const variants = {
        primary: "bg-teal-100 text-teal-700 ring-1 ring-teal-200/60",
        secondary: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/60",
        success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/60",
        warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-200/60",
        danger: "bg-red-100 text-red-700 ring-1 ring-red-200/60",
        outline: "text-slate-700 border border-slate-300 bg-white",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
