import { useState } from 'react';
import { X, Lock, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (role: 'user' | 'admin') => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            onLogin('admin');
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('Invalid admin password');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-blue-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Access Control</h2>
                                <p className="text-slate-400 text-sm mt-1">Select your role to continue</p>
                            </div>

                            <div className="space-y-4">
                                {/* User Login (Default) */}
                                <button
                                    onClick={() => { onLogin('user'); onClose(); }}
                                    className="w-full flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-700 rounded-xl transition-all group group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                                        <User className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-white">Standard User</h3>
                                        <p className="text-xs text-slate-400">View and manage your own requests</p>
                                    </div>
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-800" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-slate-900 px-2 text-slate-500">Or Admin Access</span>
                                    </div>
                                </div>

                                {/* Admin Login Form */}
                                <form onSubmit={handleAdminLogin} className="space-y-3">
                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter Admin Password"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                                            />
                                        </div>
                                        {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Login as Admin
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
                            <p className="text-xs text-slate-500">
                                Hint: Password is <code className="text-slate-400 bg-slate-900 px-1 rounded">admin123</code>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
