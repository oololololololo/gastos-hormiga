'use client';

import { motion } from 'framer-motion';
import { X, LogOut, TrendingUp, Calendar, CreditCard, Users, Plus, Link as LinkIcon, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { useExpenseStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { createGroup, getUserGroup, joinGroup } from '@/app/groups/actions';

interface ProfileViewProps {
    onClose: () => void;
    userEmail?: string;
    userName?: string;
}

export function ProfileView({ onClose, userEmail, userName }: ProfileViewProps) {
    const { expenses } = useExpenseStore();
    const [metrics, setMetrics] = useState({
        totalSpent: 0,
        thisMonthSpent: 0,
        averageDaily: 0,
        count: 0
    });

    const [group, setGroup] = useState<any>(null);
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // ... metrics logic ...
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

        // Fetch user group
        const fetchGroup = async () => {
            const userGroup = await getUserGroup();
            setGroup(userGroup);
        };
        fetchGroup();
    }, [expenses]);

    const handleCreateGroup = async () => {
        setIsLoading(true);
        setError('');
        const res = await createGroup(inputValue);
        if (res.error) {
            setError(res.error);
        } else {
            setGroup({ name: inputValue, code: res.code });
            setShowCreateInput(false);
            setInputValue('');
        }
        setIsLoading(false);
    };

    const handleJoinGroup = async () => {
        setIsLoading(true);
        setError('');
        const res = await joinGroup(inputValue);
        if (res.error) {
            setError(res.error);
        } else {
            const userGroup = await getUserGroup();
            setGroup(userGroup);
            setShowJoinInput(false);
            setInputValue('');
            window.location.reload(); // Refresh to sync expenses
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.reload();
    };

    const copyCode = () => {
        navigator.clipboard.writeText(group.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                        {userName ? userName[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {userName || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                </div>

                {/* Groups Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 px-1">Grupo</h3>

                    {group ? (
                        <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Users className="w-24 h-24" />
                            </div>

                            <div className="relative z-10">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Tu Grupo</p>
                                <h4 className="text-2xl font-light tracking-tight text-gray-900 mb-4">{group.name}</h4>

                                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500">
                                            <LinkIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Código de Invitación</p>
                                            <p className="font-mono text-lg font-medium tracking-wider text-[#1D1D1F]">{group.code}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={copyCode}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {!showCreateInput && !showJoinInput && (
                                <>
                                    <button
                                        onClick={() => setShowCreateInput(true)}
                                        className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-gray-100"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">Crear Grupo</span>
                                    </button>

                                    <button
                                        onClick={() => setShowJoinInput(true)}
                                        className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-gray-100"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">Unirse</span>
                                    </button>
                                </>
                            )}

                            {(showCreateInput || showJoinInput) && (
                                <div className="col-span-2 bg-white rounded-2xl shadow-sm p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">{showCreateInput ? 'Nuevo Grupo' : 'Unirse a Grupo'}</h4>
                                        <button
                                            onClick={() => {
                                                setShowCreateInput(false);
                                                setShowJoinInput(false);
                                                setError('');
                                                setInputValue('');
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={showCreateInput ? "Nombre del grupo (ej. Casa)" : "Código (ej. AB12CD)"}
                                            className="w-full p-3 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-black/5 outline-none transition-all placeholder:text-gray-400"
                                            autoFocus
                                        />

                                        {error && (
                                            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
                                                <AlertCircle className="w-3 h-3" />
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            onClick={showCreateInput ? handleCreateGroup : handleJoinGroup}
                                            disabled={!inputValue || isLoading}
                                            className="w-full py-3 bg-[#1D1D1F] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                                        >
                                            {isLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                showCreateInput ? 'Crear' : 'Unirse'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
