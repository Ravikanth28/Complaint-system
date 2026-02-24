'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
    ShieldCheck,
    Inbox,
    CheckCircle2,
    Clock,
    Camera,
    Upload,
    MapPin,
    Filter,
    RefreshCcw,
    AlertTriangle,
    CheckSquare,
    ChevronRight,
    Search,
    Image as ImageIcon,
    Loader2
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
    proofUrl?: string;
}

export default function DeptPortal() {
    const { user, token } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDeptComplaints = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/dept/complaints', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch department tasks');
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
        if (token) fetchDeptComplaints();
    }, [token]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProofPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleResolve = async (complaintId: string) => {
        if (!proofFile || !proofPreview) {
            alert("Please upload a photo/file as proof of resolution.");
            return;
        }

        setResolvingId(complaintId);
        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/dept/resolve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    complaintId,
                    proofData: proofPreview,
                    fileName: proofFile.name
                })
            });

            if (!res.ok) throw new Error('Resolution submission failed');

            // Refresh list
            await fetchDeptComplaints();
            setProofFile(null);
            setProofPreview(null);
            alert("Crisis Resolved. Proof uploaded and status updated.");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setResolvingId(null);
        }
    };

    const stats = {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length,
        active: complaints.filter(c => c.status !== 'RESOLVED').length
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="glass rounded-[2.5rem] p-8 md:p-12 border-white/40 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-24 h-24 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl flex-shrink-0">
                    <ShieldCheck size={48} />
                </div>
                <div className="space-y-4 flex-grow text-center md:text-left">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            <span>{user?.department} Command Center</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Department Portal</h1>
                        <p className="text-gray-500 font-semibold">Logged in as: <span className="text-gray-900">{user?.name}</span></p>
                    </div>
                </div>
                <button
                    onClick={fetchDeptComplaints}
                    className="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                >
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Dash Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Assigned Tasks', value: stats.total, icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Verified Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending Action', value: stats.active, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-8 rounded-[2rem] border-white/40 space-y-4 group transition-all">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Assigned Grievances
                    <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">{complaints.length}</span>
                </h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching Active Orders...</p>
                    </div>
                ) : complaints.length > 0 ? (
                    <div className="grid gap-6">
                        {complaints.map((c) => (
                            <div key={c.complaintId} className="glass p-8 rounded-[2.5rem] border-white/40 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                <div className="flex-grow space-y-4 w-full">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-tighter ${c.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                                            {c.status}
                                        </span>
                                        <span className={`px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-tighter text-gray-500`}>
                                            {c.urgency}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            <MapPin size={12} />
                                            <span>{c.location}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight uppercase">{c.title}</h3>
                                    <p className="text-gray-500 font-medium line-clamp-2 italic leading-relaxed">"{c.description}"</p>

                                    {c.status === 'RESOLVED' && c.proofUrl && (
                                        <div className="pt-4 animate-in fade-in duration-500">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <CheckSquare size={14} />
                                                Resolution Evidence Verified
                                            </p>
                                            <div className="w-48 h-32 rounded-2xl overflow-hidden border-2 border-green-100">
                                                <img src={c.proofUrl} className="w-full h-full object-cover" alt="Proof" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {c.status !== 'RESOLVED' && (
                                    <div className="w-full lg:w-72 flex-shrink-0 space-y-4 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-8">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Camera size={14} />
                                            Proof of Action Needed
                                        </p>

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all overflow-hidden"
                                        >
                                            {proofPreview ? (
                                                <img src={proofPreview} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-gray-300 mb-2" />
                                                    <span className="text-[10px] font-bold text-gray-400">Click to upload photo</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            hidden
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />

                                        <button
                                            disabled={resolvingId === c.complaintId || !proofFile}
                                            onClick={() => handleResolve(c.complaintId)}
                                            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50 active:scale-95"
                                        >
                                            {resolvingId === c.complaintId ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={18} />
                                                    <span>Confirm Resolution</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass p-20 rounded-[3rem] border-white/40 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto">
                            <AlertTriangle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">No active assignments.</h3>
                            <p className="text-gray-400 font-medium">Your department has a clean record. All local issues are currently synchronized.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
