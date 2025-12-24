"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Coffee, Bus, ShoppingBag, Utensils, Plus, X, Trash2,
    Home, Car, Gamepad2, Dumbbell, Plane, Shirt,
    Music, Book, Gift, Wifi, Zap, Droplets, Hammer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createCategory, deleteCategory, getCategories } from "@/app/actions/features";

interface QuickCategoryProps {
    onSelect: (category: string) => void;
    selected?: string;
    className?: string;
}

// Icon Registry - Add more here if needed
const ICON_MAP: Record<string, any> = {
    "food": Coffee,
    "transport": Bus,
    "shopping": ShoppingBag,
    "meal": Utensils,
    "home": Home,
    "car": Car,
    "game": Gamepad2,
    "gym": Dumbbell,
    "travel": Plane,
    "clothes": Shirt,
    "music": Music,
    "study": Book,
    "gift": Gift,
    "bills": Zap,
    "utilities": Droplets,
    "maint": Hammer
};

const DEFAULT_CATEGORIES = [
    { id: "food", icon: "food", label: "Café" },
    { id: "transport", icon: "transport", label: "Transp." },
    { id: "shopping", icon: "shopping", label: "Compras" },
    { id: "meal", icon: "meal", label: "Comida" },
];

const AVAILABLE_ICONS = Object.keys(ICON_MAP).filter(k => !['food', 'transport', 'shopping', 'meal'].includes(k));

export function QuickCategory({ onSelect, selected, className }: QuickCategoryProps) {
    const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Category Form State
    const [selectedIconKey, setSelectedIconKey] = useState("");
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const customCats = await getCategories();
        // Custom cats from DB will come with icon="string_name"
        setCategories([...DEFAULT_CATEGORIES, ...customCats]);
    };

    const handleAdd = async () => {
        if (!selectedIconKey || !newLabel) return;

        const tempId = Math.random().toString();
        // Store the icon KEY (string), not emoji
        const newCat = { id: tempId, icon: selectedIconKey, label: newLabel, isCustom: true };

        setCategories([...categories, newCat]); // Optimistic
        setShowAddForm(false);
        setSelectedIconKey("");
        setNewLabel("");

        // Save to DB
        // We assume createCategory accepts (iconString, label)
        const res = await createCategory(selectedIconKey, newLabel);
        if (res.success) {
            loadCategories(); // Reload to get real ID
        } else {
            alert("Error creating category");
            setCategories(categories.filter(c => c.id !== tempId));
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar categoría?")) return;

        setCategories(categories.filter(c => c.id !== id));
        const res = await deleteCategory(id);
        if (!res.success) {
            loadCategories();
            alert("Error deleting category");
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>

            <div className="flex flex-wrap justify-center gap-6 px-4 w-full max-w-md">
                <AnimatePresence>
                    {categories.map((cat) => {
                        const IconComponent = ICON_MAP[cat.icon] || Coffee; // Fallback
                        const isSelected = selected === cat.label || selected === cat.id; // Support both matching styles if needed

                        return (
                            <motion.div key={cat.id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative group">
                                <button
                                    onClick={() => onSelect(isSelected && !isEditing ? "" : cat.label)} // We pass LABEL as the category identifier for expenses usually
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border",
                                        isSelected
                                            ? "bg-[#1D1D1F] text-white border-transparent shadow-md scale-105"
                                            : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:text-gray-900",
                                        isEditing && cat.id.length > 20 && "animate-pulse border-red-200"
                                    )}
                                >
                                    <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                                </button>

                                {/* Delete Button */}
                                {isEditing && (cat.user_id || cat.id.length > 20) && (
                                    <button
                                        onClick={(e) => handleDelete(cat.id, e)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-10 scale-0 group-hover:scale-100 transition-transform"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}

                                <span className={cn(
                                    "text-[10px] font-medium absolute -bottom-5 left-0 right-0 text-center truncate px-1 transition-colors",
                                    isSelected ? "text-[#1D1D1F]" : "text-gray-400"
                                )}>
                                    {cat.label}
                                </span>
                            </motion.div>
                        );
                    })}

                    {/* Add Button */}
                    <motion.button
                        layout
                        onClick={() => setShowAddForm(true)}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-400 border border-dashed border-gray-200 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Plus className="w-6 h-6" />
                    </motion.button>
                </AnimatePresence>
            </div>

            {/* Toggle Edit Mode */}
            {categories.length > DEFAULT_CATEGORIES.length && (
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-2 hover:underline"
                >
                    {isEditing ? "Hecho" : "Gestionar"}
                </button>
            )}

            {/* Add Category Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Nueva Categoría</h3>
                                <button onClick={() => setShowAddForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">1. Elige un Icono</label>
                                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                                        {AVAILABLE_ICONS.map(iconKey => {
                                            const Icon = ICON_MAP[iconKey];
                                            return (
                                                <button
                                                    key={iconKey}
                                                    onClick={() => setSelectedIconKey(iconKey)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
                                                        selectedIconKey === iconKey
                                                            ? "bg-[#1D1D1F] text-white border-transparent"
                                                            : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                                                    )}
                                                >
                                                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">2. Nombre</label>
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={e => setNewLabel(e.target.value)}
                                        placeholder="Ej: Gimnasio"
                                        className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                        maxLength={12}
                                    />
                                </div>

                                <button
                                    onClick={handleAdd}
                                    disabled={!selectedIconKey || !newLabel}
                                    className="w-full py-3.5 bg-[#1D1D1F] text-white rounded-xl font-medium disabled:opacity-50 hover:bg-black transition-colors"
                                >
                                    Crear Categoría
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
