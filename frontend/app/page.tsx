'use client';
import React from 'react';
import ComplaintForm from '../components/ComplaintForm';
import { useAuth } from '../components/AuthContext';
import { ArrowRight, Sparkles, ShieldCheck, Zap, MessageSquareQuote } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
    const { user } = useAuth();

    return (
        <main className="min-h-screen bg-background selection:bg-blue-100 pb-20">
            {/* Hero Section */}
            <section className="relative pt-44 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-background"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-blue-400/20 blur-[100px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-indigo-400/20 blur-[100px] rounded-full animate-pulse duration-[5000ms]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 font-bold text-sm tracking-wide uppercase">
                            <Sparkles size={16} />
                            <span>Powered by Gemini AI</span>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                                Smarter <span className="text-gradient">Complaint</span> Management.
                            </h1>
                            <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
                                Redefining how public grievances are handled. Secure, transparent, and driven by state-of-the-art serverless technology.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-500/5">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">Secure</p>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">E2E Encrypted</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-500/5">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">Instant</p>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">AI Triaging</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-[3rem] blur-2xl"></div>
                        <div className="relative">
                            <ComplaintForm />
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
