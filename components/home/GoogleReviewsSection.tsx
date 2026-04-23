import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Quote, Star } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { googleReviewsMock } from "@/data/google-reviews";

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

function GoogleOfficialMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.659 32.657 29.205 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.84 1.154 7.955 3.045l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.656 16.108 19.007 13 24 13c3.059 0 5.84 1.154 7.955 3.045l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.171 0 9.86-1.977 13.409-5.204l-6.19-5.238C29.14 35.091 26.703 36 24 36c-5.185 0-9.626-3.317-11.28-7.946l-6.508 5.015C9.53 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.06 12.06 0 0 1-4.084 5.558l6.19 5.238C39.245 37.107 44 31.069 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export function GoogleReviewsSection() {
  return (
    <section className="rounded-b-[2rem] bg-slate-100 pb-14 pt-8 text-slate-900 md:pb-16 md:pt-10">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <SectionTitle
          eyebrow="Avaliações Google"
          title="Reputação que transmite confiança antes da reserva"
          subtitle="Avaliações públicas no Google para você decidir com segurança e praticidade."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <GoogleOfficialMark className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Google</p>
                  <p className="text-lg font-extrabold tracking-tight">Google Reviews</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black leading-none tracking-tight text-slate-900 md:text-6xl">{googleReviewsMock.score.toFixed(1)}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">de 5,0</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StarRow score={googleReviewsMock.score} />
              <span className="text-sm font-semibold text-slate-700">Baseado em {googleReviewsMock.totalReviews} avaliações</span>
            </div>

            <Link
              href={googleReviewsMock.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800"
            >
              Ver mais avaliações no Google
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <BadgeCheck className="h-4 w-4" />
              Avaliações públicas e verificáveis
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600">{googleReviewsMock.note}</p>
          </article>

          <div className="space-y-4">
            {googleReviewsMock.reviews.map((review) => (
              <article
                key={review.text}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.10)]"
              >
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-cyan-700">
                  <Quote className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">&ldquo;{review.text}&rdquo;</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{review.author}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Hóspede verificado
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
