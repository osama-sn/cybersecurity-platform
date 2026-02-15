import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { User, Mail, Lock, Camera, ArrowLeft, Check, AlertCircle } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const isRTL = language === 'ar';

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            await updateProfile(user, { displayName });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile: ' + err.message });
        }
        setLoading(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match.' });
        }
        if (newPassword.length < 6) {
            return setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        }
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setMessage({ type: 'success', text: 'Password changed successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to change password: ' + err.message });
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await user.delete();
                navigate('/login');
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to delete account. You may need to re-login first: ' + err.message });
            }
        }
    };

    const isGoogleUser = user?.providerData?.some(p => p.providerId === 'google.com');

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-cyber-400 hover:text-white transition-colors mb-8"
            >
                <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
                <span>{isRTL ? 'رجوع' : 'Back'}</span>
            </button>

            <h1 className="text-3xl font-bold text-white mb-2">
                {isRTL ? 'الإعدادات' : 'Settings'}
            </h1>
            <p className="text-cyber-400 mb-8">
                {isRTL ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}
            </p>

            {/* Status Message */}
            {message.text && (
                <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                        : 'bg-red-500/10 border border-red-500/50 text-red-400'
                    }`}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-cyber-800 border border-cyber-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-20 h-20 rounded-full border-2 border-cyber-600 object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-cyber-700 flex items-center justify-center border-2 border-cyber-600">
                                <User size={32} className="text-cyber-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{user?.displayName || 'User'}</h2>
                        <p className="text-sm text-cyber-400">{user?.email}</p>
                        {isGoogleUser && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Google Account
                            </span>
                        )}
                    </div>
                </div>

                {/* Update Display Name */}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-cyber-700 pb-2">
                        {isRTL ? 'معلومات الملف الشخصي' : 'Profile Information'}
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-cyber-300 mb-2">
                            {isRTL ? 'الاسم' : 'Display Name'}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <User className="h-5 w-5 text-cyber-500" />
                            </div>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-cyber-600 rounded-lg bg-cyber-900 text-white placeholder-cyber-500 focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition duration-200`}
                                placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-cyber-300 mb-2">
                            {isRTL ? 'البريد الإلكتروني' : 'Email'}
                        </label>
                        <div className="relative">
                            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                <Mail className="h-5 w-5 text-cyber-500" />
                            </div>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-cyber-600 rounded-lg bg-cyber-900/50 text-cyber-400 cursor-not-allowed`}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-cyber-primary text-cyber-900 font-medium rounded-lg hover:bg-cyber-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
                    </button>
                </form>
            </div>

            {/* Change Password — only for email/password users */}
            {!isGoogleUser && (
                <div className="bg-cyber-800 border border-cyber-700 rounded-xl p-6 mb-6">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <h3 className="text-lg font-semibold text-white border-b border-cyber-700 pb-2">
                            {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-cyber-300 mb-2">
                                {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                    <Lock className="h-5 w-5 text-cyber-500" />
                                </div>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-cyber-600 rounded-lg bg-cyber-900 text-white placeholder-cyber-500 focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition duration-200`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyber-300 mb-2">
                                {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                    <Lock className="h-5 w-5 text-cyber-500" />
                                </div>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-cyber-600 rounded-lg bg-cyber-900 text-white placeholder-cyber-500 focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition duration-200`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyber-300 mb-2">
                                {isRTL ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                    <Lock className="h-5 w-5 text-cyber-500" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-cyber-600 rounded-lg bg-cyber-900 text-white placeholder-cyber-500 focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition duration-200`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            {loading ? (isRTL ? 'جاري التغيير...' : 'Changing...') : (isRTL ? 'تغيير كلمة المرور' : 'Change Password')}
                        </button>
                    </form>
                </div>
            )}

            {/* Danger Zone */}
            <div className="bg-cyber-800 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 border-b border-red-500/20 pb-2 mb-4">
                    {isRTL ? 'منطقة الخطر' : 'Danger Zone'}
                </h3>
                <p className="text-sm text-cyber-400 mb-4">
                    {isRTL
                        ? 'بمجرد حذف حسابك، لن يكون هناك عودة. يرجى التأكد.'
                        : 'Once you delete your account, there is no going back. Please be certain.'}
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-2.5 bg-red-500/10 text-red-400 font-medium rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                    {isRTL ? 'حذف الحساب' : 'Delete Account'}
                </button>
            </div>
        </div>
    );
};

export default Settings;
