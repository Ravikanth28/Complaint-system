'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { LogOut, Shield, User, Bell, LayoutDashboard, PlusCircle } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    if (!user?.role) return null;

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl h-20 glass rounded-[2rem] z-50 flex items-center justify-between px-8 transition-all duration-300">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                        <PlusCircle size={22} />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-gray-900">
                        Complaint<span className="text-blue-600">Sync</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl">
                    <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white hover:shadow-sm">
                        Submit
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link href="/admin" className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white hover:shadow-sm flex items-center gap-2">
                            Dashboard
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/50 border border-white/20 p-2 rounded-2xl">
                    <div className="flex flex-col items-end px-2 hidden sm:flex">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Authenticated</span>
                        <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 border border-white shadow-sm">
                        {user?.role === 'ADMIN' ? <Shield size={20} /> : <User size={20} />}
                    </div>
                </div>

                <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                <button
                    onClick={logout}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"
                    title="Logout"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>
        </nav>
    );
}
