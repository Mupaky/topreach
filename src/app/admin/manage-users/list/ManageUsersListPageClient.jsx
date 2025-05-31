// app/admin/manage-users/list/ManageUsersListPageClient.jsx
"use client";

import React, { useState, useEffect, useMemo  } from 'react';
import { Edit2, KeyRound, UserCircle2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'; // Added Chevron icons
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
            <div><label className="block text-sm font-medium text-gray-300">Пълно Име</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-300">Имейл</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" disabled /></div>
            <div><label className="block text-sm font-medium text-gray-300">Роля</label><select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white focus:ring-accent focus:border-accent"><option value="user">User</option><option value="admin">Admin</option></select></div>
            <DialogFooter className="pt-4"><ShadButton type="button" variant="outline" onClick={onCancel} className="text-gray-300 border-gray-600 hover:bg-gray-700">Отказ</ShadButton><ShadButton type="submit" disabled={isLoading} className="bg-accent hover:bg-accentLighter text-white">{isLoading ? <BeatLoader size={8} color="#fff" /> : "Запази"}</ShadButton></DialogFooter>
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
            <div><label className="block text-sm font-medium text-gray-300">Нова Парола</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-300">Потвърди</label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 bg-gray-700 border-gray-600 text-white" /></div>
            <DialogFooter className="pt-4"><ShadButton type="button" variant="outline" onClick={onCancel} className="text-gray-300 border-gray-600 hover:bg-gray-700">Отказ</ShadButton><ShadButton type="submit" disabled={isLoading} className="bg-accent hover:bg-accentLighter text-white">{isLoading ? <BeatLoader size={8} color="#fff" /> : "Смени"}</ShadButton></DialogFooter>
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
    const [expandedMobileCardId, setExpandedMobileCardId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null); 
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        setIsClientMounted(true);
    }, []);
    
    useEffect(() => { 
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
        setSelectedUserForEdit(null); 
    };
    
    const handleUserPasswordChanged = () => {
        setSelectedUserForPassword(null);
    };

    const handleDeleteUserConfirmation = (user) => { // Renamed to avoid conflict
        setUserToDelete(user); // Store the whole user object (or just id and email/name)
        setIsDeleteConfirmOpen(true);
        setError(null); // Clear previous errors when opening a new dialog
        setSuccess(null);
    };

    const executeDeleteUser = async () => {
        if (!userToDelete) return;

        setError(null);
        setSuccess(null);
        // Optionally add a loading state for the delete operation itself
        // setIsLoadingActions(true); 

        try {
            const response = await fetch(`/api/admin/manage-users/${userToDelete.id}`, { method: 'DELETE' });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Грешка при изтриване на потребителя.");
            }

            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setSuccess(result.message || "Потребителят е изтрит успешно.");
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.message);
        } finally {
            setIsDeleteConfirmOpen(false); // Close dialog
            setUserToDelete(null);       // Clear selected user for deletion
            // setIsLoadingActions(false);
        }
    };

    const toggleMobileCardDetails = (userId) => {
        setExpandedMobileCardId(prevId => (prevId === userId ? null : userId));
    };

    if (!isClientMounted) {
        return <div className="text-white text-center p-10">Зареждане на управлението на потребители...</div>;
    }
    
    if (error && users.length === 0) { // If fetch error and no users loaded
         return <div className="text-red-400 text-center p-10">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Списък на Потребители</h1>
            {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md text-sm">{error}</p>}
            {success && <p className="text-green-400 bg-green-900/30 p-3 rounded-md text-sm">{success}</p>}

            <Input
                type="text"
                placeholder="Търси по име или имейл..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm sm:text-base"
            />

            {/* Desktop Table View (hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto bg-gray-800 rounded-lg shadow border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Име</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имейл</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Роля</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Регистриран</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-700/30">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{user.fullname}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-600 text-red-100' : 'bg-blue-600 text-blue-100'}`}>{user.role}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString('bg-BG')}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                                    {/* Dialogs for desktop */}
                                    <Dialog open={selectedUserForEdit?.id === user.id} onOpenChange={(isOpen) => !isOpen && setSelectedUserForEdit(null)}>
                                        <DialogTrigger asChild><ShadButton variant="outline" size="sm" onClick={() => setSelectedUserForEdit(user)} className="text-blue-400 h-7 px-2 text-xs">Детайли</ShadButton></DialogTrigger>
                                        <DialogContent className="bg-gray-800 border-gray-700 text-white"><DialogHeader><DialogTitle>Ред. Детайли: {selectedUserForEdit?.fullname}</DialogTitle></DialogHeader>{selectedUserForEdit && <EditUserDetailsForm user={selectedUserForEdit} onSave={handleUserDetailsUpdated} onCancel={() => setSelectedUserForEdit(null)} setErrorParent={setError} setSuccessParent={setSuccess} />}</DialogContent>
                                    </Dialog>
                                    <Dialog open={selectedUserForPassword?.id === user.id} onOpenChange={(isOpen) => !isOpen && setSelectedUserForPassword(null)}>
                                        <DialogTrigger asChild><ShadButton variant="outline" size="sm" onClick={() => setSelectedUserForPassword(user)} className="text-yellow-400 h-7 px-2 text-xs">Парола</ShadButton></DialogTrigger>
                                        <DialogContent className="bg-gray-800 border-gray-700 text-white"><DialogHeader><DialogTitle>Смяна Парола: {selectedUserForPassword?.fullname}</DialogTitle></DialogHeader>{selectedUserForPassword && <AdminChangeUserPasswordForm user={selectedUserForPassword} onSave={handleUserPasswordChanged} onCancel={() => setSelectedUserForPassword(null)} setErrorParent={setError} setSuccessParent={setSuccess} />}</DialogContent>
                                    </Dialog>
                                    <ShadButton variant="outline" size="sm" onClick={() => handleDeleteUserConfirmation(user)} className="text-red-400 h-7 px-2 text-xs">Изтрий</ShadButton>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">{searchTerm ? "Няма резултати." : "Няма потребители."}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View (visible on small screens, hidden on md and up) */}
            <div className="md:hidden space-y-4">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                    const isExpanded = expandedMobileCardId === user.id;
                    return (
                        <div key={user.id} className="bg-gray-800 rounded-lg shadow border border-gray-700">
                            <div className="p-4 cursor-pointer" onClick={() => toggleMobileCardDetails(user.id)}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-md font-semibold text-white">{user.fullname}</h3>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                    {isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                                </div>
                                <div className="mt-1">
                                   <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-600 text-red-100' : 'bg-blue-600 text-blue-100'}`}>{user.role}</span>
                                   <span className="text-xs text-gray-500 ml-2">Рег: {new Date(user.created_at).toLocaleDateString('bg-BG')}</span>
                                </div>
                            </div>
                            {/* Collapsible Details and Actions for Mobile */}
                            {isExpanded && (
                                <div className="p-4 border-t border-gray-700 space-y-3">
                                    {/* Edit Details Dialog Trigger for Mobile */}
                                    <Dialog open={selectedUserForEdit?.id === user.id} onOpenChange={(isOpen) => !isOpen && setSelectedUserForEdit(null)}>
                                        <DialogTrigger asChild>
                                            <ShadButton variant="outline" size="sm" onClick={() => setSelectedUserForEdit(user)} className="w-full text-blue-400 border-blue-500/50 hover:bg-blue-500/10 justify-start">
                                                <UserCircle2 size={16} className="mr-2" /> Редактирай Детайли
                                            </ShadButton>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                                            <DialogHeader><DialogTitle>Редактирай: {selectedUserForEdit?.fullname}</DialogTitle></DialogHeader>
                                            {selectedUserForEdit && <EditUserDetailsForm user={selectedUserForEdit} onSave={handleUserDetailsUpdated} onCancel={() => setSelectedUserForEdit(null)} setErrorParent={setError} setSuccessParent={setSuccess} />}
                                        </DialogContent>
                                    </Dialog>

                                    {/* Change Password Dialog Trigger for Mobile */}
                                    <Dialog open={selectedUserForPassword?.id === user.id} onOpenChange={(isOpen) => !isOpen && setSelectedUserForPassword(null)}>
                                        <DialogTrigger asChild>
                                            <ShadButton variant="outline" size="sm" onClick={() => setSelectedUserForPassword(user)} className="w-full text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/10 justify-start">
                                                <KeyRound size={16} className="mr-2" /> Смени Парола
                                            </ShadButton>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                                            <DialogHeader><DialogTitle>Смяна Парола: {selectedUserForPassword?.fullname}</DialogTitle></DialogHeader>
                                            {selectedUserForPassword && <AdminChangeUserPasswordForm user={selectedUserForPassword} onSave={handleUserPasswordChanged} onCancel={() => setSelectedUserForPassword(null)} setErrorParent={setError} setSuccessParent={setSuccess} />}
                                        </DialogContent>
                                    </Dialog>
                                    
                                    {/* Delete Button for Mobile */}
                                    <ShadButton variant="outline" size="sm" onClick={() => handleDeleteUserConfirmation(user)} className="w-full text-red-400 border-red-500/50 hover:bg-red-500/10 justify-start">
                                        <Trash2 size={16} className="mr-2" /> Изтрий Потребител
                                    </ShadButton>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                     <p className="px-6 py-10 text-center text-sm text-gray-500">
                        {searchTerm ? "Няма намерени потребители по вашето търсене." : "Няма регистрирани потребители."}
                    </p>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {userToDelete && ( // Only render Dialog if userToDelete is set
                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white shadow-xl rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-red-400">Потвърждение за Изтриване</DialogTitle>
                            <DialogDescription className="text-gray-300 pt-2">
                                Сигурни ли сте, че искате да изтриете потребител: <br />
                                <strong className="text-white">{userToDelete.fullname}</strong> ({userToDelete.email})?
                                <br /><br />
                                Тази операция е необратима и ще изтрие потребителя от Supabase Auth и вашата \'profiles\' таблица.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-6 sm:justify-end gap-2"> {/* sm:justify-end for button alignment */}
                            <DialogClose asChild>
                                <ShadButton variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">
                                    Отказ
                                </ShadButton>
                            </DialogClose>
                            <ShadButton
                                variant="destructive" // Use destructive variant for delete actions
                                onClick={executeDeleteUser}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Изтрий Потребителя
                            </ShadButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}