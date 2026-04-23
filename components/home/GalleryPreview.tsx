import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import type { PousadaData } from "@/types/pousada";

export function GalleryPreview() {
  const pousadaData = pousada as PousadaData;
  const images = [
    ...(pousadaData.galeria ?? []),
    ...(pousadaData.imagens_por_secao?.quartos ?? []),
    ...(pousadaData.imagens_por_secao?.cafe_da_manha ?? []),
    ...(pousadaData.imagens_por_secao?.lazer ?? []),
  ].slice(0, 8);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle
        eyebrow="Galeria de lazer e hospedagem"
        title="Conheça os ambientes antes de fazer a reserva"
        subtitle="Uma prévia visual da pousada, das acomodações e das áreas para relaxar durante sua estadia."
      />
      <div className="mt-8 grid auto-rows-[180px] gap-3 md:grid-cols-4 md:auto-rows-[190px]">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={
              index === 0
                ? "relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-2"
                : index === 3
                  ? "relative overflow-hidden rounded-2xl md:col-span-2"
                  : "relative overflow-hidden rounded-2xl"
            }
          >
            <Image
              src={src}
              alt="Foto da pousada"
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
          </div>
        ))}
      </div>
      <Link href="/galeria" className="mt-6 inline-flex items-center rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-800 hover:bg-cyan-100">
        Abrir galeria completa
      </Link>
    </section>
  );
}
