'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getMe, getMiPrestador, type AdminUser } from '@/lib/admin-api';
import { obtenerJwt, limpiarJwt } from '@/lib/auth-api';
import BotonAyuda from '@/components/admin/BotonAyuda';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = obtenerJwt();
    if (!token) {
      router.replace('/admin');
      return;
    }
    Promise.all([
      getMe(),
      getMiPrestador().catch(() => null),
    ])
      .then(([u, p]) => {
        setUser(u);
        setIsOwner(p?.es_owner === true);
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/admin/dashboard"
              className="text-sm font-extrabold text-slate-900 sm:text-lg"
            >
              <span className="hidden sm:inline">Rent a Car Vasquez</span>
              <span className="sm:hidden">RCV</span>
            </Link>
            <nav className="flex gap-3 text-xs sm:gap-4 sm:text-sm">
              <Link
                href="/admin/dashboard"
                className={`font-semibold transition-colors ${
                  pathname === '/admin/dashboard' ||
                  pathname.startsWith('/admin/dashboard/')
                    ? pathname === '/admin/dashboard'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reservas
              </Link>
              {isOwner && (
                <>
                  <Link
                    href="/admin/dashboard/calendario"
                    className={`font-semibold transition-colors ${
                      pathname === '/admin/dashboard/calendario'
                        ? 'text-brand-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Calendario
                  </Link>
                  <Link
                    href="/admin/dashboard/colaboradores"
                    className={`font-semibold transition-colors ${
                      pathname === '/admin/dashboard/colaboradores'
                        ? 'text-brand-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Colaboradores
                  </Link>
                  <Link
                    href="/admin/dashboard/auditoria"
                    className={`font-semibold transition-colors ${
                      pathname === '/admin/dashboard/auditoria'
                        ? 'text-brand-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Auditoría
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right text-sm sm:block">
              <div className="font-semibold text-slate-900">
                {user?.nombre || user?.email}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            {!isOwner && (
              <div className="text-xs font-semibold text-slate-900 sm:hidden">
                {user?.nombre || user?.email?.split('@')[0]}
              </div>
            )}
            <BotonAyuda />
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-sm"
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
