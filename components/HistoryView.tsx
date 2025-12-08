"use client";

import { motion } from "framer-motion";

import { ArrowDown } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface HistoryViewProps {
    onClose: () => void;
}

export function HistoryView({ onClose }: HistoryViewProps) {
    const { expenses, getTodayTotal } = useExpenseStore();

    // Filter for today locally or use store getter? Store getter for total, but list we need locally.
    // Ideally store should provide selectors. I'll just filter here for simplicity in prototype.
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todaysExpenses = expenses.filter(e => e.timestamp >= startOfDay);

    const total = getTodayTotal();

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.y > 100) {
            onClose();
        }
    };

    const handleExport = () => {
        const header = "Date,Time,Amount,Category\n";
        const csv = expenses.map(e => {
            const date = new Date(e.timestamp);
            return `${date.toLocaleDateString()},${date.toLocaleTimeString()},${e.amount},${e.category || ''}`;
        }).join("\n");

        const blob = new Blob([header + csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gastos-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed inset-0 z-50 bg-background flex flex-col pt-12 pb-8 px-6 shadow-2xl rounded-t-[2.5rem]"
        >
            {/* Drag Handle */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full opacity-50" />

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-muted-foreground text-sm uppercase tracking-widest mb-2">Total Today</h2>
                    <div className="text-6xl font-medium tracking-tighter">
                        ${total.toFixed(2)}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors self-end"
                    >
                        <ArrowDown className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleExport}
                        className="text-xs font-medium text-accent uppercase tracking-widest hover:underline"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                {todaysExpenses.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-20">
                        No expenses yet.<br />Go spend some money.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {todaysExpenses.map((expense) => (
                            <div key={expense.id} className="flex justify-between items-center text-xl font-light border-b border-muted/20 pb-4 last:border-0">
                                <span className="text-muted-foreground">
                                    {new Date(expense.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="flex items-center gap-3">
                                    {/* We could map category to icon here if we wanted */}
                                    {expense.category && <span className="text-sm capitalize text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">{expense.category}</span>}
                                    <span>${expense.amount.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
