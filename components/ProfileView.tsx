'use client';

import { motion } from 'framer-motion';
import { X, LogOut, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { useExpenseStore } from '@/lib/store';
import { useEffect, useState } from 'react';

interface ProfileViewProps {
    onClose: () => void;
    userEmail?: string;
}

export function ProfileView({ onClose, userEmail }: ProfileViewProps) {
    const { expenses } = useExpenseStore();
    const [metrics, setMetrics] = useState({
        totalSpent: 0,
        thisMonthSpent: 0,
        averageDaily: 0,
        count: 0
    });

    useEffect(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const count = expenses.length;

        const thisMonth = expenses
            .filter(e => {
                const d = new Date(e.timestamp);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        // Naive average daily (total / days since first expense or 1)
        let avg = 0;
        if (expenses.length > 0) {
            const firstDate = new Date(Math.min(...expenses.map(e => e.timestamp)));
            const daysDiff = Math.max(1, Math.ceil((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
            avg = total / daysDiff;
        }

        setMetrics({
            totalSpent: total,
            thisMonthSpent: thisMonth,
            averageDaily: avg,
            count
        });
    }, [expenses]);

    const handleLogout = async () => {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-[#F5F5F7] shadow-2xl flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white shadow-sm z-10">
                <h2 className="text-xl font-medium tracking-tight">Perfil</h2>
                <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-gray-500 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* User Card */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-medium text-lg">
                        {userEmail ? userEmail[0].toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {userEmail || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500">Cuenta Personal</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm space-y-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Este Mes</p>
                        <p className="text-2xl font-light tracking-tight">${metrics.thisMonthSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl shadow-sm space-y-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-light tracking-tight">${metrics.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>

                    <div className="col-span-2 p-4 bg-white rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Promedio Diario</p>
                            <p className="text-2xl font-light tracking-tight">${metrics.averageDaily.toFixed(2)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Resumen</h3>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-500">Transacciones Totales</span>
                        <span className="font-medium">{metrics.count}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-500">Moneda</span>
                        <span className="font-medium">USD</span>
                    </div>
                </div>

            </div>

            {/* Footer / Logout */}
            <div className="p-6 bg-white border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </motion.div>
    );
}
