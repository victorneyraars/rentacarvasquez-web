'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  getMiPrestador,
  getAuditLog,
  type AdminAuditLogEntry,
  type AdminAuditLogPage,
  type MiPrestador,
} from '@/lib/admin-api';

// ═══════════════════════════════════════════════════════════
// Configuración de iconos y colores por acción
// ═══════════════════════════════════════════════════════════
interface AccionConfig {
  icono: string;
  color: string;
  bg: string;
  label: string;
}

const ACCIONES: Record<string, AccionConfig> = {
  colaborador_invitado: {
    icono: '👤',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    label: 'Colaborador invitado',
  },
  colaborador_activado: {
    icono: '✅',
    color: 'text-green-700',
    bg: 'bg-green-100',
    label: 'Colaborador activado',
  },
  colaborador_eliminado: {
    icono: '🗑️',
    color: 'text-red-700',
    bg: 'bg-red-100',
    label: 'Colaborador eliminado',
  },
  reserva_confirmada: {
    icono: '✅',
    color: 'text-green-700',
    bg: 'bg-green-100',
    label: 'Reserva confirmada',
  },
  reserva_cancelada: {
    icono: '❌',
    color: 'text-red-700',
    bg: 'bg-red-100',
    label: 'Reserva cancelada',
  },
  canal_actualizado: {
    icono: '📧',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    label: 'Canal actualizado',
  },
  vehiculo_creado: {
    icono: '🚗',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    label: 'Vehículo creado',
  },
  vehiculo_actualizado: {
    icono: '✏️',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    label: 'Vehículo actualizado',
  },
  vehiculo_eliminado: {
    icono: '🗑️',
    color: 'text-red-700',
    bg: 'bg-red-100',
    label: 'Vehículo eliminado',
  },
};

const ENTIDADES: Array<{ value: string; label: string; icono: string }> = [
  { value: 'todos', label: 'Todas', icono: '📋' },
  { value: 'colaborador', label: 'Colaboradores', icono: '👥' },
  { value: 'reserva', label: 'Reservas', icono: '📅' },
  { value: 'canal', label: 'Canales', icono: '📧' },
  { value: 'vehiculo', label: 'Vehículos', icono: '🚗' },
];

const PAGE_SIZE = 20;

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
function getAccionConfig(accion: string): AccionConfig {
  return (
    ACCIONES[accion] || {
      icono: '🔔',
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      label: accion.replaceAll('_', ' '),
    }
  );
}

function getEntidadLink(entidad: string, entidadId: string | null): string | null {
  if (!entidadId) return null;
  if (entidad === 'colaborador') return '/admin/dashboard/colaboradores';
  if (entidad === 'reserva') return `/admin/dashboard/${entidadId}`;
  return null;
}

