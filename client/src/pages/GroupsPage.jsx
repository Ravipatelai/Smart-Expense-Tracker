import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Plus, Users, MapPin, Home, Sparkles, Layers, X,
    Mail, CheckCircle, XCircle, ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_BACKEND_URL;
const headers = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const TYPE_ICONS = {
    trip: MapPin,
    flat: Home,
    friends: Users,
    custom: Layers,
};

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [invites, setInvites] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", type: "friends", currency: "INR" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [gRes, iRes] = await Promise.all([
                axios.get(`${API}/api/groups`, headers()),
                axios.get(`${API}/api/invites`, headers()),
            ]);
            setGroups(gRes.data.data || []);
            setInvites(iRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const createGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/api/groups`, form, headers());
            setShowCreate(false);
            setForm({ name: "", type: "friends", currency: "INR" });
            navigate(`/groups/${res.data.data._id}`);
        } catch (err) {
            alert(err.response?.data?.message || "Error creating group");
        }
    };

    const handleInvite = async (inviteId, action) => {
        try {
            await axios.post(`${API}/api/invites/${inviteId}/${action}`, {}, headers());
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Error");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-inter section-padding">
            <Navbar />
            <div className="max-w-6xl mt-[10vh] mx-auto px-4 sm:px-6 py-2">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Shared Wallets</h1>
                        <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-lg">
                            Manage shared expenses with friends, flatmates, and travel buddies effortlessly.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 bg-[#47b1e294] text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-hover shadow-lg hover:shadow-primary/25 transition-all transform active:scale-95"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Create New Group
                    </button>
                </div>

                {/* Pending Invites */}
                {invites.length > 0 && (
                    <div className="mb-10 animate-fade-in-up">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                            <Mail size={14} /> Pending Invitations ({invites.length})
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {invites.map((inv) => (
                                <div key={inv._id}
                                    className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group"
                                >
                                    <div>
                                        <p className="font-bold text-foreground text-lg">{inv.groupId?.name || "Group"}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Invited by <span className="font-medium text-foreground">{inv.invitedBy?.name}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleInvite(inv._id, "accept")}
                                            className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                            title="Accept"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleInvite(inv._id, "reject")}
                                            className="p-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                                            title="Reject"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Groups Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-muted rounded-full mb-4"></div>
                            <div className="h-4 w-32 bg-muted rounded"></div>
                        </div>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-24 bg-card rounded-3xl border border-border/50 shadow-sm">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No groups yet</h3>
                        <p className="text-muted-foreground text-sm mb-6">Create a group to start splitting expenses!</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="text-primary font-semibold text-sm hover:underline underline-offset-4"
                        >
                            Create your first group
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up-1">
                        {groups.map((g) => {
                            const Icon = TYPE_ICONS[g.type] || Users;
                            return (
                                <Link
                                    key={g._id}
                                    to={`/groups/${g._id}`}
                                    className="group bg-card border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                                        <ChevronRight size={20} className="text-primary" />
                                    </div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3.5 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                            <Icon size={24} strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-foreground text-xl mb-1 tracking-tight group-hover:text-primary transition-colors">
                                        {g.name}
                                    </h3>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                        {g.type} <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span> {g.currency}
                                    </p>

                                    <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 py-2 px-3 rounded-lg w-fit">
                                        <Users size={14} />
                                        <span className="font-medium text-foreground">{g.members?.length || 0}</span> members
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 animate-scale-in overflow-hidden">
                        <div className="px-6 py-5 border-b border-border bg-muted/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-foreground tracking-tight">Create New Group</h2>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={createGroup} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Group Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Summer Trip 2024"
                                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Type</label>
                                    <div className="relative">
                                        <select
                                            value={form.type}
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="friends">Friends</option>
                                            <option value="trip">Trip</option>
                                            <option value="flat">Flat/House</option>
                                            <option value="custom">Other</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
                                            <Layers size={14} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Currency</label>
                                    <input
                                        type="text"
                                        value={form.currency}
                                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-[#47b1e294] text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover shadow-lg hover:shadow-primary/20 transition-all transform active:scale-[0.98]"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
