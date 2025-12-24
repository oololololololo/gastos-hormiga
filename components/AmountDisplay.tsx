"use client";

import { cn } from "@/lib/utils";

interface AmountDisplayProps {
    amount: string;
    className?: string;
}

export function AmountDisplay({ amount, className }: AmountDisplayProps) {
    // Format description: If empty, show placeholder "0.00" but keep size/layout
    const isEmpty = amount === "";
    const displayValue = isEmpty ? "0.00" : amount;

    return (
        <div className={cn("flex flex-col items-center justify-center p-8 w-full", className)}>
            <div className="relative flex items-baseline justify-center w-full px-4">
                <span className="text-4xl text-muted-foreground mr-2 font-light select-none">$</span>
                <span
                    className={cn(
                        "text-8xl leading-none font-medium tracking-tighter text-center select-none",
                        isEmpty ? "text-muted-foreground/30" : "text-foreground"
                    )}
                >
                    {displayValue}
                </span>
            </div>
        </div>
    );
}
