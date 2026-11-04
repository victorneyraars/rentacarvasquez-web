'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { getMe } from '@/lib/admin-api';
import { obtenerJwt, guardarJwt, limpiarJwt } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/auth-api';
import { API_URL } from '@/lib/api';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aceptando, setAceptando] = useState(false);

  async function aceptarInvitacionMagicLink() {
    if (!inviteToken) return;
    setAceptando(true);
    setError(null);
    try {
      const res = await fetch(
        API_URL + '/api/v1/prestadores/invitaciones/aceptar',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: inviteToken }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const mensaje =
          typeof err.detail === 'string'
            ? err.detail
            : 'Error al aceptar la invitacion';
        throw new Error(mensaje);
      }

      const data = await res.json();
      guardarJwt(data.access_token);
      router.replace('/admin/dashboard?invite_ok=1');
    } catch (err: any) {
      setError(err.message);
      setAceptando(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    if (inviteToken) {
      aceptarInvitacionMagicLink();
      return;
    }

    const token = obtenerJwt();
    if (!token) {
      setChecking(false);
      return;
    }

    getMe()
      .then(() => {
        if (mounted) router.replace('/admin/dashboard');
      })
      .catch(() => {
        if (mounted) setChecking(false);
      });

    return () => {
      mounted = false;
    };
  }, [router, inviteToken]);

  async function handleSuccess(_user: AuthUser) {
    // Si hay una invitación pendiente, el login con Google acaba de crear la
    // cuenta en el backend. Reintentamos aceptar la invitación con el token.
    if (inviteToken) {
      await aceptarInvitacionMagicLink();
    } else {
      router.replace('/admin/dashboard');
    }
  }

  if (aceptando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-3xl">&#9203;</div>
          <p className="text-sm text-slate-600">Aceptando invitacion...</p>
        </div>
      </div>
    );
  }

  if (checking && !inviteToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-3xl">&#9203;</div>
          <p className="text-sm text-slate-600">Verificando sesion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Panel Admin</h1>
        <p className="mb-6 text-sm text-slate-500">
          {inviteToken
            ? 'Procesando tu invitacion...'
            : 'Ingresa con tu cuenta para gestionar tus reservas.'}
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
            <button
              onClick={() => {
                limpiarJwt();
                window.location.reload();
              }}
              className="mt-2 block w-full text-left font-bold underline hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        )}

        {(!inviteToken || error) && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="mb-3 text-sm text-slate-600">
              {inviteToken
                ? 'Inicia sesión con Google para registrarte y aceptar la invitación:'
                : 'Ingresa con tu cuenta:'}
            </p>
            <GoogleLoginButton onSuccess={handleSuccess} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
          Cargando...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
