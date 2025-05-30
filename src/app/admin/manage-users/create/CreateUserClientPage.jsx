// app/admin/manage-users/create/CreateUserClientPage.jsx
"use client";

import React from 'react';
import SignUpForm from '@/components/forms/SignUpForm'; // Your modified SignUpForm
import MaxWidthWrapper from '@/components/others/MaxWidthWrapper';

export default function CreateUserClientPage() {
    
    const handleUserCreated = (newUserProfile) => {
        console.log("Admin created new user:", newUserProfile);
        // Optionally: Add user to a list displayed on this page, or show a persistent success message.
        // For now, SignUpForm handles its own success message and form reset.
    };

    return (
        <div className="py-10">
            <MaxWidthWrapper className="max-w-2xl"> {/* Constrain width for the form */}
                {/* SignUpForm is already styled, so we just place it */}
                <SignUpForm
                    isAdminCreating={true}
                    onSuccess={handleUserCreated}
                />
            </MaxWidthWrapper>
        </div>
    );
}