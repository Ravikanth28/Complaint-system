'use client';
import { LogOut } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import ComplaintForm from "../components/ComplaintForm";

export default function Home() {
    const { logout } = useAuth();

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
                        Complaint Registration System
                    </h1>
                    <p className="text-gray-600">Securely submit and monitor your service requests</p>
                </header>

                <div className="grid gap-12">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">1</span>
                            <div>
                                <h2 className="text-xl font-bold">New Submission</h2>
                                <p className="text-sm text-gray-500 italic">Powered by AWS & Gemini AI</p>
                            </div>
                        </div>
                        <ComplaintForm />
                    </section>
                </div>
            </div>
        </main>
    );
}
