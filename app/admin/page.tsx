'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { getMe, aceptarInvitacion } from '@/lib/admin-api';
import { obtenerJwt, limpiarJwt } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/auth-api';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aceptando, setAceptando] = useState(false);

  function decodeToken(token: string): { prestador_id: string; email: string } | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { prestador_id: payload.prestador_id, email: payload.email };
    } catch {
      return null;
    }
  }

  async function procesarInvitacion() {
    if (!inviteToken) return;
    setChecking(false);
    const decoded = decodeToken(inviteToken);
    if (!decoded || !decoded.prestador_id) {
      setError('El enlace de invitación es inválido o está corrupto.');
      return;
    }
    
    setAceptando(true);
    try {
      await aceptarInvitacion(decoded.prestador_id, inviteToken);
      router.replace('/admin/dashboard?invite_ok=1');
    } catch (err: any) {
      setError(err.message || 'Error al aceptar la invitación');
      setAceptando(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    const token = obtenerJwt();
    const decodedInvite = inviteToken ? decodeToken(inviteToken) : null;
    const inviteEmail = decodedInvite?.email;

    if (!token) {
      setChecking(false);
      return;
    }
    
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
    
    Promise.race([getMe(), timeout])
      .then((user) => {
        if (!mounted) return;
        
        // ¡AQUÍ ESTÁ LA MAGIA! Si hay invitación y el email no coincide, borramos la sesión.
        if (inviteEmail && user.email !== inviteEmail) {
          limpiarJwt();
          setChecking(false);
          setError(`Has iniciado sesión como ${user.email}. Por favor, ingresá con ${inviteEmail} para aceptar la invitación.`);
          return;
        }

        setChecking(false);
        if (inviteToken) {
          procesarInvitacion();
        } else {
          router.replace('/admin/dashboard');
        }
      })
      .catch(() => {
        if (!mounted) return;
        setChecking(false);
      });
    return () => { mounted = false; };
  }, [router, inviteToken]);

  async function handleSuccess(_user: AuthUser) {
    await new Promise((r) => setTimeout(r, 100));
    if (inviteToken) {
      await procesarInvitacion();
    } else {
      router.replace('/admin/dashboard');
    }
  }

  if (aceptando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-3xl">⏳</div>
          <p className="text-sm text-slate-600">Aceptando invitación...</p>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-3xl">⏳</div>
          <p className="text-sm text-slate-600">Verificando sesión...</p>
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
            ? 'Iniciá sesión para aceptar la invitación a colaborar.' 
            : 'Ingresá con tu cuenta de Google para gestionar tus reservas.'}
        </p>
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <GoogleLoginButton onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Cargando...</p>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
