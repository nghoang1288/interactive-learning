import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "neo-button neo-button-primary bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "neo-button bg-red-500 text-white border-red-700 shadow-[4px_4px_0px_0px_#b91c1c] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#b91c1c] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#b91c1c]",
                outline:
                    "neo-button bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] hover:bg-slate-100/50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#0f172a]",
                secondary:
                    "neo-button bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary-foreground/20 shadow-none",
                ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95 transition-transform",
                link: "text-primary underline-offset-4 hover:underline",
                neobrutalism: "neo-button bg-accent-cyan text-slate-900 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a]",
            },
            size: {
                default: "h-10 px-6 py-2",
                sm: "h-9 rounded-md px-4",
                lg: "h-12 rounded-full px-10 text-base",
                icon: "h-10 w-10 p-0 justify-center",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag" | "ref">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        if (asChild) {
            return (
                <Comp
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Comp>
            );
        }

        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
