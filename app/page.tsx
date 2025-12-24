"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User, TrendingUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useExpenseStore } from "@/lib/store";
import { AmountDisplay } from "@/components/AmountDisplay";
import { Keypad } from "@/components/Keypad";
import { QuickCategory } from "@/components/QuickCategory";
import { HistoryView } from "@/components/HistoryView";
import { ProfileView } from "@/components/ProfileView";
import { cn } from "@/lib/utils";
import { hapticFeedback } from '@/lib/haptics';
import { playClick } from '@/lib/sounds';

export default function Home() {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addExpense, historyOpen, setHistoryOpen, getTodayTotal } = useExpenseStore();

  // Prevent hydration mismatch for the total
  const [isMounted, setIsMounted] = useState(false);
  const { setExpenses } = useExpenseStore();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | undefined>();
  const [activeGroup, setActiveGroup] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);

    const init = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch profile
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
          setActiveGroup(userGroup);
        }

        // Fetch user expenses
        const { data } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setExpenses(data.map((e: any) => ({
            id: e.id,
            amount: Number(e.amount),
            timestamp: new Date(e.created_at).getTime(),
            category: e.category
          })));
        }
      }
    };
    init();
  }, [setExpenses]);

  // Success Timer
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);


  const handleKeyPress = (key: string) => {
    playClick(); // Click sound for all keys
    if (key === 'BACKSPACE') {
      hapticFeedback.light();
      setAmount(prev => prev.slice(0, -1));
    } else if (key === '.') {
      hapticFeedback.light();
      if (amount.includes('.')) return;
      if (amount === '') {
        setAmount('0.'); // Smart Input
      } else {
        setAmount(prev => prev + '.');
      }
    } else {
      hapticFeedback.light();
      // Strict limit to prevent overflow (User preference)
      if (amount.length >= 6) return;

      // Removes initial 0 if user types a number? No, allow 0.5 etc. 
      // But if user typed 0. then 5 -> 0.5.
      // If user types 0 then 5 -> 05 (bad).
      if (amount === '0') {
        setAmount(key);
      } else {
        setAmount(prev => prev + key);
      }
    }
  };

  const handleCategorySelect = (category: string) => {
    hapticFeedback.medium();
    setSelectedCategory(category);
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) === 0) return;

    hapticFeedback.success();
    setSuccess(true);

    await addExpense(parseFloat(amount), selectedCategory, activeGroup?.id); // activeGroup might be missing id structure check
    // Note: ensure activeGroup has id or adjust logic if needed. 
    // Based on previous code, userGroup return usually had { group_id } or similar.

    setAmount('');
    setSelectedCategory('');
  };

  return (
    <main className="flex flex-col h-full bg-background relative selection:bg-accent/20">

      {/* User Status */}
      <div className="absolute top-8 right-8 z-50">
        {isMounted && user && (
          <button
            onClick={() => {
              hapticFeedback.light();
              setProfileOpen(true);
            }}
            className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors backdrop-blur-md"
          >
            <User className="w-6 h-6 text-black/70" />
          </button>
        )}
      </div>

      {/* Analytics Link */}
      <div className="absolute top-8 left-8 z-50">
        <Link
          href="/dashboard"
          onClick={() => hapticFeedback.light()}
          className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors backdrop-blur-md"
        >
          <TrendingUp className="w-6 h-6 text-black/70" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] relative">

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-none"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
                <p className="text-xl font-medium text-green-600">¡Guardado!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Amount Display */}
        <div className="flex-1 flex flex-col justify-center items-center px-6">
          <AmountDisplay amount={amount} />

          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium capitalize"
            >
              {selectedCategory}
            </motion.div>
          )}
        </div>

        {/* Keypad Area */}
        <div className="bg-surface/50 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] border-t border-white/50">
          <div className="p-6 pb-60 space-y-6">
            <QuickCategory
              selected={selectedCategory}
              onSelect={handleCategorySelect}
            />

            <Keypad
              onKeyPress={handleKeyPress}
              onDelete={() => {
                playClick();
                hapticFeedback.light();
                setAmount(prev => prev.slice(0, -1));
              }}
            />

            <div className="flex justify-center pt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={!amount}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all",
                  amount ? "bg-[#1D1D1F] text-white shadow-black/20" : "bg-gray-100/50 text-gray-300 shadow-none"
                )}
              >
                <Check className="w-8 h-8" strokeWidth={3} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* History Toggle Button (Bottom Bar) */}
      {
        !historyOpen && !profileOpen && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-5 left-0 right-0 flex justify-center z-30 pointer-events-none"
          >
            <button
              onClick={() => {
                hapticFeedback.light();
                setHistoryOpen(true);
              }}
              className="pointer-events-auto bg-black text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium hover:scale-105 active:scale-95 transition-all"
            >
              Ver Historial
              <ArrowDown className="w-4 h-4 ml-1" />
            </button>
          </motion.div>
        )
      }


      {/* History Drawer */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <HistoryView onClose={() => setHistoryOpen(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Profile Drawer */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <ProfileView onClose={() => setProfileOpen(false)} userEmail={user?.email} userName={userName} />
          </>
        )}
      </AnimatePresence>

    </main >
  );
}
