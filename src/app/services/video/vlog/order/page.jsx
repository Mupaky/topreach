import React from 'react';
import Navbar from '@/components/navbars/Navbar';
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import VlogOrder from '@/pages/VlogOrder';

export default async function page() {
    const session = await getSession();
	let user;

    if (!session) {
        redirect('/');
    } else {
		user = session.user;
	}

    return (
        <>
            <Navbar/>
            <VlogOrder user={user}/>
        </>
    )
}
