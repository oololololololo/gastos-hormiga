import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Expense {
    id: string;
    amount: number;
    timestamp: number;
    category?: string; // Optional icon identifier
}

interface ExpenseState {
    expenses: Expense[];
    addExpense: (amount: number, category?: string, groupId?: string) => Promise<void>;
    setExpenses: (expenses: Expense[]) => void;
    getTodayTotal: () => number;
    historyOpen: boolean;
    setHistoryOpen: (open: boolean) => void;
}

export const useExpenseStore = create<ExpenseState>()(
    persist(
        (set, get) => ({
            expenses: [],
            historyOpen: false,

            addExpense: async (amount, category, groupId) => {
                const newExpense: Expense = {
                    id: crypto.randomUUID(),
                    amount,
                    timestamp: Date.now(),
                    category,
                };

                // Optimistic update
                set((state) => ({
                    expenses: [newExpense, ...state.expenses],
                }));

                // Sync to Supabase if logged in
                try {
                    const { createClient } = await import('@/lib/supabase/client');
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        await supabase.from('expenses').insert({
                            id: newExpense.id,
                            user_id: user.id,
                            amount: newExpense.amount,
                            category: newExpense.category,
                            group_id: groupId || null,
                            created_at: new Date(newExpense.timestamp).toISOString(),
                        });
                    }
                } catch (error) {
                    console.error("Failed to sync expense:", error);
                }
            },

            setExpenses: (expenses) => set({ expenses }),

            getTodayTotal: () => {
                const { expenses } = get();
                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

                return expenses
                    .filter(e => e.timestamp >= startOfDay)
                    .reduce((sum, e) => sum + e.amount, 0);
            },

            setHistoryOpen: (open) => set({ historyOpen: open }),
        }),
        {
            name: 'gastos-hormiga-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
