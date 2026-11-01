'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { getMe, aceptarInvitacion } from '@/lib/admin-api';
import { obtenerJwt } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/auth-api';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aceptando, setAceptando] = useState(false);

  // Decodificar el JWT localmente para sacar el prestador_id
  function getPrestadorIdFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.prestador_id || null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = obtenerJwt();
    
    // Si hay invite pero no hay sesión, dejamos que se loguee
    if (!token) {
      setChecking(false);
      return;
    }

    // Si hay sesión, verificar si es válida y procesar invite
    getMe()
      .then(async () => {
        if (inviteToken) {
          const prestadorId = getPrestadorIdFromToken(inviteToken);
          if (!prestadorId) {
            setError('El enlace de invitación es inválido o está corrupto.');
            setChecking(false);
            return;
          }
          
          setAceptando(true);
          try {
            await aceptarInvitacion(prestadorId, inviteToken);
            // Éxito: redirigir al dashboard con mensaje
            router.replace('/admin/dashboard?invite_ok=1');
          } catch (err: any) {
            setError(err.message || 'Error al aceptar la invitación');
            setAceptando(false);
          }
        } else {
          router.replace('/admin/dashboard');
        }
      })
      .catch(() => {
        // Token inválido, ignorar (el usuario puede volver a loguearse)
        setChecking(false);
      });
  }, [router, inviteToken]);

  async function handleSuccess(_user: AuthUser) {
    // Al loguearse, el useEffect se dispara de nuevo (porque cambia el estado)
    // Pero como no cambia de ruta, forzamos la ejecución recargando el estado
    const token = obtenerJwt();
    if (!token) return;

    if (inviteToken) {
      const prestadorId = getPrestadorIdFromToken(inviteToken);
      if (!prestadorId) {
        setError('Enlace de invitación inválido.');
        return;
      }
      setAceptando(true);
      try {
        await aceptarInvitacion(prestadorId, inviteToken);
        router.replace('/admin/dashboard?invite_ok=1');
      } catch (err: any) {
        setError(err.message || 'Error al aceptar invitación');
        setAceptando(false);
      }
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
