'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    LayoutDashboard, AlertTriangle, CheckCircle, Clock, Users,
    MessageSquare, Zap, Target, Search, Filter, ArrowUpRight,
    ArrowDownRight, Loader2, Sparkles, BrainCircuit, Bot
} from 'lucide-react';

const COLORS = ['#2563eb', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

interface Complaint {
    complaintId: string;
    title: string;
    description: string;
    status: string;
    urgency: string;
    timestamp: string;
    userName: string;
    location: string;
    category?: string;
    summary?: string;
    proofUrl?: string;
    resolvedBy?: string;
    resolutionDept?: string;
    resolutionTimestamp?: string;
}

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, token, logout } = useAuth();
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [chatQuery, setChatQuery] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [assigningId, setAssigningId] = useState<string | null>(null);

    const departments = ['PWD', 'Police', 'Fire', 'Health', 'Electricity', 'Water & Sewage', 'Transport', 'Others'];

    const fetchComplaints = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/complaints', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setComplaints(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [token]);

    const handleManualAssign = async (complaintId: string, newDept: string) => {
        if (!token) return;
        setAssigningId(complaintId);
        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/admin/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ complaintId, category: newDept })
            });

            if (!res.ok) throw new Error('Assignment failed');

            // Update local state
            setComplaints(prev => prev.map(c =>
                c.complaintId === complaintId ? { ...c, category: newDept } : c
            ));
            if (selectedComplaint?.complaintId === complaintId) {
                setSelectedComplaint(prev => prev ? { ...prev, category: newDept } : null);
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setAssigningId(null);
        }
    };

    const handleChat = async () => {
        if (!chatQuery || !token) return;
        setChatLoading(true);
        setChatResponse('');
        console.log('Sending AI query:', chatQuery);
        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: chatQuery,
                    complaintId: selectedComplaint?.complaintId
                })
            });
            console.log('Chat response status:', res.status);
            const data = await res.json();
            console.log('Chat response data:', data);

            if (data.reply) {
                setChatResponse(data.reply);
            } else {
                setChatResponse("Gemini returned an empty response. Please try clarifying your instruction.");
            }
        } catch (err) {
            console.error('Chat error:', err);
            setChatResponse("Neural Link failure. Please check your connection or contact the system administrator.");
        } finally {
            setChatLoading(false);
        }
    };

    const stats = {
        total: complaints.length,
        resolved: complaints.filter(c => (c.status || '').toUpperCase() === 'RESOLVED').length,
        pending: complaints.filter(c => (c.status || '').toUpperCase() !== 'RESOLVED').length,
        urgent: complaints.filter(c => {
            const u = (c.urgency || '').trim().toUpperCase();
            return u === 'CRITICAL' || u === 'HIGH';
        }).length
    };

    const categoryData = Object.entries(
        complaints.reduce((acc: any, curr) => {
            const cat = curr.category || curr.location || 'Other';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Initializing Command Center</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-1">
                            <Zap size={10} strokeWidth={3} />
                            <span>System Operations</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin <span className="text-blue-600">Command Center</span></h1>
                        <p className="text-gray-500 font-semibold italic text-sm">Real-time intelligence and fleet management.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={fetchComplaints} className="btn-secondary py-3 px-5">
                            <Clock size={18} /> Refresh Data
                        </button>
                        <button className="btn-primary py-3 px-6">
                            <Target size={18} /> Optimization Report
                        </button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Inflow', value: stats.total, icon: LayoutDashboard, color: 'blue', trend: '+12%' },
                        { label: 'Active Issues', value: stats.pending, icon: Clock, color: 'amber', trend: '-2%' },
                        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'green', trend: '+24%' },
                        { label: 'Critical Risk', value: stats.urgent, icon: AlertTriangle, color: 'red', trend: 'STABLE' },
                    ].map((m, i) => (
                        <div key={i} className="glass p-6 rounded-[2rem] border-white space-y-4 hover:scale-[1.02] transition-transform cursor-default">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 bg-${m.color}-50 text-${m.color}-600 rounded-2xl flex items-center justify-center border border-${m.color}-100`}>
                                    <m.icon size={24} />
                                </div>
                                <span className={`text-[10px] font-black italic ${m.trend.startsWith('+') ? 'text-green-500' : m.trend.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                    {m.trend}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                                <p className="text-3xl font-black text-gray-900 leading-none">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Complaints Explorer */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass rounded-[2.5rem] p-8 border-white min-h-[600px] flex flex-col space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Explorer</h2>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Live grievance stream</p>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                    <input className="pl-10 pr-4 py-2 bg-gray-100/50 rounded-xl text-sm font-semibold outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all min-w-[240px]" placeholder="Global query..." />
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="h-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {complaints.map((c) => (
                                        <button
                                            key={c.complaintId}
                                            onClick={() => setSelectedComplaint(c)}
                                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all group flex items-center gap-5 ${selectedComplaint?.complaintId === c.complaintId ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-600/20' : 'bg-white/50 border-transparent hover:border-blue-100 hover:bg-white'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${selectedComplaint?.complaintId === c.complaintId ? 'bg-white/20 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                                <MessageSquare size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedComplaint?.complaintId === c.complaintId ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                                        {c.location}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${['HIGH', 'CRITICAL'].includes((c.urgency || '').trim().toUpperCase()) ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                        {c.urgency}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedComplaint?.complaintId === c.complaintId ? 'bg-indigo-400 text-white' : 'bg-indigo-50 text-indigo-600 font-black'}`}>
                                                        DEPT: {c.category || 'Triage Pending'}
                                                    </span>
                                                </div>
                                                <h3 className={`font-black tracking-tight truncate ${selectedComplaint?.complaintId === c.complaintId ? 'text-white' : 'text-gray-900'}`}>{c.title}</h3>

                                                <div className="flex items-center gap-4 mt-2">
                                                    {c.proofUrl && (
                                                        <div className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase">
                                                            <CheckCircle size={12} />
                                                            Proof Uploaded
                                                        </div>
                                                    )}

                                                    {/* Manual Assignment Dropdown */}
                                                    <select
                                                        disabled={assigningId === c.complaintId}
                                                        value={c.category || ''}
                                                        onChange={(e) => handleManualAssign(c.complaintId, e.target.value)}
                                                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border-none outline-none cursor-pointer ${selectedComplaint?.complaintId === c.complaintId ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                                                    >
                                                        <option value="" disabled>Re-assign...</option>
                                                        {departments.map(d => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className={`text-right hidden sm:block ${selectedComplaint?.complaintId === c.complaintId ? 'text-blue-100' : 'text-gray-400'}`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Submission</p>
                                                <p className="text-xs font-bold">{new Date(c.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights & Sidebar */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Analytics Chart */}
                        <div className="glass rounded-[2.5rem] p-8 border-white space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900">Distribution</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grievances by Location</p>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {categoryData.slice(0, 4).map((d, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-xs font-bold text-gray-600 truncate">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Assistance Panel */}
                        <div className="glass rounded-[2.5rem] p-8 border-white bg-gradient-to-br from-white/90 to-blue-50/90 relative overflow-hidden shadow-2xl shadow-blue-500/10 min-h-[480px] flex flex-col space-y-6">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                                    <Bot size={28} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Agent <span className="text-blue-600 italic">Core</span></h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neural Link Active</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-3">
                                    <div className="glass-dark border-transparent rounded-[1.5rem] p-5 shadow-inner">
                                        <p className="text-xs font-bold text-blue-100 flex items-center gap-2 mb-2">
                                            <Sparkles size={14} /> SYSTEM PROMPT
                                        </p>
                                        <textarea
                                            value={chatQuery}
                                            onChange={(e) => setChatQuery(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-white text-sm font-semibold placeholder:text-blue-200/50 resize-none h-[80px]"
                                            placeholder={selectedComplaint ? `Analyze "${selectedComplaint.title}"...` : "How can I assist with ops today?"}
                                        />
                                    </div>
                                    <button
                                        onClick={handleChat}
                                        disabled={chatLoading}
                                        className="btn-primary w-full py-4 text-sm font-black tracking-widest uppercase shadow-blue-600/30"
                                    >
                                        {chatLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>
                                                <BrainCircuit size={18} /> Execute Neural Scan
                                            </>
                                        )}
                                    </button>
                                </div>

                                {chatResponse && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="glass p-5 rounded-2xl border-blue-100 bg-white shadow-xl shadow-blue-500/5 max-h-[220px] overflow-y-auto custom-scrollbar">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Zap size={14} className="text-amber-500" /> Insight Generated
                                            </p>
                                            <p className="text-sm font-semibold text-gray-700 leading-relaxed italic">
                                                "{chatResponse}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!chatResponse && (
                                <div className="text-center pb-4 opacity-50">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select a case to begin deep-analysis</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
}
