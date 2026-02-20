import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft, Plus, X, Users, Receipt, Scale, HandCoins,
    Send, Trash2, UserPlus, Crown, Search, Activity,
    BarChart3, Percent, TrendingUp, PieChart, CheckCircle, CreditCard,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_BACKEND_URL;
const headers = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const me = () => JSON.parse(localStorage.getItem("user") || "{}");

const TABS = [
    { key: "expenses", label: "Expenses", icon: Receipt },
    { key: "members", label: "Members", icon: Users },
    { key: "balances", label: "Balances", icon: Scale },
    { key: "settlements", label: "Settlements", icon: HandCoins },
    { key: "activity", label: "Activity", icon: Activity },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function GroupDetailPage() {
    const { groupId } = useParams();
    const [tab, setTab] = useState("expenses");
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balanceData, setBalanceData] = useState({ balances: [], transactions: [] });
    const [settlements, setSettlements] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [showSettle, setShowSettle] = useState(false);

    const fetchGroup = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/groups/${groupId}`, headers());
            setGroup(res.data.data);
        } catch (err) { console.error(err); }
    }, [groupId]);

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/groups/${groupId}/expenses`, headers());
            setExpenses(res.data.data || []);
        } catch (err) { console.error(err); }
    }, [groupId]);

    const fetchBalances = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/groups/${groupId}/balances`, headers());
            setBalanceData(res.data.data || { balances: [], transactions: [] });
        } catch (err) { console.error(err); }
    }, [groupId]);

    const fetchSettlements = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/groups/${groupId}/settlements`, headers());
            setSettlements(res.data.data || []);
        } catch (err) { console.error(err); }
    }, [groupId]);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/groups/${groupId}/activity`, headers());
            setActivityLogs(res.data.data || []);
        } catch (err) { console.error(err); }
    }, [groupId]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/groups/${groupId}/analytics`, headers());
            setAnalytics(res.data.data || null);
        } catch (err) { console.error(err); }
    }, [groupId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchGroup();
            await Promise.all([fetchExpenses(), fetchBalances(), fetchSettlements(), fetchActivity(), fetchAnalytics()]);
            setLoading(false);
        };
        init();
    }, [fetchGroup, fetchExpenses, fetchBalances, fetchSettlements, fetchActivity, fetchAnalytics]);

    const myId = me()._id || me().id;
    const isAdmin = group?.members?.some(
        (m) => (m.userId?._id || m.userId) === myId && m.role === "admin"
    );

    const deleteExpense = async (expenseId) => {
        if (!confirm("Delete this expense? (soft delete)")) return;
        try {
            await axios.delete(`${API}/api/groups/${groupId}/expenses/${expenseId}`, headers());
            fetchExpenses(); fetchBalances(); fetchActivity();
        } catch (err) { alert(err.response?.data?.message || "Error"); }
    };

    const removeMember = async (memberId) => {
        if (!confirm("Remove this member?")) return;
        try {
            await axios.delete(`${API}/api/groups/${groupId}/members/${memberId}`, headers());
            fetchGroup(); fetchActivity();
        } catch (err) { alert(err.response?.data?.message || "Error"); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground section-padding">Loading...</div>;
    if (!group) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground section-padding">Group not found</div>;

    return (
        <div className="min-h-screen bg-background text-foreground font-inter section-padding">
            <Navbar />
            <div className="max-w-6xl mt-[10vh] mx-auto px-4 sm:px-6 py-2">
                <Link to="/groups" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm mb-6 transition-colors font-medium">
                    <ArrowLeft size={16} /> Back to Groups
                </Link>

                <div className="mb-8 md:mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2">{group.name}</h1>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="uppercase tracking-wider font-semibold text-xs bg-muted px-2.5 py-1 rounded-md">{group.type}</span>
                                <span>•</span>
                                <span>{group.currency}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Users size={14} /> {group.members?.length} members</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-nowrap sm:flex-wrap gap-1 bg-card border border-border/60 p-1.5 rounded-2xl mb-8 overflow-x-auto sm:overflow-x-visible shadow-sm no-scrollbar">

                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary ${tab === key
                                ? "bg-[#47b1e294] text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}>
                            <Icon size={16} strokeWidth={2.5} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                <div className="animate-fade-in-up">
                    {tab === "expenses" && <ExpensesTab expenses={expenses} onAdd={() => setShowAddExpense(true)} onDelete={deleteExpense} myId={myId} isAdmin={isAdmin} />}
                    {tab === "members" && <MembersTab group={group} groupId={groupId} isAdmin={isAdmin} onInvite={() => setShowInvite(true)} onRemove={removeMember} myId={myId} />}
                    {tab === "balances" && <BalancesTab data={balanceData} myId={myId} groupCurrency={group.currency} onSettle={() => setShowSettle(true)} />}
                    {tab === "settlements" && <SettlementsTab settlements={settlements} onAdd={() => setShowSettle(true)} />}
                    {tab === "activity" && <ActivityTab logs={activityLogs} />}
                    {tab === "analytics" && <AnalyticsTab data={analytics} currency={group.currency} />}
                </div>
            </div>

            {showAddExpense && <AddExpenseModal group={group} groupId={groupId} onClose={() => setShowAddExpense(false)}
                onDone={() => { setShowAddExpense(false); fetchExpenses(); fetchBalances(); fetchActivity(); }} />}
            {showInvite && <InviteModal groupId={groupId} onClose={() => setShowInvite(false)} onDone={() => { setShowInvite(false); fetchGroup(); fetchActivity(); }} />}
            {showSettle && <SettleModal group={group} groupId={groupId} onClose={() => setShowSettle(false)}
                onDone={() => { setShowSettle(false); fetchSettlements(); fetchBalances(); fetchActivity(); }} />}
        </div>
    );
}

/* ═══════════ TAB COMPONENTS ═══════════ */

function ExpensesTab({ expenses, onAdd, onDelete, myId, isAdmin }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Group Expenses</h2>
                <button onClick={onAdd} className="flex items-center gap-2 bg-[#22c55ed6] text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all transform active:scale-95">
                    <Plus size={18} strokeWidth={2.5} /> Add Expense
                </button>
            </div>
            {expenses.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border/50 rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium mb-1">No expenses yet</p>
                    <p className="text-muted-foreground text-sm">Add the first expense to get started!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {expenses.map((exp) => {
                        const canDelete = isAdmin || (exp.createdBy?._id || exp.createdBy) === myId;
                        return (
                            <div key={exp._id} className="group bg-card border border-border/60 hover:border-primary/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <h3 className="font-bold text-foreground truncate text-lg group-hover:text-primary transition-colors">{exp.title}</h3>
                                        {exp.splitType !== "equal" && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                                                {exp.splitType === "percentage" && <Percent size={10} />}
                                                {exp.splitType}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Paid by <span className="font-medium text-foreground">{exp.paidBy?.name || "Unknown"}</span> •{" "}
                                        {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {exp.category}
                                    </p>
                                    {exp.notes && <p className="text-xs text-muted-foreground mt-1.5 italic bg-muted/20 p-1.5 rounded-lg inline-block">"{exp.notes}"</p>}
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <span className="text-xl font-bold text-foreground tracking-tight">₹{exp.amount.toLocaleString()}</span>
                                    {canDelete && (
                                        <button
                                            onClick={() => onDelete(exp._id)}
                                            className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Expense"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function MembersTab({ group, groupId, isAdmin, onInvite, onRemove, myId }) {
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [inviteMsg, setInviteMsg] = useState("");

    const searchUsers = async () => {
        if (searchEmail.length < 2) return;
        setSearching(true);
        try {
            const res = await axios.get(`${API}/api/users/search?email=${searchEmail}`, headers());
            setSearchResults(res.data.data || []);
        } catch (err) { console.error(err); }
        setSearching(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => { if (searchEmail.length >= 2) searchUsers(); else setSearchResults([]); }, 400);
        return () => clearTimeout(timer);
    }, [searchEmail]);

    const sendInvite = async (email) => {
        try {
            const res = await axios.post(`${API}/api/groups/${groupId}/invite`, { email }, headers());
            setInviteMsg(res.data.message);
            setSearchEmail("");
            setSearchResults([]);
            setTimeout(() => setInviteMsg(""), 3000);
        } catch (err) {
            setInviteMsg(err.response?.data?.message || "Failed to invite");
        }
    };

    const memberIds = group.members?.map((m) => (m.userId?._id || m.userId)) || [];

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Members ({group.members?.length})</h2>
                </div>

                <div className="grid gap-3">
                    {group.members?.map((m) => {
                        const user = m.userId;
                        const uid = user?._id || user;
                        const isMe = uid === myId;
                        return (
                            <div key={uid} className={`bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-sm ${isMe ? "ring-2 ring-primary/10 bg-primary/5" : ""}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                                        {user?.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground flex items-center gap-2">
                                            {user?.name || "Unknown"}
                                            {isMe && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>}
                                            {m.role === "admin" && <Crown size={14} className="text-amber-500 fill-amber-500" />}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                {isAdmin && uid !== myId && (
                                    <button
                                        onClick={() => onRemove(uid)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Email Search UI */}
            <div className="md:col-span-1">
                {isAdmin ? (
                    <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-lg sticky top-24">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
                            <UserPlus size={16} className="text-primary" /> Add Member
                        </h3>
                        <div className="relative mb-4">
                            <div className="flex items-center border border-input rounded-xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                <Search size={18} className="ml-3 text-muted-foreground" />
                                <input type="text" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)}
                                    placeholder="Search by email..." className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground" />
                            </div>

                            {/* Search Results Dropdown */}
                            {searchEmail.length >= 2 && (
                                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                                    {searching ? <p className="text-xs text-muted-foreground p-2">Searching...</p> : searchResults.length > 0 ? (
                                        searchResults.map((u) => {
                                            const isMember = memberIds.includes(u._id);
                                            return (
                                                <div key={u._id} className="flex items-center justify-between bg-muted/50 rounded-xl p-3 border border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                                                            {u.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-foreground truncate">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{u.email}</p>
                                                        </div>
                                                    </div>
                                                    {isMember ? (
                                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full font-bold">Member</span>
                                                    ) : (
                                                        <button onClick={() => sendInvite(u.email)} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-all font-medium">
                                                            Invite
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="bg-muted/50 rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center border border-border/50">
                                            <p className="text-xs text-muted-foreground">No user found for "{searchEmail}"</p>
                                            <button onClick={() => sendInvite(searchEmail)} className="text-xs bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-all font-semibold w-full">
                                                Invite via Email
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {inviteMsg && (
                            <div className={`p-3 rounded-xl text-xs font-medium ${inviteMsg.includes("Failed") ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                                {inviteMsg}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-muted/30 border border-dashed border-border rounded-xl p-6 text-center">
                        <p className="text-sm text-muted-foreground">Only admins can invite new members.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function BalancesTab({ data, myId, groupCurrency, onSettle }) {
    const generateUpiLink = (amount, receiverName) => {
        return `upi://pay?am=${amount}&cu=${groupCurrency || "INR"}&tn=Settlement to ${receiverName}`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Balances</h2>
                <button onClick={onSettle} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95">
                    <HandCoins size={18} strokeWidth={2.5} /> Settle Up
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {data.balances.map((b) => {
                    const isPositive = b.balance > 0;
                    const isNegative = b.balance < 0;
                    const isSettled = b.balance === 0;

                    return (
                        <div key={b.userId} className={`relative overflow-hidden bg-card border rounded-2xl p-5 shadow-sm transition-all ${isSettled ? "border-border/50 opacity-70" : "border-border hover:shadow-md"}`}>
                            {/* Decorative Background */}
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 -mr-10 -mt-10 ${isPositive ? "bg-emerald-500" : isNegative ? "bg-red-500" : "bg-gray-500"}`}></div>

                            <div className="relative z-10">
                                <p className="font-bold text-foreground text-lg mb-1 flex items-center gap-2">
                                    {b.user?.name}
                                    {b.userId === myId && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                </p>
                                <p className="text-sm text-muted-foreground mb-3">{b.user?.email}</p>

                                <div className="flex items-baseline gap-1">
                                    <p className={`text-2xl font-bold tracking-tight ${isPositive ? "text-emerald-600" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
                                        {isPositive ? "+" : ""}₹{Math.abs(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${isPositive ? "text-emerald-600" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
                                    {isPositive ? "gets back" : isNegative ? "owes" : "settled up"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Scale size={16} /> Simplified Settlements
                </h3>
                {data.transactions.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                            <CheckCircle size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-foreground">All settled up!</h4>
                        <p className="text-muted-foreground text-sm mt-1">No pending debts in this group.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.transactions.map((t, i) => {
                            const isMe = t.from === myId;
                            return (
                                <div key={i} className="bg-muted/30 border border-border/50 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="flex items-center gap-3 text-sm flex-1">
                                            <span className="font-bold text-foreground text-base">{t.fromUser?.name}</span>
                                            <div className="flex flex-col items-center px-2">
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Pays</span>
                                                <div className="w-20 h-0.5 bg-border relative">
                                                    <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-border rotate-45"></div>
                                                </div>
                                            </div>
                                            <span className="font-bold text-foreground text-base">{t.toUser?.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <span className="text-lg font-bold text-foreground">₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        {isMe && (
                                            <a href={generateUpiLink(t.amount, t.toUser?.name)} target="_blank" rel="noopener noreferrer"
                                                className="text-xs bg-[#47b1e294] text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-hover font-semibold transition-all shadow-sm">
                                                Pay Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function SettlementsTab({ settlements, onAdd }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Settlements</h2>
                <button onClick={onAdd} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95">
                    <HandCoins size={18} strokeWidth={2.5} /> Record Payment
                </button>
            </div>
            {settlements.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border/50 rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HandCoins size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">No settlements recorded yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {settlements.map((s) => (
                        <div key={s._id} className="bg-card border border-border/60 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-base text-foreground font-medium">
                                        <span className="font-bold">{s.payerId?.name}</span> paid <span className="font-bold">{s.receiverId?.name}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <span>{new Date(s.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                                        <span className="uppercase">{s.paymentMode}</span>
                                        {s.notes && (
                                            <>
                                                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                                                <span className="italic">"{s.notes}"</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <span className="font-bold text-emerald-600 text-lg">₹{s.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ActivityTab({ logs }) {
    const actionIcons = {
        group_created: "🎉", expense_added: "💸", expense_deleted: "🗑️",
        member_added: "👤", member_removed: "❌", settlement_done: "🤝", invite_sent: "📨",
    };

    return (
        <div className="">
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-6">Activity Log</h2>
            {logs.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border/50 rounded-2xl shadow-sm">
                    <Activity size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground">No recent activity</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pl-8 py-2">
                    {logs.map((log) => (
                        <div key={log._id} className="relative">
                            <span className="absolute -left-[45px] top-0 w-8 h-8 flex items-center justify-center bg-card border border-border rounded-full text-lg shadow-sm z-10">
                                {actionIcons[log.action] || "📝"}
                            </span>
                            <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                                <p className="text-sm text-foreground leading-relaxed">
                                    <span className="font-bold text-primary">{log.userId?.name || "Unknown"}</span>{" "}
                                    <span className="text-muted-foreground">{log.details}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">
                                    {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AnalyticsTab({ data, currency }) {
    if (!data) return <div className="text-center py-16 text-muted-foreground">Loading analytics...</div>;

    const maxCat = data.categoryBreakdown?.[0]?.amount || 1;

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-6">Group Analytics</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#00aaff] rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Total Spending</p>
                    <p className="text-3xl font-bold">₹{data.totalSpending?.toLocaleString()}</p>
                </div>
                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Transactions</p>
                    <p className="text-3xl font-bold text-foreground">{data.totalExpenses}</p>
                </div>
                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Crown size={64} />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Spender</p>
                    <p className="text-xl font-bold text-primary truncate">{data.topSpenders?.[0]?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground mt-1">₹{data.topSpenders?.[0]?.total?.toLocaleString() || 0}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Category Breakdown */}
                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm h-full">
                    <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-wide">
                        <PieChart size={16} className="text-primary" /> Category Breakdown
                    </h3>
                    {data.categoryBreakdown?.length ? (
                        <div className="space-y-5">
                            {data.categoryBreakdown.map((c) => (
                                <div key={c.category}>
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-foreground">{c.category}</span>
                                        <span className="text-muted-foreground">₹{c.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(c.amount / maxCat * 100).toFixed(1)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No data available yet.</p>}
                </div>

                {/* Monthly Trend */}
                <div className="space-y-6">
                    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <TrendingUp size={16} className="text-primary" /> Top Spenders
                        </h3>
                        <div className="space-y-0 text-sm">
                            {data.topSpenders?.map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                                            {i + 1}
                                        </div>
                                        <span className="font-semibold text-foreground">{s.name}</span>
                                    </div>
                                    <span className="font-bold text-foreground">₹{s.total.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {data.monthlyTrend?.length > 0 && (
                        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-wide">
                                <BarChart3 size={16} className="text-primary" /> Monthly Trend
                            </h3>
                            <div className="space-y-2">
                                {data.monthlyTrend.map((m) => (
                                    <div key={m.month} className="flex items-center justify-between py-2 px-2 hover:bg-muted/30 rounded-lg transition-colors">
                                        <span className="text-sm font-medium text-muted-foreground">{m.month}</span>
                                        <span className="text-sm font-bold text-foreground">₹{m.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════ MODAL COMPONENTS ═══════════ */

function AddExpenseModal({ group, groupId, onClose, onDone }) {
    const [form, setForm] = useState({
        title: "", amount: "", category: "General", notes: "",
        paidBy: me()._id || me().id || "",
        splitType: "equal",
        participants: group.members.map((m) => m.userId?._id || m.userId),
        customSplits: {},
        percentSplits: {},
    });
    const [error, setError] = useState("");

    const update = (f, v) => setForm((prev) => ({ ...prev, [f]: v }));

    const toggleParticipant = (uid) => {
        setForm((f) => ({
            ...f,
            participants: f.participants.includes(uid) ? f.participants.filter((id) => id !== uid) : [...f.participants, uid],
        }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        const body = {
            title: form.title, amount: Number(form.amount), category: form.category,
            notes: form.notes, paidBy: form.paidBy, splitType: form.splitType,
        };

        if (form.splitType === "equal") {
            body.participants = form.participants;
        } else if (form.splitType === "custom") {
            body.splits = Object.entries(form.customSplits).map(([userId, amt]) => ({ userId, amount: Number(amt) }));
        } else if (form.splitType === "percentage") {
            const percentTotal = Object.values(form.percentSplits).reduce((s, v) => s + Number(v || 0), 0);
            if (Math.abs(percentTotal - 100) > 0.01) {
                setError(`Percentages must total 100% (currently ${percentTotal}%)`);
                return;
            }
            body.splits = Object.entries(form.percentSplits).map(([userId, pct]) => ({ userId, percentage: Number(pct) }));
        }

        try {
            await axios.post(`${API}/api/groups/${groupId}/expenses`, body, headers());
            onDone();
        } catch (err) { setError(err.response?.data?.message || "Failed to add expense"); }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-border/50 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-border bg-muted/10 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Add Expense</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-6">
                    {error && <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-sm mb-4 font-medium border border-destructive/20">{error}</div>}

                    <form id="add-expense-form" onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Title</label>
                            <input required value={form.title} onChange={(e) => update("title", e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="What is this for?" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Amount (₹)</label>
                                <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update("amount", e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground font-bold text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
                                <input value={form.category} onChange={(e) => update("category", e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Food, Travel..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Paid By</label>
                            <div className="relative">
                                <select value={form.paidBy} onChange={(e) => update("paidBy", e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                    {group.members.map((m) => {
                                        const u = m.userId;
                                        return <option key={u?._id || u} value={u?._id || u}>{u?.name || "Member"}</option>;
                                    })}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground"><Users size={14} /></div>
                            </div>
                        </div>

                        {/* Split Type Selector */}
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Split Type</label>
                            <div className="flex gap-2 bg-muted/40 p-1 rounded-xl">
                                {["equal", "custom", "percentage"].map((t) => (
                                    <button key={t} type="button" onClick={() => update("splitType", t)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${form.splitType === t ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                                            }`}>
                                        {t === "percentage" && <Percent size={12} />}
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* EQUAL SPLIT */}
                        {form.splitType === "equal" && (
                            <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Split Among</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {group.members.map((m) => {
                                        const u = m.userId; const uid = u?._id || u;
                                        const isSelected = form.participants.includes(uid);
                                        return (
                                            <label key={uid} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted"}`}>
                                                <input type="checkbox" checked={isSelected} onChange={() => toggleParticipant(uid)}
                                                    className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary" />
                                                <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{u?.name || "Member"}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {form.amount && form.participants.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Per person</span>
                                        <span className="font-bold text-foreground">₹{(Number(form.amount) / form.participants.length).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CUSTOM SPLIT */}
                        {form.splitType === "custom" && (
                            <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Custom Amounts</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {group.members.map((m) => {
                                        const u = m.userId; const uid = u?._id || u;
                                        return (
                                            <div key={uid} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-foreground w-24 truncate">{u?.name}</span>
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                                                    <input type="number" min="0" step="0.01" placeholder="0"
                                                        value={form.customSplits[uid] || ""} onChange={(e) => setForm((f) => ({ ...f, customSplits: { ...f.customSplits, [uid]: e.target.value } }))}
                                                        className="w-full pl-6 pr-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs font-medium text-right mt-3 text-muted-foreground">
                                    Total: <span className={Number(form.amount) !== Object.values(form.customSplits).reduce((s, v) => s + Number(v || 0), 0) ? "text-destructive" : "text-emerald-600"}>
                                        ₹{Object.values(form.customSplits).reduce((s, v) => s + Number(v || 0), 0).toFixed(2)}
                                    </span>
                                    {form.amount && ` / ₹${Number(form.amount).toFixed(2)}`}
                                </p>
                            </div>
                        )}

                        {/* PERCENTAGE SPLIT */}
                        {form.splitType === "percentage" && (
                            <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Percentage Split</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {group.members.map((m) => {
                                        const u = m.userId; const uid = u?._id || u;
                                        const pct = Number(form.percentSplits[uid] || 0);
                                        const amt = form.amount ? (Number(form.amount) * pct / 100).toFixed(2) : "0.00";
                                        return (
                                            <div key={uid} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-foreground w-24 truncate">{u?.name}</span>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <input type="number" min="0" max="100" step="0.1" placeholder="0"
                                                        value={form.percentSplits[uid] || ""} onChange={(e) => setForm((f) => ({ ...f, percentSplits: { ...f.percentSplits, [uid]: e.target.value } }))}
                                                        className="w-24 px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                                                    <span className="text-sm text-muted-foreground">%</span>
                                                    <span className="text-xs text-muted-foreground ml-auto bg-background px-2 py-1 rounded border border-border">₹{amt}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className={`text-xs mt-3 font-semibold text-right ${Math.abs(Object.values(form.percentSplits).reduce((s, v) => s + Number(v || 0), 0) - 100) < 0.01 ? "text-emerald-600" : "text-destructive"}`}>
                                    Total: {Object.values(form.percentSplits).reduce((s, v) => s + Number(v || 0), 0).toFixed(1)}% / 100%
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes (optional)</label>
                            <input value={form.notes} onChange={(e) => update("notes", e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Any details..." />
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t border-border bg-background shrink-0">
                    <button type="submit" form="add-expense-form" className="w-full bg-[#22c55ed6] text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover shadow-lg hover:shadow-primary/20 transition-all transform active:scale-[0.98]">
                        Add Expense
                    </button>
                </div>
            </div>
        </div>
    );
}

function InviteModal({ groupId, onClose, onDone }) {
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchEmail.length >= 2) {
                try {
                    const res = await axios.get(`${API}/api/users/search?email=${searchEmail}`, headers());
                    setSearchResults(res.data.data || []);
                } catch (err) { setSearchResults([]); }
            } else { setSearchResults([]); }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchEmail]);

    const submit = async (email) => {
        setMsg(""); setError("");
        try {
            const res = await axios.post(`${API}/api/groups/${groupId}/invite`, { email }, headers());
            setMsg(res.data.message);
            setSearchEmail("");
            setSearchResults([]);
            if (onDone) setTimeout(onDone, 1500);
        } catch (err) { setError(err.response?.data?.message || "Failed to send invite"); }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 animate-scale-in overflow-hidden">
                <div className="px-6 py-5 border-b border-border bg-muted/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-foreground tracking-tight">Invite Member</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6">
                    {msg && <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-xl text-sm mb-4 border border-emerald-500/20 font-medium">{msg}</div>}
                    {error && <div className="bg-red-500/10 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-500/20 font-medium">{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search by Email</label>
                            <div className="flex items-center border border-input rounded-xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                <Search size={18} className="ml-3 text-muted-foreground" />
                                <input type="text" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)}
                                    placeholder="friend@example.com" className="flex-1 px-3 py-3 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none" />
                            </div>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="space-y-2">
                                {searchResults.map((u) => (
                                    <div key={u._id} className="flex items-center justify-between bg-muted/50 border border-border/50 rounded-xl p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                                                {u.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{u.name}</p>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => submit(u.email)} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-all font-semibold">
                                            Invite
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : searchEmail.length >= 2 ? (
                            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col gap-3 text-center">
                                <p className="text-sm text-muted-foreground">No user found matching this email.</p>
                                <button onClick={() => submit(searchEmail)} className="text-xs bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center gap-1 font-semibold mx-auto">
                                    <Send size={12} /> Invite anyway
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettleModal({ group, groupId, onClose, onDone }) {
    const [form, setForm] = useState({
        payerId: me()._id || me().id || "", receiverId: "", amount: "", paymentMode: "upi", notes: "",
    });
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault(); setError("");
        try {
            await axios.post(`${API}/api/groups/${groupId}/settlements`, form, headers());
            onDone();
        } catch (err) { setError(err.response?.data?.message || "Failed to record settlement"); }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 animate-scale-in overflow-hidden">
                <div className="px-6 py-5 border-b border-border bg-muted/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-foreground tracking-tight">Record Settlement</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {error && <div className="bg-red-500/10 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-500/20 font-medium">{error}</div>}

                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Payer (Who Paid)</label>
                        <div className="relative">
                            <select value={form.payerId} onChange={(e) => setForm({ ...form, payerId: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                                <option value="">Select Member</option>
                                {group.members.map((m) => {
                                    const u = m.userId;
                                    return <option key={u?._id || u} value={u?._id || u}>{u?.name || "Member"}</option>;
                                })}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground"><Users size={14} /></div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Receiver (Who Received)</label>
                        <div className="relative">
                            <select value={form.receiverId} onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                                <option value="">Select Member</option>
                                {group.members.filter((m) => (m.userId?._id || m.userId) !== form.payerId).map((m) => {
                                    const u = m.userId;
                                    return <option key={u?._id || u} value={u?._id || u}>{u?.name || "Member"}</option>;
                                })}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground"><Users size={14} /></div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Amount (₹)</label>
                        <input type="number" required min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground font-bold text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment Mode</label>
                        <div className="relative">
                            <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                                <option value="upi">UPI</option>
                                <option value="cash">Cash</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="other">Other</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground"><CreditCard size={14} /></div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes (optional)</label>
                        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Payment note..." />
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                            <HandCoins size={18} strokeWidth={2.5} /> Record Settlement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
