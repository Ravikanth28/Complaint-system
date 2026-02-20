'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="w-full max-w-[480px] glass p-12 rounded-[3rem] border-white/40 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle size={48} />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Access <span className="text-green-600">Granted</span></h1>
                        <p className="text-gray-500 font-semibold leading-relaxed">
                            Account creation complete. Synchronizing your credentials with the cloud.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-gray-300" size={32} />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Redirecting to Secure Sign-In</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-[480px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                <div className="glass p-10 md:p-12 rounded-[3rem] border-white/40 space-y-10">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-500/40">
                            <ShieldCheck size={32} />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center whitespace-nowrap">Join the <span className="text-indigo-600">Network</span></h1>
                            <p className="text-gray-500 font-semibold italic text-sm">Become part of the smarter infrastructure.</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 transition-all"
                                    placeholder="Full Name"
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 transition-all"
                                    placeholder="Valid Email"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 transition-all"
                                    placeholder="Strong Password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 font-bold text-sm animate-in shake duration-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-gray-200 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    <span>Initiate Membership</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-500 font-bold">
                            Already verified?{' '}
                            <Link href="/login" className="text-indigo-600 hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center px-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} />
                        Next-Gen Auth v3.0
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Cloud Verified
                    </p>
                </div>
            </div>
        </main>
    );
}
