'use client';
import { LogOut, Shield, User } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Navbar() {
    const { role, logout } = useAuth();

    if (!role) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        {role === 'ADMIN' ? <Shield size={18} /> : <User size={18} />}
                    </div>
                    <span className="font-bold text-gray-900 hidden sm:block">
                        ComplaintSystem <span className="text-blue-600">| {role === 'ADMIN' ? 'Admin Portal' : 'User Portal'}</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Logged in as</span>
                        <span className="text-sm font-bold text-gray-700">{role}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100 hover:shadow-sm"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
