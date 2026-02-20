'use client';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Clock, Users, Building2, Eye, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/complaints');
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
    }, []);

    const stats = {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length,
        urgent: complaints.filter(c => c.urgency === 'High' || c.urgency === 'Critical' || c.status === 'RAW').length,
        departments: new Set(complaints.map(c => c.location)).size || 0
    };

    const categoryData = Object.entries(
        complaints.reduce((acc: any, curr: any) => {
            const cat = curr.location || 'Unknown';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen font-sans text-gray-900">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold">Admin Control Panel</h1>
                    <p className="text-gray-500">Managing {stats.total} Active Complaints</p>
                </div>
                <button
                    onClick={fetchComplaints}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-2"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={<Clock />} label="Total Received" value={stats.total} trend="Live" />
                <StatCard icon={<Users />} label="Resolved" value={stats.resolved} trend="Updating" />
                <StatCard icon={<AlertTriangle className="text-amber-500" />} label="Needs Triage" value={complaints.filter(c => c.status === 'RAW').length} trend="High Priority" />
                <StatCard icon={<Building2 />} label="Active Sites" value={stats.departments} trend="Locations" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Recent Complaints</h3>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">Real-time</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Complaint</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Submitter</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {complaints.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                        {loading ? 'Refreshing data...' : 'No complaints found yet.'}
                                    </td>
                                </tr>
                            ) : complaints.map((c) => (
                                <tr key={c.complaintId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{c.title || 'Untitled'}</div>
                                        <div className="text-xs text-gray-400 line-clamp-1">{c.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium">{c.userName || 'Anonymous'}</div>
                                        <div className="text-xs text-gray-400">{c.userEmail || c.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{c.location}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">{new Date(c.timestamp).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Location Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Sentiment & Urgency</h3>
                    <div className="flex items-center justify-center h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">{icon}</div>
                <span className="text-xs font-semibold text-gray-400">{trend}</span>
            </div>
            <div>
                <p className="text-sm text-gray-500 mt-4 font-medium">{label}</p>
                <p className="text-2xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    );
}
