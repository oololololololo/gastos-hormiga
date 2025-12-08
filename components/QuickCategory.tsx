"use client";

import { motion } from "framer-motion";
import { Coffee, Bus, ShoppingBag, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCategoryProps {
    onSelect: (category: string) => void;
    selected?: string;
    className?: string;
}

export function QuickCategory({ onSelect, selected, className }: QuickCategoryProps) {
    const categories = [
        { id: "food", icon: Coffee },
        { id: "transport", icon: Bus },
        { id: "shopping", icon: ShoppingBag },
    ];

    return (
        <div className={cn("flex justify-center gap-6 py-4", className)}>
            {categories.map((cat) => (
                <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSelect(cat.id === selected ? "" : cat.id)}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                        selected === cat.id ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    <cat.icon className="w-6 h-6" strokeWidth={1.5} />
                </motion.button>
            ))}
        </div>
    );
}
