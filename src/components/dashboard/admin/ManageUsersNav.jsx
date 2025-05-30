"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserPlus, Users, Settings } from "lucide-react"; // Example icons

const navItems = [
    { href: "/admin/manage-users/create", label: "Създай Потребител", icon: UserPlus },
    { href: "/admin/manage-users/list", label: "Управлявай Потребители", icon: Users },
    // Future: { href: "/admin/manage-users/roles", label: "Управление на Роли", icon: Settings },
];

export default function ManageUsersNav() {
    const pathname = usePathname();

    return (
        <nav className="mb-8 p-4 bg-gray-800 rounded-lg shadow border border-gray-700">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin/manage-users" && pathname.startsWith(item.href));
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                                    transition-colors duration-150 ease-in-out
                                    ${isActive
                                        ? "bg-accent text-white shadow-md"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    }
                                `}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}