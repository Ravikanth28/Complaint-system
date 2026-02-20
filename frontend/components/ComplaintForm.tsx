'use client';
import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, MapPin, User, Mail, AlignLeft, ArrowRight, Loader2 } from 'lucide-react';
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
    const { token, user } = useAuth();

    const API_URL = 'https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/submit';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                userName: formData.userName || user?.name,
                userEmail: formData.email || user?.email,
                location: formData.location
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
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900">Success!</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Your complaint has been synchronized with our core system. Our AI will analyze it shortly.
                    </p>
                </div>
                <button
                    onClick={() => setStatus('idle')}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                    Submit Another
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
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-5 bg-white/50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 shadow-sm transition-all min-h-[140px]"
                            placeholder="Describe your grievance in detail..."
                        />
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
