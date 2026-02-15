import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, LogIn, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const { language } = useLanguage ? useLanguage() : { language: 'en' };
    const isRTL = language === 'ar';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            const msg = err.message.includes('user-not-found') || err.message.includes('wrong-password') || err.message.includes('invalid-credential')
                ? (isRTL ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
                : (isRTL ? 'فشل تسجيل الدخول' : 'Failed to log in');
            setError(msg);
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError(isRTL ? 'فشل تسجيل الدخول بواسطة Google' : 'Failed to sign in with Google');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-900 px-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyber-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-primary/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-primary/20 to-transparent"></div>
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(var(--color-cyber-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-cyber-primary) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            {/* Back to Home */}
            <Link
                to="/"
                className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} flex items-center gap-2 text-cyber-400 hover:text-cyber-primary transition-colors group z-10`}
            >
                <ArrowLeft size={18} className={`transition-transform ${isRTL ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                <span className="text-sm font-medium">{isRTL ? 'الرئيسية' : 'Home'}</span>
            </Link>

            {/* Main Card */}
            <div className="max-w-md w-full relative z-10">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-800/80 border border-cyber-700/50 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <Shield className="text-cyber-primary" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        {isRTL ? 'مرحبًا بعودتك' : 'Welcome Back'}
                    </h1>
                    <p className="text-cyber-400 mt-2 text-sm">
                        {isRTL ? 'سجّل الدخول للوصول إلى حسابك' : 'Sign in to access your account'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-cyber-800/40 backdrop-blur-xl rounded-2xl border border-cyber-700/50 shadow-2xl shadow-black/20 overflow-hidden">
                    {/* Top accent line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-cyber-primary/50 to-transparent"></div>

                    <div className="p-8">
                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                                <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                                <span className="text-red-300 text-sm">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-cyber-300 mb-2">
                                    {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                                </label>
                                <div className="relative group">
                                    <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                        <Mail size={18} className="text-cyber-500 group-focus-within:text-cyber-primary transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className={`block w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-cyber-900/60 border border-cyber-600/50 rounded-xl text-white placeholder-cyber-600 focus:outline-none focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 focus:bg-cyber-900/80 transition-all duration-300`}
                                        placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-cyber-300 mb-2">
                                    {isRTL ? 'كلمة المرور' : 'Password'}
                                </label>
                                <div className="relative group">
                                    <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                        <Lock size={18} className="text-cyber-500 group-focus-within:text-cyber-primary transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className={`block w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 bg-cyber-900/60 border border-cyber-600/50 rounded-xl text-white placeholder-cyber-600 focus:outline-none focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 focus:bg-cyber-900/80 transition-all duration-300`}
                                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-cyber-500 hover:text-cyber-300 transition-colors`}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-wider bg-cyber-primary text-cyber-900 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-cyber-primary/50 focus:ring-offset-2 focus:ring-offset-cyber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-cyber-900/30 border-t-cyber-900 rounded-full animate-spin"></div>
                                        {isRTL ? 'جاري الدخول...' : 'Signing in...'}
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-cyber-700/50"></div>
                            <span className="text-xs text-cyber-500 uppercase tracking-wider font-medium">{isRTL ? 'أو' : 'or'}</span>
                            <div className="flex-1 h-px bg-cyber-700/50"></div>
                        </div>

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-cyber-900/60 border border-cyber-600/50 text-sm font-medium text-cyber-200 hover:bg-cyber-800 hover:border-cyber-500/50 focus:outline-none focus:ring-2 focus:ring-cyber-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {isRTL ? 'الدخول بواسطة Google' : 'Continue with Google'}
                        </button>

                        {/* Signup Link */}
                        <p className="mt-6 text-center text-sm text-cyber-400">
                            {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                            <Link to="/signup" className="font-semibold text-cyber-primary hover:text-emerald-400 transition-colors duration-200">
                                {isRTL ? 'إنشاء حساب' : 'Sign up'}
                            </Link>
                        </p>
                    </div>

                    {/* Bottom accent line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-cyber-primary/30 to-transparent"></div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-cyber-600 mt-6">
                    {isRTL ? '© 2026 أسامة | منصة الأمن الشبكي الهجومي' : '© 2026 Osama | Network Offensive Security'}
                </p>
            </div>
        </div>
    );
};

export default Login;
