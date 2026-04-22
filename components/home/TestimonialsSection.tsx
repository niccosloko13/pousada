import { Quote } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";

export function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle eyebrow="Depoimentos" title="Quem se hospeda recomenda" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {pousada.depoimentos.map((depoimento) => (
          <article key={depoimento.nome} className="rounded-2xl border border-slate-200 bg-white p-6">
            <Quote className="h-5 w-5 text-cyan-700" />
            <p className="mt-3 text-slate-700">&ldquo;{depoimento.texto}&rdquo;</p>
            <p className="mt-4 text-sm font-semibold text-slate-900">{depoimento.nome}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
