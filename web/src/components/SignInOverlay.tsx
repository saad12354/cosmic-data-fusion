import { X, User, Lock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

interface SignInOverlayProps {
    onClose: () => void;
    onSignIn: (username: string) => void;
}

export function SignInOverlay({ onClose, onSignIn }: SignInOverlayProps) {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setIsLoading(true);
        // Fake network delay for "Premium" feel
        setTimeout(() => {
            onSignIn(username);
            setIsLoading(false);
        }, 1000);
    };

    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log('Google Login Success:', tokenResponse);
            // In a real app, you'd send the token to your backend
            // For now, we'll simulate a successful login with a generic Name
            onSignIn("Google_Explorer");
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl glass-panel">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-blue/30">
                        <User className="w-8 h-8 text-accent-blue" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-slate-400 mt-2">Access your cosmic workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                placeholder="Enter your callsign..."
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                placeholder="••••••••"
                                defaultValue="password" // Mock password
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-accent-blue to-accent-purple hover:opacity-90 rounded-xl font-bold text-white shadow-lg shadow-accent-blue/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/5"></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Or continue with</span>
                    <div className="flex-1 h-px bg-white/5"></div>
                </div>

                <button
                    type="button"
                    onClick={() => googleLogin()}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-slate-300 transition-all flex items-center justify-center gap-3 group"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Sign up with Google</span>
                </button>

                <p className="text-center mt-6 text-[10px] text-slate-600 italic">
                    By signing in, you agree to the Cosmic Data Fusion terms of service.
                </p>
            </div>
        </div>
    );
}
