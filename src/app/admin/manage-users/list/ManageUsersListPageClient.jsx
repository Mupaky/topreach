// app/admin/manage-users/list/ManageUsersListPageClient.jsx
"use client";

import React, { useState, useEffect, useMemo  } from 'react';
import { Edit2, KeyRound, UserCircle2, ShieldAlert, Trash2 } from 'lucide-react'; // More icons
import { Input } from '@/components/ui/input';
import { Button as ShadButton } from '@/components/ui/button'; // Assuming shadcn button
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { BeatLoader } from "react-spinners";


// --- Edit User Details Form ---
function EditUserDetailsForm({ user, onSave, onCancel, setErrorParent, setSuccessParent }) {
    const [fullName, setFullName] = useState(user.fullname || "");
    const [email, setEmail] = useState(user.email || ""); // Usually email is not changed easily
    const [role, setRole] = useState(user.role || "user");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorParent(null);
        setSuccessParent(null);

        try {
            const response = await fetch(`/api/admin/manage-users/${user.id}`, { // API endpoint for updating user details
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, role }) // Send only updatable fields
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Грешка при обновяване на детайли.");
            onSave(result.profile); // Pass back the updated profile
            setSuccessParent("Детайлите на потребителя са обновени.");
        } catch (err) {
            console.error("Error updating user details:", err);
            setErrorParent(err.message);
        }
        setIsLoading(false);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="editFullName" className="block text-sm font-medium text-gray-300">Пълно Име</label>
                <Input id="editFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" />
            </div>
            <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-300">Имейл (обикновено не се променя)</label>
                <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" disabled />
            </div>
             <div>
                <label htmlFor="editRole" className="block text-sm font-medium text-gray-300">Роля</label>
                <select id="editRole" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white focus:ring-accent focus:border-accent">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <DialogFooter className="pt-4">
                <ShadButton type="button" variant="outline" onClick={onCancel} className="text-gray-300 border-gray-600 hover:bg-gray-700">Отказ</ShadButton>
                <ShadButton type="submit" disabled={isLoading} className="bg-accent hover:bg-accentLighter text-white">
                    {isLoading ? <BeatLoader size={8} color="#fff" /> : "Запази Детайли"}
                </ShadButton>
            </DialogFooter>
        </form>
    );
}

// --- Change User Password Form (Admin) ---
function AdminChangeUserPasswordForm({ user, onSave, onCancel, setErrorParent, setSuccessParent }) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorParent(null);
        setSuccessParent(null);
        if (newPassword !== confirmPassword) {
            setErrorParent("Паролите не съвпадат.");
            setIsLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setErrorParent("Паролата трябва да е поне 6 символа.");
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch(`/api/admin/manage-users/${user.id}/change-password`, { // Specific API endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Грешка при смяна на паролата.");
            onSave(); // Just notify success, no data to pass back usually for password
            setSuccessParent("Паролата на потребителя е сменена успешно.");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Error changing user password by admin:", err);
            setErrorParent(err.message);
        }
        setIsLoading(false);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="adminNewPass" className="block text-sm font-medium text-gray-300">Нова Парола</label>
                <Input id="adminNewPass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" />
            </div>
            <div>
                <label htmlFor="adminConfirmPass" className="block text-sm font-medium text-gray-300">Потвърди Нова Парола</label>
                <Input id="adminConfirmPass" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" />
            </div>
            <DialogFooter className="pt-4">
                <ShadButton type="button" variant="outline" onClick={onCancel} className="text-gray-300 border-gray-600 hover:bg-gray-700">Отказ</ShadButton>
                <ShadButton type="submit" disabled={isLoading} className="bg-accent hover:bg-accentLighter text-white">
                    {isLoading ? <BeatLoader size={8} color="#fff" /> : "Смени Паролата"}
                </ShadButton>
            </DialogFooter>
        </form>
    );
}


