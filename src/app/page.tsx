import Image from "next/image";
import Link from "next/link";
import { texts } from "@/lib/config/texts";
import { createGalleryDataService } from "@/lib/services";

export default async function HomePage() {
  const galleryDataService = createGalleryDataService();
  const { photos } = await galleryDataService.getApprovedPhotosPage({ pageSize: 6 });

  return (
    <section className="-mx-4 -my-5 space-y-8 pb-10 sm:-mx-6 sm:-my-7 sm:space-y-10 sm:pb-12">
      <div className="relative h-[100svh] overflow-hidden">
        <Image
          src="/images/wedding-hero.png"
          alt="Portada de boda"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[rgba(107,114,92,0.26)]" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-linear-to-t from-[rgba(253,253,251,0.34)] via-[rgba(253,253,251,0.12)] to-transparent" />

        <div className="relative z-10 flex h-[100svh] flex-col items-center justify-end px-6 pb-14 text-center sm:pb-24">
          <div className="w-full max-w-3xl rounded-[1.6rem] bg-white/40 px-6 py-5 shadow-lg shadow-[rgba(107,114,92,0.18)] backdrop-blur-lg border border-white/20 sm:px-8 sm:py-6">
            <p className="hero-fade-in text-base leading-8 text-[var(--foreground)] sm:text-lg">
              Comparte con nosotros los momentos especiales que captures durante nuestra celebracion. Sube tus fotos y disfruta los recuerdos de este dia.
            </p>

            <div className="hero-fade-in-delay mt-6 flex w-full max-w-sm flex-col gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:justify-center sm:gap-5">
              <Link
                href="/upload"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent)] px-8 py-3 text-base font-medium text-white transition duration-300 hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {texts.landing.upload}
              </Link>
              <Link
                href="/gallery"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/85 bg-transparent px-8 py-3 text-base font-medium text-white transition duration-300 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {texts.landing.viewGallery}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <h2 className="text-2xl tracking-tight text-[var(--foreground)] sm:text-3xl">{texts.landing.latestMemories}</h2>
          <Link
            href="/gallery"
            className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
          >
            {texts.landing.viewFullGallery}
          </Link>
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]">{texts.landing.latestEmpty}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {photos.map((photo) => (
              <li key={photo.id} className="overflow-hidden rounded-lg">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={photo.url}
                    alt={texts.gallery.photoAlt(photo.fileKey)}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 48vw, 32vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
