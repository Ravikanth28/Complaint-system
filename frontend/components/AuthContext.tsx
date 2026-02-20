'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'ADMIN' | 'USER' | null;

interface AuthContextType {
    role: Role;
    login: (role: Role) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedRole = localStorage.getItem('user_role') as Role;
        if (savedRole) {
            setRole(savedRole);
        }
        setIsLoading(false);
    }, []);

    const login = (newRole: Role) => {
        setRole(newRole);
        if (newRole) localStorage.setItem('user_role', newRole);
    };

    const logout = () => {
        setRole(null);
        localStorage.removeItem('user_role');
        router.push('/login');
    };

    useEffect(() => {
        if (!isLoading) {
            if (!role && pathname !== '/login') {
                router.push('/login');
            } else if (role === 'USER' && pathname === '/admin') {
                router.push('/');
            }
        }
    }, [role, pathname, isLoading, router]);

    return (
        <AuthContext.Provider value={{ role, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
