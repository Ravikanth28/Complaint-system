'use client';
import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function ComplaintForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        userName: '',
        email: '',
        location: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const API_URL = 'https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/submit';

            // Map email to userEmail for backend consistency
            const payload = {
                title: formData.title,
                description: formData.description,
                userName: formData.userName,
                userEmail: formData.email,
                location: formData.location
            };

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus('success');
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Submission failed:', res.status, errorData);
                setStatus('error');
            }
        } catch (err) {
            console.error('Network or CORS error:', err);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Submit a Complaint
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                        placeholder="John Doe"
                        onChange={e => setFormData({ ...formData, userName: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            required type="email"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                            placeholder="john@example.com"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                            placeholder="Building A, Room 101"
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Title</label>
                    <input
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                        placeholder="Issue with..."
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <textarea
                        required rows={4}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                        placeholder="Describe your issue in detail..."
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <button
                    disabled={status === 'loading'}
                    className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all ${status === 'loading' ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:scale-[1.02]'
                        }`}
                >
                    {status === 'loading' ? 'Submitting...' : (
                        <>
                            <span>Submit Complaint</span>
                            <Send size={18} />
                        </>
                    )}
                </button>

                {status === 'success' && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center space-x-2">
                        <CheckCircle size={20} />
                        <span>Complaint submitted successfully!</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center space-x-2">
                        <AlertCircle size={20} />
                        <span>Registration failed. Please try again.</span>
                    </div>
                )}
            </form>
        </div>
    );
}
