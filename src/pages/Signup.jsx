import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, UserPlus, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { language } = useLanguage ? useLanguage() : { language: 'en' };
    const isRTL = language === 'ar';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            return setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        }

        if (password !== confirmPassword) {
            return setError(isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password);
            navigate('/');
        } catch (err) {
            const msg = err.message.includes('email-already-in-use')
                ? (isRTL ? 'هذا البريد الإلكتروني مستخدم بالفعل' : 'This email is already in use')
                : (isRTL ? 'فشل في إنشاء الحساب' : 'Failed to create account');
            setError(msg);
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
                        {isRTL ? 'إنشاء حساب' : 'Create Account'}
                    </h1>
                    <p className="text-cyber-400 mt-2 text-sm">
                        {isRTL ? 'انضم إلى منصة الأمن الشبكي الهجومي' : 'Join the offensive network security platform'}
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
                                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Create a password'}
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
                                <p className="mt-1.5 text-xs text-cyber-600">
                                    {isRTL ? '6 أحرف على الأقل' : 'Minimum 6 characters'}
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-cyber-300 mb-2">
                                    {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                </label>
                                <div className="relative group">
                                    <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                        <Lock size={18} className="text-cyber-500 group-focus-within:text-cyber-primary transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        className={`block w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 bg-cyber-900/60 border border-cyber-600/50 rounded-xl text-white placeholder-cyber-600 focus:outline-none focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 focus:bg-cyber-900/80 transition-all duration-300`}
                                        placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-cyber-500 hover:text-cyber-300 transition-colors`}
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                        {isRTL ? 'جاري الإنشاء...' : 'Creating Account...'}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        {isRTL ? 'إنشاء حساب' : 'Create Account'}
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

                        {/* Login Link */}
                        <p className="text-center text-sm text-cyber-400">
                            {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                            <Link to="/login" className="font-semibold text-cyber-primary hover:text-emerald-400 transition-colors duration-200">
                                {isRTL ? 'تسجيل الدخول' : 'Log in'}
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

export default Signup;
