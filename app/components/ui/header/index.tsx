'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const pathname = usePathname();
    
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    
    const breadcrumbs = [
        { label: 'Home', href: '/', icon: Home },
        ...pathSegments.map((segment, index) => {
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            const href = '/' + pathSegments.slice(0, index + 1).join('/');
            return { label, href };
        })
    ];

    const tabs = [
        { href: '/', label: 'Home' },
        { href: 'users', label: 'Users' },
        { href: 'trips', label: 'Trips' },
        { href: 'organizers', label: 'Organizers' },
        { href: 'bookings', label: 'Bookings' },
    ];

    return (
        <header className="bg-white border rounded-lg border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-black tracking-tight">
                                Travaura
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Trip Managment Made Easy and Reliable.
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">U</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                    <nav className="flex items-center space-x-2 text-sm" aria-label="Tabs">
                        {breadcrumbs.map((crumb: any, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && (
                                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                                )}
                                <Link
                                    href={crumb.href}
                                    className={`flex items-center space-x-1 hover:text-black transition-colors ${
                                        index === breadcrumbs.length - 1
                                            ? 'text-black font-medium'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    {crumb.icon && <crumb.icon className="w-4 h-4" />}
                                    <span>{crumb.label}</span>
                                </Link>
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="relative">
                    <nav className="flex space-x-0" aria-label="Tabs">
                        {tabs.map((tab, index) => (
                            <Link
                                key={index}
                                href={`/${tab.href}`}
                                onClick={() => setActiveTab(tab.href)}
                                className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 ease-in-out ${
                                    pathname === `/${tab.href}` || (tab.href === '/' && pathname === '/')
                                        ? 'text-black bg-gray-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                                
                                {(pathname === `/${tab.href}` || (tab.href === '/' && pathname === '/')) && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}