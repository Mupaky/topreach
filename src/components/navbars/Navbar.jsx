import React from 'react';
import ClientNavbar from './ClientNavbar';
import { getSession } from "@/utils/lib";

export default async function Navbar() {
    const session = await getSession();

    return (
        <ClientNavbar session={session}/>
    )
}
