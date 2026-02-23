'use client';
import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            login(data.token, data.user);
            if (data.user.role === 'ADMIN') router.push('/admin');
            else if (data.user.role === 'DEPARTMENT') router.push('/dept');
            else router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-400/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-[480px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                <div className="glass p-10 md:p-12 rounded-[3rem] border-white/40 space-y-10">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/40">
                            <Lock size={32} />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Identity <span className="text-blue-600">Verification</span></h1>
                            <p className="text-gray-500 font-semibold italic text-sm">Secure access to your core workspace.</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 transition-all"
                                    placeholder="Registered Email"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-gray-900 font-semibold placeholder:text-gray-400 transition-all"
                                    placeholder="Secure Password"
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
                                    <span>Enter Portal</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-500 font-bold">
                            New user?{' '}
                            <Link href="/register" className="text-blue-600 hover:underline">Request Access</Link>
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center px-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} />
                        Next-Gen Auth v3.0
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        E2E Encrypted
                    </p>
                </div>
            </div>
        </main>
    );
}
