'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getMe, type AdminUser } from '@/lib/admin-api';
import { obtenerJwt, limpiarJwt } from '@/lib/auth-api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = obtenerJwt();
    if (!token) {
      router.replace('/admin');
      return;
    }
    getMe()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        limpiarJwt();
        router.replace('/admin');
      });
  }, [router]);

  function handleLogout() {
    limpiarJwt();
    router.replace('/admin');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-3xl">⏳</div>
          <p className="text-sm text-slate-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className="text-lg font-extrabold text-slate-900"
            >
              Rent a Car Vasquez
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/admin/dashboard"
                className={`font-semibold transition-colors ${
                  pathname === '/admin/dashboard'
                    ? 'text-brand-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reservas
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-semibold text-slate-900">
                {user?.nombre || user?.email}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
