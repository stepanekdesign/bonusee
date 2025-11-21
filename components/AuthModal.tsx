
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { X, Mail, Lock, LogIn, ArrowRight, User } from 'lucide-react';
import { signInWithGoogle, registerUser, loginUser, signInWithApple } from '../services/firebase';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Added Name state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onLoginSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithApple();
      onLoginSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      setError("Apple login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic Validation
    if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
    }

    try {
        if (isSignUp) {
            if (!name.trim()) {
                setError("Please enter your name.");
                setLoading(false);
                return;
            }
            await registerUser(email, password, name);
        } else {
            await loginUser(email, password);
        }
        
        // In mock mode, we sometimes need a reload to pick up the localStorage change in App.tsx
        // In real mode, the auth listener handles it. 
        // We'll assume success triggers the callback.
        onLoginSuccess(); 
        // Short timeout to allow animation/state update before closing or reloading
        setTimeout(() => {
             window.location.reload(); 
        }, 100);
        
    } catch (err: any) {
        console.error(err);
        // Friendly error parsing
        let msg = "An error occurred.";
        if (err.message.includes("auth/email-already-in-use")) msg = "This email is already registered.";
        if (err.message.includes("auth/user-not-found")) msg = "No account found with this email.";
        if (err.message.includes("auth/wrong-password")) msg = "Incorrect password.";
        if (err.message.includes("Mock Mode")) msg = err.message;
        
        setError(msg);
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setError(null);
      setPassword('');
      setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="w-full max-w-sm relative">
        <GlassCard className="bg-white/70 backdrop-blur-xl border-white/50 shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>

            <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl mx-auto mb-4 shadow-lg flex items-center justify-center">
                    <LogIn className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    {isSignUp ? 'Join Bonusee & track your goals' : 'Sign in to sync your progress'}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium flex items-center justify-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name Field - Only for Sign Up */}
                {isSignUp && (
                    <div className="space-y-1 animate-slide-up">
                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="Minimum 6 characters"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-slate-300 flex-1"></div>
                <span className="text-xs text-slate-400 font-medium">OR</span>
                <div className="h-px bg-slate-300 flex-1"></div>
            </div>

            <button 
                onClick={handleAppleLogin}
                className="w-full bg-black text-white border border-black font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mb-3"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05 2.3-3.73 2.3-1.6 0-2.13-.95-3.9-.95-1.78 0-2.35.95-3.9.95-1.63 0-2.96-1.6-4-3.19-2.14-3.18-2.14-8.7 2.09-10.66 1.13-.53 2.23-.64 3.07-.64 1.55 0 2.66 1.06 3.25 1.06.53 0 1.81-1.11 3.51-1.11 1.17 0 2.45.42 3.19 1.11-.52 3.08 2.45 4.67 2.55 4.73-.05.22-3.77 10.95-2.13 6.4zM12.03 7.25c-.11-1.96 1.59-3.72 3.45-4.25.27 2.33-2.18 3.88-3.45 4.25z" />
                </svg>
                Continue with Apple
            </button>

            <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
            </button>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button 
                        onClick={toggleMode}
                        className="text-blue-600 font-bold ml-1 hover:underline"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};
