'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trash2, Crown, RefreshCw, LogOut } from 'lucide-react';
import { getGroupAnalytics, kickMember } from '@/app/actions/features';
import { updateGroupCurrency } from '@/app/groups/actions';

const AVAILABLE_CURRENCIES = [
    { code: '$', label: 'USD ($)' },
    { code: '€', label: 'EUR (€)' },
    { code: '£', label: 'GBP (£)' },
    { code: 'S/', label: 'PEN (S/)' },
    { code: 'MX$', label: 'MXN ($)' },
    { code: 'ARS', label: 'ARS ($)' },
];

export default function GroupDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false); // Can be derived from data, but let's check
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await getGroupAnalytics();
        if (res) {
            setData(res);
            // Check if current user is admin (logic relies on knowing my own ID, 
            // but for now let's assume if I can modify currency I am admin.
            // Actually, we need to know "my" ID to know who I am in the list.
            // But RPC returns list. We can check if *I* am the admin by calling getUserGroup 
            // or just checking if the UI allows actions.
            // For now, let's fetch user group to check role properly.
            // But to save requests, let's just enable UI if the server allows it (optimistic) 
            // or check fetched role.
            // The RPC response technically doesn't tell me *who I am*.
            // Let's rely on server rejection for security, and maybe fetch role separately?
            // Actually, let's just fetch getUserGroup for permissions.
            const { getUserGroup } = await import('@/app/groups/actions');
            const groupDetails = await getUserGroup();
            setIsAdmin(groupDetails?.myRole === 'admin');
        }
        setLoading(false);
    };

    const handleKick = async (userId: string) => {
        const res = await kickMember(userId, data.group_info.id);
        if (res.success) {
            loadData();
            setShowDeleteConfirm(null);
        } else {
            alert(res.error || 'Error al eliminar miembro');
        }
    };

    const handleCurrencyChange = async (newCurrency: string) => {
        const res = await updateGroupCurrency(data.group_info.id, newCurrency);
        if (res.success) {
            loadData();
        }
    };

    if (loading) {
        return (
            <div className="flex bg-[#F5F5F7] h-screen items-center justify-center">
                <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col bg-[#F5F5F7] h-screen items-center justify-center p-6 text-center">
                <p className="text-gray-500 mb-4">No se encontró información del grupo.</p>
                <Link href="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
            </div>
        );
    }

    const { group_info, members_expenses } = data;
    const maxSpent = Math.max(...members_expenses.map((m: any) => m.total_spent), 1); // Avoid div by 0

    return (
        <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-light tracking-tight text-[#1D1D1F]">
                            {group_info.name}
                        </h1>
                        <p className="text-sm text-gray-500 font-mono">
                            Código: {group_info.code}
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="ml-auto">
                            <select
                                value={group_info.currency}
                                onChange={(e) => handleCurrencyChange(e.target.value)}
                                className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 shadow-sm outline-none focus:ring-2 focus:ring-black/5"
                            >
                                {AVAILABLE_CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Charts Section */}
                <section className="bg-white rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full" />
                        Gastos por Miembro
                    </h2>

                    <div className="space-y-6">
                        {members_expenses.map((member: any) => (
                            <div key={member.user_id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">{member.name}</span>
                                    <span className="font-semibold">{group_info.currency}{member.total_spent.toLocaleString()}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(member.total_spent / maxSpent) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-[#1D1D1F] rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Member Management (Admin only usually, but visible to all?) */}
                <section className="bg-white rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-orange-500 rounded-full" />
                        Gestión de Miembros
                    </h2>

                    <div className="space-y-4">
                        {members_expenses.map((member: any) => (
                            <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-400 shadow-sm border border-gray-100">
                                        {member.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {member.transaction_count} transacción{member.transaction_count !== 1 ? 'es' : ''}
                                        </p>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        {showDeleteConfirm === member.user_id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                    className="text-xs text-gray-500 px-2 py-1 hover:bg-gray-200 rounded"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleKick(member.user_id)}
                                                    className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-medium"
                                                >
                                                    Expulsar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowDeleteConfirm(member.user_id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}
