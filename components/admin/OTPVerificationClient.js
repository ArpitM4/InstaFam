"use client";
import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaInstagram } from 'react-icons/fa';

export default function OTPVerificationClient() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // userId being processed

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/pending-verifications');
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleVerify = async (userId) => {
        if (!confirm('Are you sure you want to verify this user?')) return;

        setProcessing(userId);
        try {
            const res = await fetch(`/api/admin/verify-user/${userId}`, {
                method: 'POST',
            });

            if (res.ok) {
                // Remove user from list
                setUsers(prev => prev.filter(u => u._id !== userId));
                alert('User verified successfully');
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to verify user');
            }
        } catch (error) {
            console.error('Error verifying user:', error);
            alert('An error occurred');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-2xl text-[var(--primary)]" /></div>;
    }

    if (users.length === 0) {
        return (
            <div className="bg-[#151515] rounded-xl p-8 text-center border border-white/5">
                <FaCheck className="mx-auto text-4xl text-green-500 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                <p className="text-gray-400">No pending verifications found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                        <th className="p-4">User</th>
                        <th className="p-4">Instagram</th>
                        <th className="p-4">OTP Provided</th>
                        <th className="p-4">Requested At</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                    {users.map((user) => (
                        <tr key={user._id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs">
                                        {user.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{user.name}</div>
                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2 text-pink-400">
                                    <FaInstagram />
                                    {user.instagram?.username || 'N/A'}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="font-mono bg-white/10 px-2 py-1 rounded text-white font-bold tracking-wider">
                                    {user.instagram?.otp || '---'}
                                </span>
                            </td>
                            <td className="p-4 text-gray-400">
                                {user.instagram?.otpGeneratedAt ? new Date(user.instagram.otpGeneratedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => handleVerify(user._id)}
                                    disabled={processing === user._id}
                                    className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/50 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                                >
                                    {processing === user._id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                    Verify
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
