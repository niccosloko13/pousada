import Image from "next/image";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export function ImageGallery({ images, title }: ImageGalleryProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div key={image} className="relative h-52 overflow-hidden rounded-2xl">
            <Image src={image} alt={title} fill className="object-cover transition hover:scale-105" />
          </div>
        ))}
      </div>
    </section>
  );
}
