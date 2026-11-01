'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMiPrestador,
  getColaboradores,
  invitarColaborador,
  eliminarColaborador,
  type AdminColaborador,
  type MiPrestador,
} from '@/lib/admin-api';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatFecha(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function iniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export default function ColaboradoresPage() {
  const router = useRouter();

  const [prestador, setPrestador] = useState<MiPrestador | null>(null);
  const [colaboradores, setColaboradores] = useState<AdminColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error';
    texto: string;
  } | null>(null);

  // Modal de invitar
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Confirmación de eliminar (inline)
  const [confirmando, setConfirmando] = useState<AdminColaborador | null>(null);

  // ── Cargar datos ──
  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const p = await getMiPrestador();
      if (!p) {
        setError('No tenés un prestador registrado.');
        setLoading(false);
        return;
      }
      if (!p.es_owner) {
        setPrestador(p);
        setLoading(false);
        // Auto-redirect con mensaje contextual
        setError('__not_owner__');
        return;
      }
      setPrestador(p);
      const items = await getColaboradores(p.id);
      setColaboradores(items);
    } catch (e: any) {
      setError(e.message || 'Error al cargar colaboradores');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-dismiss del mensaje ──
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 4000);
    return () => clearTimeout(t);
  }, [mensaje]);

  // ── Eliminar (con optimismo + rollback) ──
  function confirmarEliminar(colab: AdminColaborador) {
    setConfirmando(colab);
  }

  function handleEliminar() {
    if (!confirmando || !prestador) return;
    const colab = confirmando;
    const backup = colaboradores;

    setConfirmando(null);
    setColaboradores((prev) => prev.filter((c) => c.email !== colab.email));

    startTransition(async () => {
      try {
        await eliminarColaborador(prestador.id, colab.email);
        setMensaje({
          tipo: 'success',
          texto: `${colab.nombre} fue eliminado.`,
        });
      } catch (e: any) {
        setColaboradores(backup);
        setMensaje({
          tipo: 'error',
          texto: e.message || 'No se pudo eliminar',
        });
      }
    });
  }

  // ── Invitar ──
  async function handleInvitar(payload: {
    nombre: string;
    email: string;
    whatsapp: string;
  }) {
    if (!prestador) return;
    try {
      const nuevo = await invitarColaborador(prestador.id, {
        nombre: payload.nombre.trim(),
        email: payload.email.trim().toLowerCase(),
        whatsapp: payload.whatsapp.trim() || undefined,
      });
      setColaboradores((prev) => [...prev, nuevo]);
      setModalOpen(false);
      setMensaje({
        tipo: 'success',
        texto: `Invitación enviada a ${nuevo.email}.`,
      });
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e.message || 'Error al invitar' });
      throw e;
    }
  }

  // ── Render ──
  if (loading) {
    return <SkeletonLoader />;
  }

  // Error de "no autorizado" (permanente, no se reintenta)
  if (error === '__not_owner__') {
    return <NotOwnerView onVolver={() => router.replace('/admin/dashboard')} />;
  }

  // Error genérico (transitorio, sí se reintenta)
  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-3 text-3xl" aria-hidden="true">⚠️</div>
          <h2 className="text-lg font-semibold text-red-900">{error}</h2>
          <p className="mt-2 text-sm text-red-700">
            Si el problema persiste, cerrá sesión y volvé a entrar.
          </p>
          <button
            onClick={cargar}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Colaboradores
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Personas con acceso a{' '}
            <strong className="text-slate-900">{prestador?.nombre}</strong>. Pueden
            gestionar reservas y vehículos, pero no colaboradores ni auditoría.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 active:bg-brand-800"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Invitar colaborador
        </button>
      </div>

      {/* Toast */}
      {mensaje && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 rounded-lg border p-3 text-sm ${
            mensaje.tipo === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {mensaje.tipo === 'success' ? '✓ ' : '⚠️ '}
          {mensaje.texto}
        </div>
      )}

      {/* Lista */}
      {colaboradores.length === 0 ? (
        <EmptyState onInvitar={() => setModalOpen(true)} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header desktop */}
          <div className="hidden border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid md:grid-cols-12 md:gap-4">
            <div className="md:col-span-5">Colaborador</div>
            <div className="md:col-span-3">Estado</div>
            <div className="md:col-span-2">Invitado</div>
            <div className="md:col-span-2 text-right">Acciones</div>
          </div>

          <ul className="divide-y divide-slate-100">
            {colaboradores.map((c) => (
              <ColaboradorRow
                key={c.email}
                colab={c}
                confirming={confirmando?.email === c.email}
                onConfirmar={() => confirmarEliminar(c)}
                onCancelar={() => setConfirmando(null)}
                onEliminar={handleEliminar}
                disabled={isPending}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Modal invitar */}
      {modalOpen && (
        <InvitarModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleInvitar}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fila de colaborador (responsive: card en mobile, row en desktop)
// ─────────────────────────────────────────────────────────────
function ColaboradorRow({
  colab,
  confirming,
  onConfirmar,
  onCancelar,
  onEliminar,
  disabled,
}: {
  colab: AdminColaborador;
  confirming: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  onEliminar: () => void;
  disabled: boolean;
}) {
  const activo = colab.activado_at !== null;
  const waClean = (colab.whatsapp || '').replace(/[^0-9+]/g, '');

  return (
    <li className="px-4 py-4 md:grid md:grid-cols-12 md:items-center md:gap-4 md:px-6">
      {/* Colaborador */}
      <div className="flex items-center gap-3 md:col-span-5">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            activo
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
          aria-hidden="true"
        >
          {iniciales(colab.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-slate-900">
            {colab.nombre}
          </div>
          <div className="truncate text-sm text-slate-500">{colab.email}</div>
          {colab.whatsapp && (
            <a
              href={`https://wa.me/${waClean.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 hover:underline"
            >
              <span aria-hidden="true">💬</span>
              {colab.whatsapp}
            </a>
          )}
        </div>
      </div>

      {/* Estado */}
      <div className="mt-2 md:col-span-3 md:mt-0">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            activo
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              activo ? 'bg-green-500' : 'bg-amber-500'
            }`}
            aria-hidden="true"
          />
          {activo ? 'Activo' : 'Pendiente'}
        </span>
      </div>

      {/* Invitado */}
      <div className="mt-1 text-xs text-slate-500 md:col-span-2 md:mt-0 md:text-sm">
        {formatFecha(colab.invitado_at)}
      </div>

      {/* Acciones */}
      <div className="mt-3 flex justify-end md:col-span-2 md:mt-0">
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-red-700">¿Eliminar?</span>
            <button
              onClick={onEliminar}
              disabled={disabled}
              className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Sí
            </button>
            <button
              onClick={onCancelar}
              disabled={disabled}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={onConfirmar}
            aria-label={`Eliminar a ${colab.nombre}`}
            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────
function EmptyState({ onInvitar }: { onInvitar: () => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">
        👥
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        Todavía no hay colaboradores
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Invitá a alguien de confianza para que te ayude a gestionar reservas y
        vehículos. Van a tener acceso al panel, pero sin permisos para eliminar
        colaboradores ni ver la auditoría.
      </p>
      <button
        onClick={onInvitar}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
      >
        Invitar al primer colaborador
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────
function NotOwnerView({ onVolver }: { onVolver: () => void }) {
  useEffect(() => {
    // Auto-redirect a los 5s (le da tiempo a leer)
    const timer = setTimeout(onVolver, 5000);
    return () => clearTimeout(timer);
  }, [onVolver]);

  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <div className="mb-4 text-5xl" aria-hidden="true">🔒</div>
        <h1 className="text-xl font-bold text-amber-900">
          Esta sección es solo para el dueño
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-amber-800">
          Como colaborador podés gestionar reservas y vehículos, pero no invitar
          o eliminar colaboradores. Si necesitás acceso, contactá al dueño del
          negocio.
        </p>
        <button
          onClick={onVolver}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al panel
        </button>
        <p className="mt-4 text-xs text-amber-700">
          Te redirigimos automáticamente en 5 segundos…
        </p>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-96 rounded bg-slate-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-3 border-b border-slate-100 px-6 py-4 last:border-0"
          >
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-3 w-56 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Modal de invitar
// ─────────────────────────────────────────────────────────────
function InvitarModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (p: {
    nombre: string;
    email: string;
    whatsapp: string;
  }) => Promise<void>;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Esc para cerrar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !enviando) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enviando, onClose]);

  const nombreOk = nombre.trim().length >= 2;
  const emailOk = EMAIL_RE.test(email.trim());
  const puedeEnviar = nombreOk && emailOk && !enviando;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar) return;
    setErr(null);
    setEnviando(true);
    try {
      await onSubmit({ nombre, email, whatsapp });
    } catch (e: any) {
      setErr(e.message || 'Error al invitar');
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !enviando) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invitar-titulo"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2
          id="invitar-titulo"
          className="text-xl font-bold text-slate-900"
        >
          Invitar colaborador
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Le vamos a enviar un email con un link para aceptar la invitación.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-slate-700"
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              autoFocus
              disabled={enviando}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {nombre.length > 0 && !nombreOk && (
              <p className="mt-1 text-xs text-red-600">Mínimo 2 caracteres</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@email.com"
              disabled={enviando}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {email.length > 0 && !emailOk && (
              <p className="mt-1 text-xs text-red-600">Email inválido</p>
            )}
          </div>

          <div>
            <label
              htmlFor="whatsapp"
              className="block text-sm font-medium text-slate-700"
            >
              WhatsApp <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+56 9 1234 5678"
              disabled={enviando}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Para futuras notificaciones de reservas por WhatsApp.
            </p>
          </div>

          {err && (
            <div className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!puedeEnviar}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
