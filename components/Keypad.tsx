"use client";

import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    className?: string;
}

export function Keypad({ onKeyPress, onDelete, className }: KeypadProps) {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

    return (
        <div className={cn("grid grid-cols-3 gap-4 w-full max-w-sm mx-auto px-4", className)}>
            {keys.map((key) => (
                <KeyButton
                    key={key}
                    value={key}
                    onClick={() => onKeyPress(key)}
                />
            ))}
            <KeyButton
                value="delete"
                onClick={onDelete}
                className="text-muted-foreground"
            >
                <Delete className="w-8 h-8" strokeWidth={1.5} />
            </KeyButton>
        </div>
    );
}

interface KeyButtonProps {
    value: string;
    onClick: () => void;
    children?: React.ReactNode;
    className?: string;
}

function KeyButton({ value, onClick, children, className }: KeyButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={cn(
                "aspect-[4/3] flex items-center justify-center text-3xl font-normal rounded-2xl transition-colors select-none touch-manipulation",
                // Visual style: minimal, maybe subtle background on hover? Mobile: active state is handled by whileTap.
                "active:bg-muted/50 focus:outline-none",
                className
            )}
        >
            {children || value}
        </motion.button>
    );
}
