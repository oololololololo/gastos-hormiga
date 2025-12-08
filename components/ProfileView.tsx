onClose: () => void;
userEmail ?: string;
userName ?: string;
}

const AVAILABLE_CURRENCIES = [
    { code: '$', label: 'USD ($)' },
    { code: '€', label: 'EUR (€)' },
    { code: '£', label: 'GBP (£)' },
    { code: 'S/', label: 'PEN (S/)' },
    { code: 'MX$', label: 'MXN ($)' },
    { code: 'ARS', label: 'ARS ($)' },
];

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
            // Optimistic update
            setGroup({ name: inputValue, code: res.code, currency: '$', myRole: 'admin', members: [] });
            setShowCreateInput(false);
            setInputValue('');
            window.location.reload();
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
            window.location.reload();
        }
        setIsLoading(false);
    };

    const handleCurrencyChange = async (newCurrency: string) => {
        if (!group) return;
        const res = await updateGroupCurrency(group.id, newCurrency);
        if (res.success) {
            setGroup({ ...group, currency: newCurrency });
            window.location.reload();
        }
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

    const currencySymbol = group?.currency || '$';

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-[#F5F5F7] shadow-2xl flex flex-col"
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
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {userName || 'Usuario'}
                            </p>
                            {group?.myRole === 'admin' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                </div>

                {/* Groups Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 px-1">Tu Grupo</h3>

                    {group ? (
                        <div className="space-y-4">
                            {/* Group Card */}
                            <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Users className="w-24 h-24" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <Link href="/group" onClick={onClose} className="group hover:opacity-80 transition-opacity">
                                                <h4 className="text-2xl font-light tracking-tight text-gray-900 flex items-center gap-2">
                                                    {group.name}
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 text-sm">Ver panel →</span>
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {group.members?.length} {group.members?.length === 1 ? 'miembro' : 'miembros'}
                                                </p>
                                            </Link>
                                        </div>
                                        {group.myRole === 'admin' && (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={group.currency}
                                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                                    className="text-xs bg-white/50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-black/5 cursor-pointer hover:bg-white transition-colors"
                                                >
                                                    {AVAILABLE_CURRENCIES.map(c => (
                                                        <option key={c.code} value={c.code}>{c.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100 mb-4">
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

                                    {/* Members List */}
                                    {group.members && group.members.length > 0 && (
                                        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Miembros</p>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                {group.members.map((member: any) => (
                                                    <div key={member.userId} className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-gray-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                                {member.name ? member.name[0].toUpperCase() : '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                                <p className="text-[10px] text-gray-500 capitalize">{member.role === 'admin' ? 'Administrador' : 'Miembro'}</p>
                                                            </div>
                                                        </div>
                                                        {member.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
                    <Link href="/dashboard" onClick={onClose} className="p-4 bg-white rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-shadow cursor-pointer block">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Este Mes</p>
                        <p className="text-2xl font-light tracking-tight">{currencySymbol}{metrics.thisMonthSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </Link>

                    <Link href="/dashboard" onClick={onClose} className="p-4 bg-white rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-shadow cursor-pointer block">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-light tracking-tight">{currencySymbol}{metrics.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </Link>

                    <Link href="/dashboard" onClick={onClose} className="col-span-2 p-4 bg-white rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Promedio Diario</p>
                            <p className="text-2xl font-light tracking-tight">{currencySymbol}{metrics.averageDaily.toFixed(2)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </Link>
                </div>

                {/* Dashboard Button */}
                <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Analíticas Personales</p>
                            <p className="text-xs text-blue-600/80">Ver gráficos detallados</p>
                        </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                {/* Stats Summary */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Resumen y Preferencias</h3>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-500">Transacciones Totales</span>
                        <span className="font-medium">{metrics.count}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-500">Moneda del Grupo</span>
                        <span className="font-medium">{group?.currency === '$' ? 'USD ($)' : AVAILABLE_CURRENCIES.find(c => c.code === group?.currency)?.label || group?.currency || 'No asignada'}</span>
                    </div>

                    {/* User Personal Preference (Separate from group) */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-500">Tu Moneda (Personal)</span>
                        <select
                            className="text-sm font-medium bg-transparent outline-none text-right cursor-pointer text-blue-600 hover:text-blue-800"
                            defaultValue="$" // Ideally verify from profile
                            onChange={async (e) => {
                                const { updateUserCurrency } = await import('@/app/actions/features');
                                await updateUserCurrency(e.target.value);
                                window.location.reload();
                            }}
                        >
                            {AVAILABLE_CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.label}</option>
                            ))}
                        </select>
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
