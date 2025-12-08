'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, TrendingUp, Calendar, Users, Crown, Trash2,
    Coffee, Bus, ShoppingBag, Utensils, Home, Car, Gamepad2,
    Dumbbell, Plane, Shirt, Music, Book, Gift, Zap
} from 'lucide-react';
import { getGroupAnalytics, kickMember, updateUserCurrency } from '@/app/actions/features';

export default function GroupDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await getGroupAnalytics();
        if (res?.error) {
            console.error(res.error);
            setAuthError(res.error);
            setData(null);
        } else {
            setData(res);
        }
        setLoading(false);
    };

    const handleKick = async (userId: string) => {
        if (!confirm('¿Estás seguro de expulsar a este miembro?')) return;
        const res = await kickMember(userId, data.group_info.id);
        if (res.success) window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex bg-[#F5F5F7] h-screen items-center justify-center">
                <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F7] p-4 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
            </div>
            <p className="text-gray-900 font-medium text-lg">No se encontró información del grupo</p>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">{authError || "Parece que no perteneces a ningún grupo activo o hubo un error de conexión."}</p>
            <Link href="/" className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">Volver al inicio</Link>
        </div>
    );

    // Data Processing
    const groupInfo = data.group_info;
    const members = data.members_expenses || [];
    const dailyData = data.daily || [];
    const categoryData = data.by_category || [];

    // Calculate total explicitly from daily or members to ensure sync
    const totalSpent = dailyData.reduce((acc: number, d: any) => acc + d.total, 0);

    // Wave Chart Points
    const points = dailyData.length > 0 ? dailyData.map((d: any, i: number) => ({ x: i, y: d.total })) : [];
    const width = 100; // SVG coordinate space
    const height = 150;
    const maxVal = Math.max(...points.map((p: any) => p.y), 1);

    // Path Construction (Same as Personal Dashboard)
    let pathD = `M 0 ${height}`;
    points.forEach((p: any, i: number) => {
        const x = (i / (points.length - 1 || 1)) * width;
        const y = height - (p.y / maxVal) * height * 0.8;
        if (i === 0) pathD = `M ${x} ${y}`;
        else {
            const cpX = (((i - 1) / (points.length - 1 || 1)) * width + x) / 2;
            pathD += ` L ${x} ${y}`;
        }
    });
    const areaD = `${pathD} V ${height} H 0 Z`;

    return (
        <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8">
            <div className="max-w-xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-light tracking-tight text-[#1D1D1F]">
                                {groupInfo.name}
                            </h1>
                            <p className="text-sm text-gray-500">Dashboard de Grupo</p>
                        </div>
                    </div>
                    {/* Currency Badge */}
                    <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-500 shadow-sm border border-gray-100">
                        {groupInfo.currency}
                    </div>
                </div>

                {/* Main Curve Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-sm overflow-hidden relative"
                >
                    <div className="flex justify-between items-end mb-6 relative z-10">
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Gasto Grupal Total</p>
                            <h2 className="text-3xl font-light tracking-tight mt-1">
                                {groupInfo.currency}{totalSpent.toLocaleString()}
                            </h2>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {members.length} miembros
                        </div>
                    </div>

                    {/* SVG Chart */}
                    <div className="h-[150px] w-full relative">
                        {points.length > 1 ? (
                            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="gradientGroup" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    initial={{ d: `M 0 ${height} L ${width} ${height} L 0 ${height} Z` }}
                                    animate={{ d: areaD }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    fill="url(#gradientGroup)"
                                />
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1, d: pathD }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-300 text-sm italic">
                                Sin datos suficientes del grupo
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Members Ranking */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        Miembros
                    </h3>
                    <div className="space-y-4">
                        {members.map((m: any, i: number) => (
                            <div key={m.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-bold text-gray-600 shadow-sm">
                                        {m.name ? m.name[0].toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                            {m.name}
                                            {i === 0 && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                        </p>
                                        <p className="text-xs text-gray-500">{m.transaction_count} pagos</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-900">
                                        {groupInfo.currency}{m.total_spent.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Bars */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-6">Gastos por Categoría</h3>
                    <div className="space-y-5">
                        {categoryData.length > 0 ? categoryData.map((cat: any, i: number) => {
                            // Icon Mapping
                            const icons: Record<string, any> = {
                                "food": Coffee, "transport": Bus, "shopping": ShoppingBag, "meal": Utensils,
                                "home": Home, "car": Car, "game": Gamepad2, "gym": Dumbbell, "travel": Plane,
                                "clothes": Shirt, "music": Music, "study": Book, "gift": Gift, "bills": Zap
                            };
                            const Icon = icons[cat.category] || null;

                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600'][i % 4]}`}>
                                                {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs">{cat.category.substring(0, 2).toUpperCase()}</span>}
                                            </div>
                                            <span className="font-medium text-gray-700 capitalize">
                                                {['food', 'transport', 'shopping', 'meal'].includes(cat.category)
                                                    ? ({ 'food': 'Café', 'transport': 'Transporte', 'shopping': 'Compras', 'meal': 'Comida' }[cat.category as string])
                                                    : cat.category}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{groupInfo.currency}{cat.total.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(cat.total / totalSpent) * 100}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className={`h-full rounded-full ${['bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500'][i % 4]}`}
                                        />
                                    </div>
                                </div>
                            )
                        }) : (
                            <p className="text-center text-gray-400 text-sm py-4">Sin gastos grupales registrados</p>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
