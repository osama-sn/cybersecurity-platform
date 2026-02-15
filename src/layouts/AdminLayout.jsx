import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminLayout = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return <div className="text-center p-20">Checking clearance...</div>;

    if (!user || !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <ShieldAlert size={64} className="text-cyber-danger" />
                <h1 className="text-2xl font-bold">Resricted Area</h1>
                <p className="text-cyber-400">You do not have clearance to access this terminal.</p>
                <Navigate to="/" replace />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cyber-900 text-cyber-200">
            <header className="bg-cyber-800 border-b border-cyber-700 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ShieldAlert className="text-cyber-danger" />
                    Admin Control Panel
                </h1>
                <div className="text-sm font-mono text-cyber-400">
                    User: {user.email}
                </div>
            </header>
            <main className="p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
