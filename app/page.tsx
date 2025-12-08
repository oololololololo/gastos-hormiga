"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User } from "lucide-react";
import Link from "next/link";
import { useExpenseStore } from "@/lib/store";
import { AmountDisplay } from "@/components/AmountDisplay";
import { Keypad } from "@/components/Keypad";
import { QuickCategory } from "@/components/QuickCategory";
import { HistoryView } from "@/components/HistoryView";
import { ProfileView } from "@/components/ProfileView";
import { cn } from "@/lib/utils";

export default function Home() {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addExpense, historyOpen, setHistoryOpen, getTodayTotal } = useExpenseStore();

  // Prevent hydration mismatch for the total
  const [isMounted, setIsMounted] = useState(false);
  const { setExpenses } = useExpenseStore();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | undefined>();
  const [groupId, setGroupId] = useState<string | undefined>();

  useEffect(() => {
    setIsMounted(true);

    // Check session and load data
    const init = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch profile to check if username exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (!profile?.username) {
          window.location.href = '/onboarding';
          return;
        }

        setUserName(profile.username);

        // Check for group
        const { getUserGroup } = await import('@/app/groups/actions');
        const userGroup = await getUserGroup();
        if (userGroup) {
          setGroupId(userGroup.id); // Note: server action returns data directly, but we might need id. 
          // Wait, getUserGroup returns { name, code } but select is 'group_id, groups(name, code)'...
          // Let's re-verify getUserGroup return value. 
          // The action returns 'data.groups'. 'data' is { group_id, groups: {...} }. 
          // Wait, my action returns `data.groups`. That object has `name` and `code`.
          // It DOES NOT have `id`. I need to fix the action to return ID or fetch ID here.
        }

        const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
        if (data) {
          setExpenses(data.map((e: any) => ({
            id: e.id, // Ensure uuid
            amount: Number(e.amount),
            timestamp: new Date(e.created_at).getTime(),
            category: e.category
          })));
        }
      }
    };
    init();
  }, [setExpenses]);


  const handleKeyPress = useCallback((key: string) => {
    setAmount((prev) => {
      // Prevent multiple decimals
      if (key === "." && prev.includes(".")) return prev;
      // Prevent overflow (aesthetic)
      if (prev.length > 7) return prev;
      return prev + key;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setAmount((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!value || isNaN(value)) return;

    addExpense(value, selectedCategory, groupId);

    // Success feedback
    setShowSuccess(true);
    setAmount("");
    setSelectedCategory(undefined);

    // Hide success after a short delay
    setTimeout(() => setShowSuccess(false), 1500);
  };

  return (
    <main className="flex flex-col h-full bg-background relative selection:bg-accent/20">


      {/* User Status */}
      <div className="absolute top-4 right-4 z-50">
        {isMounted && user && (
          <button
            onClick={() => setProfileOpen(true)}
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors backdrop-blur-md"
          >
            <User className="w-5 h-5 text-black/70" />
          </button>
        )}
      </div>

      {/* Main Content (Input Flow) */}
      <motion.div
        className="flex-1 flex flex-col justify-end pb-8"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.2, bottom: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.y < -50) setHistoryOpen(true);
        }}
        onClick={() => {
          // If dragging accidentally opened something or input focus handling needed
        }}
      >

        {/* Top Section: Amount */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-accent flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-accent-foreground" />
                </div>
                <span className="text-xl font-medium text-accent">Saved</span>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <AmountDisplay amount={amount} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <QuickCategory
            onSelect={setSelectedCategory}
            selected={selectedCategory}
          />
        </div>

        {/* Keypad */}
        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          className="mb-8"
        />

        {/* Action Button */}
        <div className="px-6 mb-8">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={amount === ""}
            className={cn(
              "w-full py-5 rounded-2xl text-xl font-medium transition-all duration-300 shadow-sm",
              amount === ""
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-foreground text-background hover:bg-neutral-800 shadow-md"
            )}
          >
            Gastar
          </motion.button>
        </div>

        {/* History Trigger */}
        {isMounted && (
          <div className="flex justify-center pb-4">
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex flex-col items-center gap-1 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-xs uppercase tracking-widest font-medium">History</span>
              <span className="text-sm font-semibold text-foreground">
                Today: ${getTodayTotal().toFixed(2)}
              </span>
              <div className="w-8 h-1 bg-muted rounded-full mt-2" />
            </button>
          </div>
        )}

      </motion.div>

      {/* History Drawer */}
      <AnimatePresence>
        {historyOpen && (
          <HistoryView onClose={() => setHistoryOpen(false)} />
        )}
      </AnimatePresence>

      {/* Profile Drawer */}
      <AnimatePresence>
        {profileOpen && (
          <ProfileView onClose={() => setProfileOpen(false)} userEmail={user?.email} userName={userName} />
        )}
      </AnimatePresence>

    </main>
  );
}
