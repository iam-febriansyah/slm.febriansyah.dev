'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Package, FileText, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/cn';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Pelanggan', icon: Users },
  { href: '/dashboard/items', label: 'Barang', icon: Package },
  { href: '/dashboard/invoices', label: 'Invoice', icon: FileText },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-40 rounded-lg p-2 hover:bg-gray-100 md:hidden"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen w-64 bg-primary-900 text-white transition-transform md:translate-x-0 md:relative',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8 mt-8 md:mt-0">
            <h2 className="text-2xl font-bold">Mini ERP</h2>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2 transition-colors',
                    isActive ? 'bg-primary-600 text-white' : 'text-primary-100 hover:bg-primary-800'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-primary-100 hover:bg-primary-800">
            <LogOut size={20} className="mr-3" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
