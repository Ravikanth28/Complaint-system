'use client';
import React from 'react';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

export default function LayoutGuard({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Auth State</p>
            </div>
        );
    }

    return <>{children}</>;
}