export default function ManageUsersListPageClient({ initialUsers, serverFetchError }) {
    const [users, setUsers] = useState(initialUsers || []);
    const [error, setError] = useState(serverFetchError || null);
    const [success, setSuccess] = useState(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isClientMounted, setIsClientMounted] = useState(false);

    useEffect(() => {
        setIsClientMounted(true);
    }, []);
    
    useEffect(() => { // Sync props to state
        setUsers(initialUsers || []);
        setError(serverFetchError || null);
    }, [initialUsers, serverFetchError]);


    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleUserDetailsUpdated = (updatedProfile) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedProfile.id ? updatedProfile : u));
        setSelectedUserForEdit(null); // Close dialog
    };
    
    const handleUserPasswordChanged = () => {
        // No user data to update locally from password change, just close dialog
        setSelectedUserForPassword(null);
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Сигурни ли сте, че искате да изтриете потребител ${userEmail}? Тази операция е необратима и ще изтрие потребителя от Supabase Auth и вашата 'profiles' таблица.`)) {
            return;
        }
        setError(null); setSuccess(null);
        try {
            const response = await fetch(`/api/admin/manage-users/${userId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Грешка при изтриване.");
            setUsers(prev => prev.filter(u => u.id !== userId));
            setSuccess(result.message || "Потребителят е изтрит успешно.");
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.message);
        }
    };

    if (!isClientMounted) {
        return <div className="text-white text-center p-10">Зареждане на управлението на потребители...</div>;
    }
    
    if (error && users.length === 0) { // If fetch error and no users loaded
         return <div className="text-red-400 text-center p-10">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Списък на Потребители</h1>
            {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
            {success && <p className="text-green-400 bg-green-900/30 p-3 rounded-md">{success}</p>}

            <Input
                type="text"
                placeholder="Търси по име или имейл..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Име</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имейл</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Роля</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Регистриран на</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.fullname}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-600 text-red-100' : 'bg-blue-600 text-blue-100'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString('bg-BG')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Dialog open={selectedUserForEdit?.id === user.id} onOpenChange={(isOpen) => !isOpen && setSelectedUserForEdit(null)}>
                                        <DialogTrigger asChild>
                                            <ShadButton variant="outline" size="sm" onClick={() => {setSelectedUserForEdit(user); setError(null); setSuccess(null);}} className="text-blue-400 hover:text-blue-300 border-blue-500/50 hover:bg-blue-500/10">
                                                <UserCircle2 size={14} className="mr-1" /> Детайли
                                            </ShadButton>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                                            <DialogHeader><DialogTitle>Редактирай Детайли: {selectedUserForEdit?.fullname}</DialogTitle></DialogHeader>
                                            {selectedUserForEdit && <EditUserDetailsForm user={selectedUserForEdit} onSave={handleUserDetailsUpdated} onCancel={() => setSelectedUserForEdit(null)} setErrorParent={setError} setSuccessParent={setSuccess} />}
                                        </DialogContent>
                                    </Dialog>
                                     <Dialog open={selectedUserForPassword?.id === user.id} onOpenChange={(isOpen) => !isOpen && setSelectedUserForPassword(null)}>
                                        <DialogTrigger asChild>
                                            <ShadButton variant="outline" size="sm" onClick={() => {setSelectedUserForPassword(user); setError(null); setSuccess(null);}} className="text-yellow-400 hover:text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/10">
                                                <KeyRound size={14} className="mr-1" /> Парола
                                            </ShadButton>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                                            <DialogHeader><DialogTitle>Смени Парола за: {selectedUserForPassword?.fullname}</DialogTitle></DialogHeader>
                                            {selectedUserForPassword && <AdminChangeUserPasswordForm user={selectedUserForPassword} onSave={handleUserPasswordChanged} onCancel={() => setSelectedUserForPassword(null)} setErrorParent={setError} setSuccessParent={setSuccess}/>}
                                        </DialogContent>
                                    </Dialog>
                                    {/* Add Delete User Button Here */}
                                    <ShadButton variant="outline" size="sm" onClick={() => handleDeleteUser(user.id, user.email)} className="text-red-400 hover:text-red-300 border-red-500/50 hover:bg-red-500/10">
                                        <Trash2 size={14} className="mr-1" /> Изтрий
                                    </ShadButton>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                    {searchTerm ? "Няма намерени потребители по вашето търсене." : "Няма регистрирани потребители."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}