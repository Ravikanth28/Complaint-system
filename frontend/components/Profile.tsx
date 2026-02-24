'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    User as UserIcon,
    Mail,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Filter,
    RefreshCcw,
    Inbox,
    MapPin,
    Calendar,
    ArrowUpRight
} from 'lucide-react';

interface Complaint {
    complaintId: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    category: string;
    location: string;
    timestamp: string;
    summary?: string;
}

export default function Profile() {
    const { user, token } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'RESOLVED' | 'PENDING' | 'ANALYZED'>('ALL');
    const [error, setError] = useState<string | null>(null);

    const fetchUserComplaints = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/user/complaints', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch complaints');
            const data = await res.json();
            setComplaints(data.sort((a: Complaint, b: Complaint) =>
                new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
            ));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUserComplaints();
    }, [token]);

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'ALL') return true;
        if (filter === 'RESOLVED') return c.status === 'RESOLVED';
        if (filter === 'PENDING') return ['RAW', 'ANALYZED', 'TRIAGED', 'PENDING'].includes(c.status);
        return c.status === filter;
    });

    const stats = {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length,
        pending: complaints.filter(c => ['RAW', 'ANALYZED', 'TRIAGED', 'PENDING'].includes(c.status)).length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'ANALYZED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency?.toUpperCase()) {
            case 'CRITICAL': return 'text-red-600 bg-red-50';
            case 'HIGH': return 'text-orange-600 bg-orange-50';
            case 'MEDIUM': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-10 animate-in fade-in duration-700">
            {/* Profile Header */}
            <div className="glass rounded-[2.5rem] p-8 md:p-12 border-white/40 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 flex-shrink-0">
                    <UserIcon size={64} strokeWidth={1.5} />
                </div>
                <div className="space-y-4 flex-grow">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600">
                            <Shield size={12} />
                            <span>{user?.role} Profile</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{user?.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 font-medium text-sm">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Inbox size={16} className="text-gray-400" />
                                <span>{user?.userId}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchUserComplaints}
                    disabled={loading}
                    className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Submitted', value: stats.total, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Successfully Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Active Grievances', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-8 rounded-[2rem] border-white/40 space-y-4 group hover:scale-[1.02] transition-all">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Complaints List */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Grievance History
                        <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">{filteredComplaints.length}</span>
                    </h2>

                    <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200/50">
                        {(['ALL', 'PENDING', 'RESOLVED'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Scanning Repository...</p>
                    </div>
                ) : filteredComplaints.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredComplaints.map((c) => (
                            <div key={c.complaintId} className="glass p-6 rounded-[2rem] border-white/40 group hover:border-blue-200 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="flex-grow space-y-3 w-full">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(c.status)}`}>
                                            {c.status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getUrgencyColor(c.urgency)}`}>
                                            {c.urgency || 'MEDIUM'}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <Calendar size={12} />
                                            <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{c.title}</h3>
                                    <div className="flex flex-wrap gap-4 pt-1">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                            <MapPin size={14} className="text-gray-400" />
                                            <span>{c.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                            <Filter size={14} className="text-gray-400" />
                                            <span>{c.category}</span>
                                        </div>
                                    </div>
                                    {c.summary && (
                                        <p className="text-sm text-gray-500 font-medium bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 italic leading-relaxed">
                                            "{c.summary}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-shrink-0 md:self-center">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:scale-110">
                                        <ArrowUpRight size={24} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass p-20 rounded-[3rem] border-white/40 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto">
                            <AlertCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">No grievances found.</h3>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto">
                                You haven't filed any complaints yet. Your history will appear here once you synchronize data.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
