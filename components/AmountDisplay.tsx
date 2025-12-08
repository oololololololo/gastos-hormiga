"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AmountDisplayProps {
    amount: string;
    className?: string;
}

export function AmountDisplay({ amount, className }: AmountDisplayProps) {
    // Format description: If empty, show placeholder "0"
    const displayValue = amount === "" ? "0" : amount;

    return (
        <div className={cn("flex flex-col items-center justify-center p-8", className)}>
            <div className="relative flex items-baseline justify-center overflow-hidden">
                <span className="text-4xl text-muted-foreground mr-2 font-light">$</span>
                <motion.span
                    key={amount} // Re-render animation on change? Maybe too jittery. 
                    // Better: simple scale effect or just text.
                    layout
                    className="text-8xl font-medium tracking-tighter text-foreground"
                >
                    {displayValue}
                </motion.span>
            </div>
        </div>
    );
}
