'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { 
  Search, 
  UserCheck, 
  Gift, 
  BarChart3, 
  Menu,
  X,
  Home,
  TrendingUp,
  Coins
} from 'lucide-react';

const sidebarItems = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: Home 
  },
  { 
    name: 'Search Users', 
    href: '/admin/dashboard/search', 
    icon: Search 
  },
  { 
    name: 'OTP Verification', 
    href: '/admin/dashboard/verification', 
    icon: UserCheck 
  },
  { 
    name: 'Bonus Management', 
    href: '/admin/dashboard/bonus', 
    icon: Gift 
  },
  { 
    name: 'FamPoints', 
    href: '/admin/dashboard/fampoints', 
    icon: Coins 
  },
  { 
    name: 'Analytics', 
    href: '/admin/dashboard/analytics', 
    icon: BarChart3 
  },
  { 
    name: 'Google Analytics', 
    href: '/admin/dashboard/google-analytics', 
    icon: TrendingUp 
  },
];

function AdminDashboardLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme, ThemeToggle } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-row">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-72 bg-[var(--background)] border-r border-gray-200 dark:border-gray-700 shadow-xl">
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-20 px-6 border-gray-200 dark:border-gray-700">
      
        </div>
        {/* Navigation */}
        <nav className="mt-8 px-4 flex-1">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--primary)] text-white shadow-lg transform scale-105'
                        : 'text-[var(--text)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] hover:transform hover:scale-105'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-4 h-5 w-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[var(--primary)]'}`} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Sidebar footer pinned to bottom */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
          <Link 
            href="/"
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-[var(--text)] hover:text-[var(--primary)] bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            ← Back to Main Site
          </Link>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex-1 py-20">
        {/* Top bar for mobile */}
        <div className="bg-[var(--background)] border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--text)]">Admin Panel</h1>
              <ThemeToggle />
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardLayout({ children }) {
  return (
    <ThemeProvider>
      <AdminDashboardLayoutInner>
        {children}
      </AdminDashboardLayoutInner>
    </ThemeProvider>
  );
}
