import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, asChild = false, children, disabled, ...props }, ref) => {
        const Component = asChild ? Slot : "button";

        const variants = {
            primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-100 active:scale-[0.98]",
            secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm active:scale-[0.98]",
            outline: "border-2 border-teal-600 bg-white text-teal-700 hover:bg-teal-50 font-semibold active:scale-[0.98]",
            ghost: "bg-transparent hover:bg-slate-100 text-slate-700 font-medium",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10",
        };

        return (
            <Component
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || disabled}
                {...props}
            >
                {asChild ? (
                    children
                ) : (
                    <>
                        {isLoading && (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                        {children}
                    </>
                )}
            </Component>
        );
    }
);
Button.displayName = "Button";

export { Button };
