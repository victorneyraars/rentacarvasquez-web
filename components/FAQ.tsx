import { JsonLd } from "./JsonLd";
import { buildFaqSchema } from "@/lib/json-ld";

const FAQS = [
  {
    question: "Que requisitos necesito para arrendar un auto en Puerto Natales?",
    answer: "Necesitas licencia de conducir vigente (nacional o internacional), cedula de identidad o pasaporte, tarjeta de credito para el deposito de garantia y ser mayor de 21 anos. Para vehiculos 4x4 recomendamos experiencia en conduccion off-road.",
  },
  {
    question: "Puedo retirar el auto en el aeropuerto de Puerto Natales?",
    answer: "Si, ofrecemos entrega y retiro en el Aeropuerto Teniente Julio Gallardo (PNT) sin costo adicional. Coordinamos el horario al confirmar tu reserva.",
  },
  {
    question: "El seguro esta incluido en el precio?",
    answer: "Si, todos nuestros vehiculos incluyen seguro de responsabilidad civil y cobertura por colision. Tambien ofrecemos cobertura adicional premium para mayor tranquilidad.",
  },
  {
    question: "Puedo viajar a Torres del Paine con el auto arrendado?",
    answer: "Absolutamente. Nuestra flota incluye vehiculos SUV y 4x4 especialmente preparados para los caminos de la Patagonia. Torres del Paine esta a 2 horas de Puerto Natales.",
  },
  {
    question: "Que metodos de pago aceptan?",
    answer: "Aceptamos transferencia bancaria, tarjeta de credito y debito, y efectivo. El deposito de garantia se retiene en tarjeta de credito al momento del retiro.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-20">
      <JsonLd data={buildFaqSchema(FAQS)} />
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-4xl font-extrabold text-slate-900 text-center mb-4">
          Preguntas Frecuentes
        </h2>
        <p className="text-center text-slate-600 mb-12">
          Todo lo que necesitas saber antes de arrendar tu auto en Puerto Natales
        </p>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="group rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200 open:ring-brand-200"
            >
              <summary className="cursor-pointer list-none font-bold text-slate-900 flex justify-between items-center">
                <span>{f.question}</span>
                <span className="ml-4 text-brand-600 group-open:rotate-45 transition-transform text-2xl">
                  +
                </span>
              </summary>
              <p className="mt-4 text-slate-600 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
