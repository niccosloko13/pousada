import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { googleReviewsMock } from "@/data/google-reviews";
import { COMPANY_CNPJ, COMPANY_LEGAL_NAME } from "@/lib/company";

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.min(1, Math.max(0, score - index));
        return (
          <div key={index} className="relative h-5 w-5">
            <Star className="absolute inset-0 h-5 w-5 text-slate-600/35" aria-hidden />
            <div className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${fill * 100}%` }}>
              <Star className="h-5 w-5 fill-current" aria-hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.5 29.7 4 24 4 12.3 4 3 13.3 3 25s9.3 21 21 21 21-9.3 21-21c0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.8 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.5 29.7 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.9 0 11.2-2.3 15.2-6l-7-5.3C29.9 34.8 27.1 36 24 36c-5.2 0-9.6-3.3-11.3-7.8l-6.6 5.1C9.7 39.7 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.1-2.1 4-3.9 5.5l7 5.3c-2.5 2.3-5.8 3.7-9.4 3.7-6.6 0-12-5.4-12-12 0-1.3.2-2.6.6-3.7H6.3C5.1 21.8 4.5 23.4 4.5 25c0 11.7 9.8 21.2 21.5 21.2 5.3 0 10.1-1.9 13.8-5.1l-6.6-5.1c-1.8 1.2-4.1 2-6.7 2-5.9 0-10.7-4.8-10.7-10.7 0-2.4.8-4.6 2.2-6.4H43.6V20.5z" />
    </svg>
  );
}

export function GoogleReviewsSection() {
  return (
    <section className="rounded-b-[2rem] bg-slate-950 pb-14 pt-6 text-white md:pb-16 md:pt-8">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <SectionTitle
          eyebrow="Avaliações Google"
          title="Confiança logo de cara: experiências reais de hóspedes"
          subtitle="Destaque profissional da reputação — ideal para decisão rápida na reserva."
          variant="dark"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <article className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md shadow-black/20">
                  <GoogleMark className="h-9 w-9" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/90">Google</p>
                  <p className="text-lg font-extrabold tracking-tight">Reviews</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black leading-none tracking-tight md:text-6xl">{googleReviewsMock.score.toFixed(1)}</p>
                <p className="mt-2 text-sm font-medium text-slate-300">de 5,0</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StarRow score={googleReviewsMock.score} />
              <span className="text-sm font-semibold text-slate-200">{googleReviewsMock.totalReviews} avaliações</span>
            </div>

            <Link
              href={googleReviewsMock.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-lg shadow-black/25 transition hover:bg-slate-100"
            >
              Ver mais avaliações no Google
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <p className="mt-4 text-xs leading-relaxed text-slate-400">{googleReviewsMock.note}</p>
            <p className="mt-4 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-300">{COMPANY_LEGAL_NAME}</span>
              <span className="mx-1 text-slate-600">·</span>
              <span className="font-mono text-slate-400">CNPJ {COMPANY_CNPJ}</span>
            </p>
          </article>

          <div className="space-y-4">
            {googleReviewsMock.reviews.map((review) => (
              <article
                key={review.text}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md"
              >
                <p className="text-sm leading-relaxed text-slate-100">&ldquo;{review.text}&rdquo;</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-amber-200/90">{review.author}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
