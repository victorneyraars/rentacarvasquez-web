"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  verificarEmailReserva,
  reenviarOtpReserva,
} from "@/lib/api";

interface Props {
  reservaId: string;
  email: string;
  onSuccess?: () => void;
}

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen({
  reservaId,
  email,
  onSuccess,
}: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    // Auto-focus al siguiente
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < Math.min(text.length, OTP_LENGTH); i++) {
      next[i] = text[i];
    }
    setDigits(next);
    setError(null);
    const focusIdx = Math.min(text.length, OTP_LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const codigo = digits.join("");
    if (codigo.length !== OTP_LENGTH) {
      setError(`Ingresá los ${OTP_LENGTH} dígitos`);
      return;
    }
    setLoading(true);
    try {
      const res = await verificarEmailReserva(reservaId, codigo);
      if (res.ok && res.email_verificado) {
        setSuccess(true);
        onSuccess?.();
      } else {
        setError(res.mensaje || "No se pudo verificar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError(null);
    setResending(true);
    try {
      await reenviarOtpReserva(reservaId);
      setCooldown(COOLDOWN_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reenviar");
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200/50">
        <div className="mb-4 text-6xl">✅</div>
        <h2 className="mb-2 text-2xl font-extrabold text-slate-900">
          Reserva verificada
        </h2>
        <p className="mb-6 text-slate-600">
          Tu email quedó confirmado. Te contactaremos en breve con los
          detalles del retiro.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-accent-500 px-6 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-accent-600"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/50">
      <div className="mb-6">
        <div className="mb-2 text-3xl">📧</div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Verificá tu email
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Te enviamos un código de {OTP_LENGTH} dígitos a{" "}
          <strong className="text-slate-900">{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-12 rounded-lg border-2 border-slate-300 text-center text-2xl font-bold text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200"
              aria-label={`Dígito ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || digits.join("").length !== OTP_LENGTH}
          className="w-full rounded-xl bg-accent-500 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Verificar reserva"}
        </button>

        <div className="text-center text-sm text-slate-500">
          ¿No recibiste el código?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="font-semibold text-accent-600 hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resending
              ? "Reenviando..."
              : cooldown > 0
                ? `Reenviar en ${cooldown}s`
                : "Reenviar código"}
          </button>
        </div>
      </form>
    </div>
  );
}