function fechaRelativa(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'hace instantes';
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHr < 24) return `hace ${diffHr}h`;
    if (diffDay === 1) return 'ayer';
    if (diffDay < 7) return `hace ${diffDay} días`;
    if (diffDay < 30) return `hace ${Math.floor(diffDay / 7)} sem`;
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fechaAbsoluta(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function extractMetadata(entry: AdminAuditLogEntry): string | null {
  const m = entry.metadata;
  if (!m) return null;
  const parts: string[] = [];
  if (typeof m.nombre === 'string' && m.nombre) parts.push(String(m.nombre));
  if (typeof m.email === 'string' && m.email) parts.push(String(m.email));
  if (typeof m.whatsapp === 'string' && m.whatsapp) parts.push(String(m.whatsapp));
  return parts.length ? parts.join(' · ') : null;
}

// ═══════════════════════════════════════════════════════════
// Componente principal
// ═══════════════════════════════════════════════════════════
function AuditoriaContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const entidadParam = searchParams.get('entidad') || 'todos';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [prestador, setPrestador] = useState<MiPrestador | null>(null);
  const [page, setPage] = useState<AdminAuditLogPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Cargar datos ──
  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const p = await getMiPrestador();
        if (cancelado) return;
        if (!p) {
          setError('No tenés un prestador registrado.');
          setLoading(false);
          return;
        }
        if (!p.es_owner) {
          setError('__not_owner__');
          setLoading(false);
          return;
        }
        setPrestador(p);
        const data = await getAuditLog(p.id, {
          page: pageParam,
          page_size: PAGE_SIZE,
          entidad: entidadParam !== 'todos' ? entidadParam : undefined,
        });
        if (cancelado) return;
        setPage(data);
      } catch (e: any) {
        if (cancelado) return;
        setError(e.message || 'Error al cargar auditoría');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [entidadParam, pageParam]);

  // ── Cambio de filtro ──
  function setEntidad(entidad: string) {
    const params = new URLSearchParams();
    if (entidad !== 'todos') params.set('entidad', entidad);
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function setPagina(nuevaPagina: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nuevaPagina));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // ── Auto-redirect si no es owner ──
  useEffect(() => {
    if (error !== '__not_owner__') return;
    const timer = setTimeout(() => router.replace('/admin/dashboard'), 5000);
    return () => clearTimeout(timer);
  }, [error, router]);

  // ── Render ──
  if (loading) return <SkeletonLoader />;

  if (error === '__not_owner__') {
    return <NotOwnerView onVolver={() => router.replace('/admin/dashboard')} />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-3 text-3xl" aria-hidden="true">⚠️</div>
          <h2 className="text-lg font-semibold text-red-900">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const entradas = page?.data || [];
  const total = page?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Auditoría</h1>
        <p className="mt-1 text-sm text-slate-600">
          Historial de acciones sobre{' '}
          <strong className="text-slate-900">{prestador?.nombre}</strong>. Solo el
          dueño puede ver esta sección.
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {ENTIDADES.map((e) => (
          <button
            key={e.value}
            onClick={() => setEntidad(e.value)}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
              entidadParam === e.value
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span aria-hidden="true">{e.icono}</span>
            {e.label}
          </button>
        ))}
      </div>

      {/* Contador */}
      <div className="mb-3 text-sm text-slate-600">
        {total === 0 ? (
          '0 acciones registradas'
        ) : (
          <>
            Mostrando <strong className="text-slate-900">{entradas.length}</strong> de{' '}
            <strong className="text-slate-900">{total}</strong>{' '}
            {total === 1 ? 'acción' : 'acciones'}
          </>
        )}
      </div>

      {/* Lista */}
      {entradas.length === 0 ? (
        <EmptyState entidad={entidadParam} onLimpiar={() => setEntidad('todos')} />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <ol className="divide-y divide-slate-100">
              {entradas.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </ol>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Paginacion
              page={pageParam}
              totalPages={totalPages}
              onPrev={() => setPagina(pageParam - 1)}
              onNext={() => setPagina(pageParam + 1)}
              disabled={isPending}
            />
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Fila del timeline
// ═══════════════════════════════════════════════════════════
function AuditRow({ entry }: { entry: AdminAuditLogEntry }) {
  const cfg = getAccionConfig(entry.accion);
  const metadata = extractMetadata(entry);
  const link = getEntidadLink(entry.entidad, entry.entidad_id);

  const content = (
    <>
      {/* Icono */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg ${cfg.bg} ${cfg.color}`}
        aria-hidden="true"
      >
        {cfg.icono}
      </div>

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
          {entry.entidad_id && (
            <span className="text-xs text-slate-500">
              {entry.entidad}:{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">
                {entry.entidad_id.length > 30
                  ? entry.entidad_id.slice(0, 30) + '…'
                  : entry.entidad_id}
              </code>
            </span>
          )}
        </div>

        {metadata && (
          <div className="mt-1 truncate text-xs text-slate-600">{metadata}</div>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span title={fechaAbsoluta(entry.created_at)}>
            {fechaRelativa(entry.created_at)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{entry.user_email}</span>
        </div>
      </div>

      {/* Flecha para deep link */}
      {link && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 text-slate-400"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </>
  );

  return (
    <li>
      {link ? (
        <Link
          href={link}
          className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-6"
        >
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">{content}</div>
      )}
    </li>
  );
}

// ═══════════════════════════════════════════════════════════
// Paginación
// ═══════════════════════════════════════════════════════════
function Paginacion({
  page,
  totalPages,
  onPrev,
  onNext,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
}) {
  return (
    <nav
      className="mt-6 flex items-center justify-between"
      aria-label="Paginación"
    >
      <button
        onClick={onPrev}
        disabled={page <= 1 || disabled}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Anterior
      </button>
      <span className="text-sm text-slate-600">
        Página <strong className="text-slate-900">{page}</strong> de {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages || disabled}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// Empty state
// ═══════════════════════════════════════════════════════════
function EmptyState({
  entidad,
  onLimpiar,
}: {
  entidad: string;
  onLimpiar: () => void;
}) {
  const esFiltro = entidad !== 'todos';
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="mb-4 text-5xl" aria-hidden="true">
        {esFiltro ? '🔍' : '📋'}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        {esFiltro ? 'Sin resultados para este filtro' : 'Todavía no hay acciones'}
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {esFiltro
          ? 'Probá con otro filtro o limpiá la búsqueda.'
          : 'Cuando invites colaboradores, acepten invitaciones o gestionen reservas, las acciones van a aparecer acá.'}
      </p>
      {esFiltro && (
        <button
          onClick={onLimpiar}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ver todas las acciones
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NotOwnerView (reutilizado del colaboradores)
// ═══════════════════════════════════════════════════════════
function NotOwnerView({ onVolver }: { onVolver: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-12">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <div className="mb-4 text-5xl" aria-hidden="true">🔒</div>
        <h1 className="text-xl font-bold text-amber-900">
          Esta sección es solo para el dueño
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-amber-800">
          Como colaborador podés gestionar reservas y vehículos, pero no ver la
          auditoría del negocio. Si necesitás acceso, contactá al dueño.
        </p>
        <button
          onClick={onVolver}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          Volver al panel
        </button>
        <p className="mt-4 text-xs text-amber-700">
          Te redirigimos automáticamente en 5 segundos…
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Skeleton loader
// ═══════════════════════════════════════════════════════════
function SkeletonLoader() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-96 rounded bg-slate-100" />
      </div>
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-slate-200"
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-3 border-b border-slate-100 px-6 py-4 last:border-0"
          >
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-slate-200" />
              <div className="h-3 w-64 rounded bg-slate-100" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Export con Suspense (requerido por useSearchParams)
// ═══════════════════════════════════════════════════════════
export default function AuditoriaPage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <AuditoriaContent />
    </Suspense>
  );
}
