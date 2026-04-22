import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import type { PousadaData } from "@/types/pousada";

export function GalleryPreview() {
  const pousadaData = pousada as PousadaData;
  const images = [
    ...(pousadaData.imagens_por_secao?.quartos ?? []),
    ...(pousadaData.imagens_por_secao?.cafe_da_manha ?? []),
    ...(pousadaData.imagens_por_secao?.lazer ?? []),
  ].slice(0, 6);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle
        eyebrow="Galeria"
        title="Veja a experiência antes de chegar"
        subtitle="Fotos reais da pousada para você escolher com confiança."
      />
      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {images.map((src, index) => (
          <div key={src} className={index === 0 ? "md:col-span-2 md:row-span-2" : ""}>
            <Image
              src={src}
              alt="Foto da pousada"
              width={800}
              height={600}
              className="h-full min-h-44 w-full rounded-xl object-cover"
            />
          </div>
        ))}
      </div>
      <Link href="/galeria" className="mt-6 inline-block text-sm font-semibold text-cyan-700 hover:text-cyan-600">
        Abrir galeria completa
      </Link>
    </section>
  );
}
