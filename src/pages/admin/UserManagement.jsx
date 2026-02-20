import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Trash2, Edit, Check, X, Search, Lock } from 'lucide-react';

const UserManagement = () => {
    const { sections } = useData();
    const { isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State for Permissions
    const [editingUser, setEditingUser] = useState(null);
    const [selectedSections, setSelectedSections] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This removes their database record only.")) return;

        try {
            await deleteDoc(doc(db, 'users', userId));
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const openPermissionsModal = (user) => {
        setEditingUser(user);
        setSelectedSections(user.allowedSections || []);
        setShowModal(true);
    };

    const handleSavePermissions = async () => {
        if (!editingUser) return;

        try {
            await updateDoc(doc(db, 'users', editingUser.id), {
                allowedSections: selectedSections
            });

            setUsers(users.map(u => u.id === editingUser.id ? { ...u, allowedSections: selectedSections } : u));
            setShowModal(false);
            setEditingUser(null);
        } catch (error) {
            console.error("Error saving permissions:", error);
            alert("Failed to save permissions");
        }
    };

    const toggleSection = (sectionId) => {
        if (selectedSections.includes(sectionId)) {
            setSelectedSections(selectedSections.filter(id => id !== sectionId));
        } else {
            setSelectedSections([...selectedSections, sectionId]);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center text-white py-10">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">User Management</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-cyber-800 rounded-lg overflow-hidden border border-cyber-700">
                <table className="w-full text-left">
                    <thead className="bg-cyber-900 text-cyber-300 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Permissions</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-cyber-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm text-white font-medium">{user.email}</div>
                                    <div className="text-xs text-cyber-500 font-mono">{user.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === 'super_admin' ? (
                                        <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/50">
                                            <Shield size={12} className="mr-1" /> Super Admin
                                        </span>
                                    ) : user.role === 'admin' ? (
                                        <span className="badge bg-green-500/20 text-green-300 border-green-500/50">
                                            <Shield size={12} className="mr-1" /> Admin
                                        </span>
                                    ) : (
                                        <span className="badge bg-blue-500/20 text-blue-300 border-blue-500/50">
                                            <User size={12} className="mr-1" /> User
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === 'super_admin' || user.role === 'admin' ? (
                                        <span className="text-xs text-green-400">Full Access</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {user.allowedSections && user.allowedSections.length > 0 ? (
                                                user.allowedSections.map(sid => {
                                                    const section = sections.find(s => s.id === sid);
                                                    return (
                                                        <span key={sid} className="text-[10px] px-2 py-0.5 rounded bg-cyber-700 text-cyber-300 border border-cyber-600">
                                                            {section ? section.title : 'Unknown Section'}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs text-cyber-500">No specific permissions</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {/* Protect Super Admin from everyone. */}
                                    {user.role === 'super_admin' ? (
                                        <span className="text-xs text-cyber-500 italic flex items-center justify-end gap-1">
                                            <Lock size={12} /> Protected
                                        </span>
                                    ) : (
                                        <>
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleToggleAdmin(user.id, user.role)}
                                                    className={`p-1.5 rounded transition-colors ${user.role === 'admin' ? 'text-orange-400 hover:bg-orange-900/30' : 'text-green-400 hover:bg-green-900/30'}`}
                                                    title={user.role === 'admin' ? "Remove Admin" : "Make Admin"}
                                                >
                                                    <Shield size={16} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => openPermissionsModal(user)}
                                                className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                                                title="Manage Permissions"
                                            >
                                                <Edit size={16} />
                                            </button>

                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Permissions Modal */}
            {showModal && editingUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-cyber-800 border border-cyber-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-1">Manage Permissions</h3>
                        <p className="text-sm text-cyber-400 mb-4">Select sections {editingUser.email} can manage.</p>

                        <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2">
                            {sections.map(section => (
                                <div
                                    key={section.id}
                                    onClick={() => toggleSection(section.id)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all
                                        ${selectedSections.includes(section.id)
                                            ? 'bg-cyber-700/50 border-cyber-primary text-white'
                                            : 'bg-cyber-900 border-cyber-800 text-cyber-400 hover:border-cyber-600'}
                                    `}
                                >
                                    <span className="font-medium">{section.title}</span>
                                    {selectedSections.includes(section.id) && <Check size={16} className="text-cyber-primary" />}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-cyber-700">
                            <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSavePermissions} className="btn btn-primary">Save Permissions</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
