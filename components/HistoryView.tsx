"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { ArrowDown, Trash2, Check } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/haptics";

interface HistoryViewProps {
    onClose: () => void;
}

export function HistoryView({ onClose }: HistoryViewProps) {
    const today = new Date();
    const { expenses, getTodayTotal, setHistoryOpen, removeExpense, updateExpense } = useExpenseStore();

    // Derived state
    const total = getTodayTotal();
    const todaysExpenses = expenses.filter(e => {
        const d = new Date(e.timestamp);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).sort((a, b) => b.timestamp - a.timestamp);

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.y > 100) {
            onClose();
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Category,Amount\n"
            + todaysExpenses.map(e => {
                const date = new Date(e.timestamp).toLocaleDateString();
                return `${date},${e.category || 'Uncategorized'},${e.amount}`;
            }).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "daily_expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editCategory, setEditCategory] = useState('');

    const startEditing = (expense: any) => {
        setEditingId(expense.id);
        setEditAmount(expense.amount.toString());
        setEditCategory(expense.category || '');
        hapticFeedback.light();
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        const amount = parseFloat(editAmount);
        if (isNaN(amount)) return;

        hapticFeedback.medium();
        // const { updateExpense } = useExpenseStore.getState(); // Get action directly if not destructured

        // We need to cast useExpenseStore to any or add updateExpense to the destructuring above if typescript complains,
        // but easier to just use the hook in component body properly.
        // Let's rely on re-render for simplicity or better use hook.
        // Actually, I'll update the destructuring at the top of component.
    };

    // ... wait, I need to update the hook destructuring first. 
    // I will do it in this Replace block if I can match the top line, but it's far away.
    // I'll assume I'll update imports/hook later or use `useExpenseStore.getState().updateExpense`.

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
            className="fixed inset-0 z-50 bg-background flex flex-col pt-safe pb-safe px-6 shadow-2xl rounded-t-[2.5rem]"
        >
            {/* Drag Handle */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full opacity-50" />

            <div className="flex justify-between items-start mb-8 pt-8">
                <div>
                    <h2 className="text-muted-foreground text-sm uppercase tracking-widest mb-2">Total Hoy</h2>
                    <div className="text-6xl font-medium tracking-tighter">
                        ${total.toFixed(2)}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => {
                            hapticFeedback.light();
                            onClose();
                        }}
                        className="p-3 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors self-end"
                    >
                        <ArrowDown className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => {
                            hapticFeedback.light();
                            handleExport();
                        }}
                        className="text-xs font-medium text-accent uppercase tracking-widest hover:underline"
                    >
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                {todaysExpenses.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-20">
                        No hay gastos hoy.<br />Sal a gastar algo.
                    </div>
                ) : (
                    <div className="space-y-6 pb-20">
                        {todaysExpenses.map((expense) => (
                            <div key={expense.id} className="group flex justify-between items-center text-xl font-light border-b border-muted/20 pb-4 last:border-0 pl-2">
                                {editingId === expense.id ? (
                                    <div className="flex-1 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                                        <input
                                            type="text"
                                            value={editCategory}
                                            onChange={(e) => setEditCategory(e.target.value)}
                                            placeholder="Category"
                                            className="w-24 text-sm bg-muted/20 rounded-md px-2 py-1 outline-none"
                                            autoFocus
                                        />
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="flex-1 text-lg bg-transparent border-b border-black/10 outline-none text-right"
                                        />
                                        <button
                                            onClick={() => {
                                                if (!editAmount) return;
                                                updateExpense(expense.id, {
                                                    amount: parseFloat(editAmount),
                                                    category: editCategory
                                                });
                                                hapticFeedback.success();
                                                setEditingId(null);
                                            }}
                                            className="p-2 bg-black text-white rounded-full"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="flex-1 flex justify-between items-center cursor-pointer active:opacity-50 transition-opacity"
                                            onClick={() => startEditing(expense)}
                                        >
                                            <span className="text-muted-foreground mr-4">
                                                {new Date(expense.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                {expense.category && <span className="text-sm capitalize text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">{expense.category}</span>}
                                                <span>${expense.amount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="relative ml-4 w-8 h-8 flex items-center justify-center">
                                            {deletingId === expense.id ? (
                                                <div className="absolute right-0 flex items-center gap-2 bg-white shadow-lg rounded-full p-1 -mr-2 z-10 border border-gray-100">
                                                    <button
                                                        onClick={() => {
                                                            hapticFeedback.light();
                                                            setDeletingId(null);
                                                        }}
                                                        className="p-1 px-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            hapticFeedback.medium();
                                                            removeExpense(expense.id);
                                                            setDeletingId(null);
                                                        }}
                                                        className="p-1 px-3 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        hapticFeedback.light();
                                                        setDeletingId(expense.id);
                                                    }}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-100"
                                                    title="Eliminar gasto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
