'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { getMe } from '@/lib/admin-api';
import { obtenerJwt } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/auth-api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesion activa -> redirigir al dashboard
  useEffect(() => {
    const token = obtenerJwt();
    if (!token) {
      setChecking(false);
      return;
    }
    getMe()
      .then(() => router.replace('/admin/dashboard'))
      .catch(() => {
        // Token invalido, ignorar (el usuario puede volver a loguearse)
        setChecking(false);
      });
  }, [router]);

  function handleSuccess(_user: AuthUser) {
    router.replace('/admin/dashboard');
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-3xl">⏳</div>
          <p className="text-sm text-slate-600">Verificando sesion...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Panel del prestador
          </h1>
          <p className="mt-2 text-slate-600">
            Inicia sesion con tu cuenta de Google para gestionar tus reservas.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/50">
          <GoogleLoginButton
            onSuccess={handleSuccess}
            label="Iniciar sesion con Google"
          />
          {error && (
            <p className="mt-3 text-center text-sm text-red-600">{error}</p>
          )}
          <p className="mt-4 text-center text-xs text-slate-500">
            Solo usuarios autorizados. Si no tenes acceso, contacta al
            administrador.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </main>
  );
}
