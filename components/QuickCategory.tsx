"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Bus, ShoppingBag, Plus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createCategory, deleteCategory, getCategories } from "@/app/actions/features";

interface QuickCategoryProps {
    onSelect: (category: string) => void;
    selected?: string;
    className?: string;
}

const DEFAULT_CATEGORIES = [
    { id: "food", icon: "☕", label: "Café" },
    { id: "transport", icon: "🚌", label: "Transporte" },
    { id: "shopping", icon: "🛍️", label: "Compras" },
    { id: "meal", icon: "🍔", label: "Comida" },
];

export function QuickCategory({ onSelect, selected, className }: QuickCategoryProps) {
    const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Category Form State
    const [newEmoji, setNewEmoji] = useState("");
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const customCats = await getCategories();
        // Merge defaults with custom. 
        // Note: For simplicity, we just append them. 
        // In a real app we might want to store defaults in DB too or keep them separate.
        setCategories([...DEFAULT_CATEGORIES, ...customCats]);
    };

    const handleAdd = async () => {
        if (!newEmoji || !newLabel) return;

        // Optimistic update
        const tempId = Math.random().toString();
        const newCat = { id: tempId, icon: newEmoji, label: newLabel, isCustom: true };
        setCategories([...categories, newCat]);
        setShowAddForm(false);
        setNewEmoji("");
        setNewLabel("");

        const res = await createCategory(newEmoji, newLabel);
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

        // Optimistic delete
        setCategories(categories.filter(c => c.id !== id));

        const res = await deleteCategory(id);
        if (!res.success) {
            loadCategories(); // Revert on failure
            alert("Error deleting category");
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>

            <div className="flex flex-wrap justify-center gap-4 px-4 w-full max-w-md">
                <AnimatePresence>
                    {categories.map((cat) => (
                        <motion.div key={cat.id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative">
                            <button
                                onClick={() => onSelect(cat.id === selected && !isEditing ? "" : cat.id)}
                                className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 shadow-sm border border-transparent",
                                    selected === cat.id ? "bg-[#1D1D1F] text-white shadow-md scale-105" : "bg-white hover:bg-gray-50 text-gray-900 border-gray-100",
                                    isEditing && cat.id.length > 10 && "animate-pulse border-red-200" // Highlight custom cats in edit mode (assuming UUIDs are long)
                                )}
                            >
                                {cat.icon}
                            </button>

                            {/* Delete Button (Only for custom categories, identified by long ID usually, or we tag field) */}
                            {isEditing && (cat.user_id || cat.id.length > 20) && (
                                <button
                                    onClick={(e) => handleDelete(cat.id, e)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-10"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            <span className="text-[10px] text-gray-400 font-medium absolute -bottom-5 left-0 right-0 text-center truncate px-1">
                                {cat.label}
                            </span>
                        </motion.div>
                    ))}

                    {/* Add Button */}
                    <motion.button
                        layout
                        onClick={() => setShowAddForm(true)}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-400 border border-dashed border-gray-200 hover:border-gray-300 hover:text-gray-600 transition-colors"
                    >
                        <Plus className="w-6 h-6" />
                    </motion.button>
                </AnimatePresence>
            </div>

            {/* Toggle Edit Mode */}
            {categories.length > DEFAULT_CATEGORIES.length && (
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-4 underline decoration-dotted"
                >
                    {isEditing ? "Listo" : "Editar categorías"}
                </button>
            )}

            {/* Add Category Modal/Overlay */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-medium text-center">Nueva Categoría</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Icono (Emoji)</label>
                                    <input
                                        type="text"
                                        value={newEmoji}
                                        onChange={e => setNewEmoji(e.target.value)}
                                        placeholder="Ej: 🍕"
                                        className="w-full text-center text-4xl p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black/5"
                                        maxLength={2}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={e => setNewLabel(e.target.value)}
                                        placeholder="Ej: Pizzas"
                                        className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                        maxLength={15}
                                    />
                                </div>

                                <button
                                    onClick={handleAdd}
                                    disabled={!newEmoji || !newLabel}
                                    className="w-full py-3 bg-[#1D1D1F] text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    Guardar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
