'use client';
import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, MapPin, User, Mail, AlignLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function ComplaintForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        userName: '',
        email: '',
        location: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [triageLoading, setTriageLoading] = useState(false);
    const [triageError, setTriageError] = useState<string | null>(null);
    const [triageData, setTriageData] = useState<{ category: string; urgency: string; summary: string } | null>(null);
    const { token, user } = useAuth();

    const API_URL = 'https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/submit';
    const CHAT_URL = 'https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/chatbot';

    const handleTriage = async () => {
        if (!formData.description || formData.description.length < 10) return;
        setTriageLoading(true);
        setTriageError(null);
        setTriageData(null);
        console.log('Triggering triage for:', formData.description.substring(0, 20) + '...');
        try {
            const res = await fetch(CHAT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: `Analyze this for triage:
                    Title: ${formData.title}
                    Description: ${formData.description}
                    
                    Return ONLY a JSON object: {"category": "...", "urgency": "...", "summary": "..."}
                    Categories: [PWD, Police, Fire, Health, Electricity, Water & Sewage, Transport, Others]`
                })
            });
            console.log('Triage response status:', res.status);

            if (res.status === 401 || res.status === 403) {
                setTriageError("Authentication expired. Please login again.");
                return;
            }

            const data = await res.json();
            console.log('Triage response data:', data);

            // Parse AI response if it's wrapped in text
            const text = data.reply || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('Parsed Triage Data:', parsed);
                setTriageData(parsed);
            } else {
                console.warn('No JSON found in AI reply:', text);
                setTriageError("AI reasoning failed. Please check the description and try again.");
            }
        } catch (err) {
            console.error('Triage failed:', err);
            setTriageError("Neural Link error. Check your connection.");
        } finally {
            setTriageLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                userName: formData.userName || user?.name,
                userEmail: formData.email || user?.email,
                location: formData.location,
                // Pass triage bot verdict officially (Phase 23)
                category: triageData?.category,
                urgency: triageData?.urgency,
                summary: triageData?.summary
            };

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Submission failed:', err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="glass p-12 rounded-[2.5rem] border-white/40 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle size={40} />
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Complaint Filed!</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Officially Triaged & Routed</p>
                    </div>

                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-left space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-blue-600" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Routing Confirmation</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                            Your grievance has been officially routed to the **{triageData?.category || 'General'}** department with **{triageData?.urgency || 'MEDIUM'}** priority.
                        </p>
                    </div>

                    <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                        Administrators have been notified. Check the dashboard for status updates.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ title: '', description: '', location: '', userName: '', email: '' });
                        setTriageData(null);
                        setStatus('idle');
                    }}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                    File New Complaint
                </button>
            </div>
        );
    }

    return (
        <div className="glass p-10 rounded-[2.5rem] border-white/40 shadow-2xl space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Express it.</h2>
                <p className="text-gray-500 font-semibold italic text-sm">We'll handle the rest with speed and precision.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    <div className="relative group">
                        <AlignLeft className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 shadow-sm transition-all"
                            placeholder="Complant Title"
                        />
                    </div>

                    <div className="relative group">
                        <MapPin className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            required
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 shadow-sm transition-all"
                            placeholder="Your Location/Department"
                        />
                    </div>

                    <div className="relative group">
                        <textarea
                            required
                            value={formData.description}
                            onChange={e => {
                                setFormData({ ...formData, description: e.target.value });
                                setTriageData(null);
                            }}
                            onBlur={handleTriage}
                            className="w-full p-5 bg-white/50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 shadow-sm transition-all min-h-[140px]"
                            placeholder="Describe your grievance in detail..."
                        />
                    </div>

                    {/* Triage Bot UI */}
                    <div className="mt-4 p-6 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-blue-600 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Semantic Triage Bot</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {triageLoading && <Loader2 size={14} className="animate-spin text-blue-600" />}
                                {!triageData && !triageLoading && formData.description.length >= 10 && (
                                    <button
                                        type="button"
                                        onClick={handleTriage}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 underline underline-offset-2"
                                    >
                                        Run Analysis
                                    </button>
                                )}
                            </div>
                        </div>

                        {triageData ? (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <div className="px-3 py-1 bg-white border border-blue-100 rounded-full flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Dept: {triageData.category}</span>
                                    </div>
                                    <div className={`px-3 py-1 bg-white border rounded-full flex items-center gap-2 ${['HIGH', 'CRITICAL'].includes((triageData.urgency || '').toUpperCase()) ? 'border-red-100' : 'border-green-100'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${['HIGH', 'CRITICAL'].includes((triageData.urgency || '').toUpperCase()) ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Urgency: {triageData.urgency}</span>
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-gray-500 italic leading-relaxed">
                                    "I've analyzed your request and prioritized it for the **{triageData.category}** department."
                                </p>
                            </div>
                        ) : triageError ? (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500 flex items-center gap-2 text-red-500">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{triageError}</span>
                                <button
                                    type="button"
                                    onClick={handleTriage}
                                    className="ml-auto text-[10px] font-black text-blue-600 hover:text-blue-700 underline"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold text-blue-400 italic">
                                {triageLoading ? "Analyzing socio-civic context..." : "Enter description or click 'Run Analysis' to trigger AI triage."}
                            </p>
                        )}
                    </div>
                </div>

                {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 font-bold text-sm">
                        <AlertCircle size={20} className="shrink-0" />
                        <span>There was an error in transmission. Please retry.</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 group disabled:opacity-50"
                >
                    {status === 'loading' ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span>Synchronize Data</span>
                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Authorized User Portal v2.0
                </p>
            </div>
        </div>
    );
}
