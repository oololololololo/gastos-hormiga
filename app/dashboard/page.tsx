'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getPersonalAnalytics } from '@/app/actions/features';

export default function PersonalDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await getPersonalAnalytics();
        setData(res);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex bg-[#F5F5F7] h-screen items-center justify-center">
                <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    // Process data for charts
    const dailyData = data?.daily || [];
    const categoryData = data?.by_category || [];
    const totalSpent = dailyData.reduce((acc: number, d: any) => acc + d.total, 0);

    // Simple Wave Chart Logic
    const points = dailyData.length > 0 ? dailyData.map((d: any, i: number) => {
        return { x: i, y: d.total };
    }) : [];

    // Normalize points for SVG (100% width, 150px height)
    const width = 100;
    const height = 150;
    const maxVal = Math.max(...points.map((p: any) => p.y), 1);

    // Create Path
    let pathD = `M 0 ${height}`;
    points.forEach((p: any, i: number) => {
        const x = (i / (points.length - 1 || 1)) * width;
        const y = height - (p.y / maxVal) * height * 0.8; // Use 80% height max

        // Smooth curve (simple quadratic approximation for now or direct lines)
        // For true simple wave, we'll try spline later, but let's do lines with simple smoothing CSS first or quadratic curves
        if (i === 0) pathD = `M ${x} ${y}`;
        else {
            // Bezier Control Point (midpoint)
            const prev = points[i - 1];
            const prevX = ((i - 1) / (points.length - 1 || 1)) * width;
            const prevY = height - (prev.y / maxVal) * height * 0.8;
            const cpX = (prevX + x) / 2;
            pathD += ` Q ${cpX} ${prevY} ${x} ${y}`; // Smooth transition? Actually simple Q goes from prev to curr details..
            // Better: L for now for absolute precision or C for smoothness
            // Let's use simple Catmull-Rom or just basic lines for clarity + Area fill
            pathD += ` L ${x} ${y}`;
        }
    });

    // Close path for area
    const areaD = `${pathD} V ${height} H 0 Z`;

    return (
        <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="max-w-xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-light tracking-tight text-[#1D1D1F]">
                            Analíticas
                        </h1>
                        <p className="text-sm text-gray-500">Últimos 30 días</p>
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
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Gasto Total</p>
                            <h2 className="text-3xl font-light tracking-tight mt-1">${totalSpent.toLocaleString()}</h2>
                        </div>
                        <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +2.3%
                        </div>
                    </div>

                    {/* SVG Chart */}
                    <div className="h-[150px] w-full relative">
                        {points.length > 1 ? (
                            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    initial={{ d: `M 0 ${height} L ${width} ${height} L 0 ${height} Z` }}
                                    animate={{ d: areaD }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    fill="url(#gradient)"
                                />
                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1, d: pathD }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-300 text-sm italic">
                                Necesitas más datos para ver la gráfica
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Promedio Diario</p>
                        <p className="text-xl font-semibold mt-1">${(totalSpent / 30).toFixed(0)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Mayor Gasto</p>
                        <p className="text-xl font-semibold mt-1">${Math.max(...points.map((p: any) => p.y), 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Category Bars */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium mb-6">Por Categoría</h3>
                    <div className="space-y-5">
                        {categoryData.length > 0 ? categoryData.map((cat: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{
                                            cat.category.length < 3 ? cat.category : '🏷️'
                                        }</span>
                                        <span className="font-medium text-gray-700 capitalize">{
                                            cat.category.length < 3 ? 'Gasto' : cat.category
                                        }</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">${cat.total.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cat.total / totalSpent) * 100}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                        className={`h-full rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'][i % 4]}`}
                                    />
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 text-sm py-4">Sin gastos registrados por categoría</p>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
