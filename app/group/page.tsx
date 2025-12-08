'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, TrendingUp, Calendar, Users, Crown,
    Coffee, Bus, ShoppingBag, Utensils, Home, Car, Gamepad2,
    Dumbbell, Plane, Shirt, Music, Book, Gift, Zap, AlertCircle
} from 'lucide-react';
import { getGroupAnalytics } from '@/app/actions/features';

export default function GroupDashboard() {
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<'loading' | 'error' | 'success' | 'no_group'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getGroupAnalytics();

            if (res?.error) {
                console.error("Server Error:", res.error);
                setErrorMessage(res.error);
                setStatus('error');
                return;
            }

            if (!res || !res.group_info) {
                setStatus('no_group');
                return;
            }

            setData(res);
            setStatus('success');
        } catch (e) {
            console.error("Client Error:", e);
            setErrorMessage("Error de conexión al cargar datos.");
            setStatus('error');
        }
    };

    // --- LOADING STATE ---
    if (status === 'loading') {
        return (
            <div className="flex bg-[#F5F5F7] h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-3 border-black/10 border-t-black rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Cargando datos del grupo...</p>
                </div>
            </div>
        );
    }

    // --- ERROR STATE ---
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F7] p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Algo salió mal</h2>
                <p className="text-gray-500 mt-2 max-w-md">{errorMessage}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    Intentar de nuevo
                </button>
                <Link href="/" className="mt-4 text-sm text-gray-400 hover:text-gray-600">Volver al inicio</Link>
            </div>
        );
    }

    // --- NO GROUP STATE ---
    if (status === 'no_group') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F5F5F7] p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">No tienes grupo</h2>
                <p className="text-gray-500 mt-2">Únete a uno o crea el tuyo desde tu perfil.</p>
                <Link href="/" className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                    Volver al inicio
                </Link>
            </div>
        );
    }

    // --- SUCCESS STATE (Render Dashboard) ---
    // Extract data with fallbacks to prevent crashes
    const group = data.group_info || { name: 'Grupo', currency: '$' };
    const members = data.members || [];
    const history = data.history || [];
    const categories = data.categories || [];

    // Calculate totals
    const totalSpent = history.reduce((acc: number, item: any) => acc + (item.total || 0), 0);

    // Chart Prep
    const points = history.length > 0 ? history.map((d: any, i: number) => ({ x: i, y: d.total || 0 })) : [];
    const width = 100;
    const height = 150;
    const maxVal = Math.max(...points.map((p: any) => p.y), 1); // Avoid division by zero

    let pathD = `M 0 ${height}`;
    points.forEach((p: any, i: number) => {
        const x = (i / (points.length - 1 || 1)) * width;
        const y = height - (p.y / maxVal) * height * 0.8;
        if (i === 0) pathD = `M ${x} ${y}`;
        else pathD += ` L ${x} ${y}`;
    });
    const areaD = `${pathD} V ${height} H 0 Z`;

    const ICON_MAP: Record<string, any> = {
        "food": Coffee, "transport": Bus, "shopping": ShoppingBag, "meal": Utensils,
        "home": Home, "car": Car, "game": Gamepad2, "gym": Dumbbell, "travel": Plane,
        "clothes": Shirt, "music": Music, "study": Book, "gift": Gift, "bills": Zap
    };

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
                            <h1 className="text-2xl font-light tracking-tight text-[#1D1D1F] truncate max-w-[200px]">
                                {group.name}
                            </h1>
                            <p className="text-sm text-gray-500">Dashboard de Grupo</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-500 shadow-sm border border-gray-100">
                        {group.currency}
                    </div>
                </div>

                {/* Wave Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-sm overflow-hidden relative"
                >
                    <div className="flex justify-between items-end mb-6 relative z-10">
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Gasto Total (30 días)</p>
                            <h2 className="text-3xl font-light tracking-tight mt-1">
                                {group.currency}{totalSpent.toLocaleString()}
                            </h2>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {members.length}
                        </div>
                    </div>

                    <div className="h-[150px] w-full relative">
                        {points.length > 1 ? (
                            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="gradientGroup" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <path d={areaD} fill="url(#gradientGroup)" />
                                <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-300 text-sm italic border border-dashed border-gray-200 rounded-xl">
                                Registra más gastos para ver la gráfica
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
                        {members.length > 0 ? members.map((m: any, i: number) => (
                            <div key={m.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-bold text-gray-600 shadow-sm">
                                        {m.name ? m.name[0].toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                            {m.name || 'Sin nombre'}
                                            {i === 0 && m.total_spent > 0 && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                        </p>
                                        <p className="text-xs text-gray-500">{m.transaction_count} pagos</p>
                                    </div>
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {group.currency}{m.total_spent.toLocaleString()}
                                </span>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm text-center">No hay miembros (¿cómo es posible?)</p>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-6">Por Categoría</h3>
                    <div className="space-y-5">
                        {categories.length > 0 ? categories.map((cat: any, i: number) => {
                            const Icon = ICON_MAP[cat.category] || null;
                            const percentage = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;

                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600'][i % 4]}`}>
                                                {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs font-bold">{cat.category.substring(0, 2).toUpperCase()}</span>}
                                            </div>
                                            <span className="font-medium text-gray-700 capitalize">
                                                {['food', 'transport', 'shopping', 'meal'].includes(cat.category)
                                                    ? ({ 'food': 'Café', 'transport': 'Transporte', 'shopping': 'Compras', 'meal': 'Comida' }[cat.category as string])
                                                    : cat.category}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{group.currency}{cat.total.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.8 }}
                                            className={`h-full rounded-full ${['bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500'][i % 4]}`}
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-center text-gray-400 text-sm py-8 border border-dashed border-gray-200 rounded-xl">Sin gastos registrados</p>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
