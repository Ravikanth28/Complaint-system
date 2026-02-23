'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'ADMIN' | 'USER' | 'DEPARTMENT' | null;

interface User {
    userId: string;
    name: string;
    email: string;
    role: Role;
    department?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.push('/login');
    };

    useEffect(() => {
        if (!isLoading) {
            const publicPaths = ['/login', '/register'];
            const isPublicPath = publicPaths.includes(pathname);

            if (!token) {
                if (!isPublicPath) {
                    router.push('/login');
                }
            } else {
                // User is authenticated
                if (isPublicPath) {
                    // Prevent accessing login/register while logged in
                    if (user?.role === 'ADMIN') router.push('/admin');
                    else if (user?.role === 'DEPARTMENT') router.push('/dept');
                    else router.push('/');
                } else if (user?.role === 'USER' && (pathname === '/admin' || pathname === '/dept')) {
                    // Standard users cannot access admin or dept
                    router.push('/');
                } else if (user?.role === 'DEPARTMENT' && (pathname === '/admin' || pathname === '/')) {
                    // Dept users cannot access admin and should be on /dept hub
                    router.push('/dept');
                } else if (user?.role === 'ADMIN' && (pathname === '/' || pathname === '/dept')) {
                    // Optional: Redirect admin from home/dept to dashboard for efficiency
                    router.push('/admin');
                }
            }
        }
    }, [token, user, pathname, isLoading, router]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
