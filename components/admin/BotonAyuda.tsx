'use client';

import { useState } from 'react';

export default function BotonAyuda() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ayuda"
        title="Guía completa de operación del panel"
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-3 sm:py-1.5 sm:text-sm"
      >
        ? Ayuda
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">
                📖 Guía completa del panel
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-sm text-slate-700">
              <section>
                <h3 className="mb-2 font-bold text-slate-900">🎯 ¿Qué hace este panel?</h3>
                <p>
                  Gestiona todas las reservas de tu flota. Cada reserva que entra
                  desde la web de <strong>rentacarvasquez.com</strong> aparece acá.
                  Vos decidís si aceptarla o rechazarla, y el cliente recibe un email
                  automático con tu decisión.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-bold text-slate-900">🔄 Flujo paso a paso</h3>
                <ol className="ml-5 list-decimal space-y-2">
                  <li>
                    <strong>Cliente reserva</strong> en la web (elige fechas, auto y
                    completa sus datos). Recibe un OTP por email para verificar.
                  </li>
                  <li>
                    <strong>Vos recibís notificación</strong> por email + ves la
                    reserva acá como <strong>Pendiente</strong>.
                  </li>
                  <li>
                    <strong>Revisás los datos</strong>: cliente, fechas, vehículo, total.
                    Si necesitás coordinar detalles, contactalo por WhatsApp.
                  </li>
                  <li>
                    <strong>Click en Aceptar o Rechazar</strong>. El sistema
                    automáticamente envía email al cliente.
                  </li>
                  <li>
                    Si aceptaste: <strong>prepará el vehículo</strong> el día del retiro
                    (limpieza, combustible, documentación).
                  </li>
                  <li>
                    <strong>Al devolver</strong>: verificá el estado del auto y
                    recibí las llaves.
                  </li>
                </ol>
              </section>

              <section>
                <h3 className="mb-2 font-bold text-slate-900">📊 Estados de reserva</h3>
                <ul className="ml-5 space-y-1.5">
                  <li>
                    🟡 <strong>Pendiente</strong>: el cliente reservó pero vos todavía
                    no decidiste. Requiere tu acción.
                  </li>
                  <li>
                    🟢 <strong>Confirmada</strong>: ya aceptaste. El cliente recibió
                    instrucciones de retiro por email.
                  </li>
                  <li>
                    🔴 <strong>Cancelada</strong>: rechazaste. El auto quedó libre y
                    el cliente fue notificado.
                  </li>
                  <li>
                    ⚠️ <strong>Vencida</strong>: pendiente con fecha de inicio pasada.
                    Rechazala o contactá al cliente.
                  </li>
                  <li>
                    🟠 <strong>Para devolver</strong>: confirmada con fecha de fin
                    pasada. Verificá si devolvieron el auto.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 font-bold text-slate-900">💡 Buenas prácticas</h3>
                <ul className="ml-5 list-disc space-y-1.5">
                  <li>
                    <strong>Revisá las pendientes todos los días</strong>. Si un
                    cliente reserva para mañana y no confirmás, queda sin auto.
                  </li>
                  <li>
                    <strong>Verificá el email del cliente</strong>. El badge ✅ indica
                    que verificó su email (canal confiable). Si no lo hizo,
                    contactalo por WhatsApp.
                  </li>
                  <li>
                    <strong>Coordiná antes de aceptar</strong>: si el cliente no
                    dejó teléfono, pedile que se comunique antes de confirmar.
                  </li>
                  <li>
                    <strong>Prepará el auto con anticipación</strong>: llaves,
                    documentación, tanque lleno, limpio.
                  </li>
                  <li>
                    <strong>Rechazá con motivo</strong>: si no podés aceptar (auto
                    no disponible, cliente sospechoso), rechazá y el sistema le
                    envía email explicativo.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 font-bold text-slate-900">📞 Canales de contacto con el cliente</h3>
                <ul className="ml-5 list-disc space-y-1.5">
                  <li>
                    <strong>WhatsApp</strong>: botón directo en el detalle de cada
                    reserva (si el cliente dejó teléfono).
                  </li>
                  <li>
                    <strong>Email</strong>: el sistema lo usa automáticamente para
                    notificar. Podés ver el email del cliente en el detalle.
                  </li>
                  <li>
                    <strong>Teléfono</strong>: link directo para llamar desde
                    el detalle.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 font-bold text-slate-900">❓ ¿Problemas?</h3>
                <p>
                  Si una reserva muestra error o no podés completar una acción,
                  contactá al soporte técnico de Baqueano Natales.
                </p>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
