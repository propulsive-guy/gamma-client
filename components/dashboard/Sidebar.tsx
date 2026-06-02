'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    HomeIcon,
    DocumentTextIcon,
    TableCellsIcon,
    ShoppingBagIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: HomeIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
    { name: 'Menu', href: '/dashboard/menu', icon: DocumentTextIcon },
    { name: 'Tables', href: '/dashboard/tables', icon: TableCellsIcon },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBagIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-sky-50 text-slate-900 w-64 border-r border-sky-100">
            <div className="px-6 py-7 border-b border-sky-100">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold tracking-tight text-slate-900 select-none">BitByte</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-sky-200/60 text-sky-700'
                                : 'text-slate-600 hover:bg-sky-100 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-sky-600' : ''}`} />
                            <span>{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="px-3 py-4 border-t border-sky-100">
                <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
