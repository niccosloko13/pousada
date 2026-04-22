import Image from "next/image";
import { Star } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { googleReviewsMock } from "@/data/google-reviews";

export function GoogleReviewsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle
        eyebrow="Prova social"
        title="Avaliações no Google"
        subtitle="Estrutura pronta para sincronizar automaticamente com avaliações reais."
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Image src="/globe.svg" alt="Google" width={26} height={26} />
            <p className="text-lg font-bold text-slate-900">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>{" "}
              Reviews
            </p>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-4xl font-extrabold text-slate-900">{googleReviewsMock.score.toFixed(1)}</p>
            <p className="pb-1 text-sm text-slate-600">de 5,0</p>
          </div>
          <p className="mt-1 text-sm text-slate-600">{googleReviewsMock.totalReviews} avaliações</p>
          <div className="mt-3 flex gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star key={idx} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <a
            href={googleReviewsMock.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white"
          >
            Ver mais avaliações no Google
          </a>
          <p className="mt-3 text-xs text-slate-500">{googleReviewsMock.note}</p>
        </article>

        <div className="space-y-3">
          {googleReviewsMock.reviews.map((review) => (
            <article key={review.text} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-700">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{review.author}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
