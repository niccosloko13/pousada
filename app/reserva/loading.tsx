import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

function SkeletonCard() {
  return (
    <article className="animate-pulse rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-4 md:grid-cols-[250px_1fr]">
        <div className="h-52 rounded-2xl bg-slate-200" />
        <div className="space-y-3">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="h-8 w-40 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="h-7 rounded-full bg-slate-100" />
        <div className="h-7 rounded-full bg-slate-100" />
        <div className="h-7 rounded-full bg-slate-100" />
        <div className="h-7 rounded-full bg-slate-100" />
      </div>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
        <div className="space-y-2">
          <div className="h-4 w-44 rounded bg-slate-200" />
          <div className="h-4 w-52 rounded bg-slate-200" />
        </div>
        <div className="h-11 w-56 rounded-xl bg-slate-200" />
      </div>
    </article>
  );
}

export default function ReservaLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="animate-pulse rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
          <div className="h-3 w-44 rounded bg-cyan-100" />
          <div className="mt-2 h-7 w-72 rounded bg-cyan-200" />
          <div className="mt-2 h-4 w-96 max-w-full rounded bg-cyan-100" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.62fr_0.85fr] lg:items-start">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <aside className="animate-pulse space-y-4">
            <div className="h-72 rounded-3xl border border-slate-200 bg-white" />
            <div className="h-44 rounded-3xl border border-slate-200 bg-white" />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
