'use client';
import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'USER' | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        // Mock password check: 'admin123' for admin, anything for user
        if (selectedRole === 'ADMIN' && password !== 'admin123') {
            setError('Invalid admin password');
            return;
        }

        login(selectedRole);
        router.push(selectedRole === 'ADMIN' ? '/admin' : '/');
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Portal Access</h1>
                    <p className="text-gray-500">Choose your role to continue</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setSelectedRole('USER')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'USER'
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                            }`}
                    >
                        <User size={24} />
                        <span className="font-bold text-sm">Regular User</span>
                    </button>
                    <button
                        onClick={() => setSelectedRole('ADMIN')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === 'ADMIN'
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                            }`}
                    >
                        <ShieldCheck size={24} />
                        <span className="font-bold text-sm">Administrator</span>
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {selectedRole === 'ADMIN' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 italic">Admin Password (admin123)</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 bg-gray-900 border-2 border-gray-900 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-white hover:text-gray-900 transition-all group"
                    >
                        Enter Portal
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 italic">
                    Department of Complaint Management System
                </p>
            </div>
        </main>
    );
}
