// Een vooraf gerenderd 3D-object (public/3d/*.webp) uit dezelfde bouwdoos als de interactieve machines.
// Altijd lazy en met vaste afmetingen, zodat er niets verspringt tijdens het laden.

type Props = {
  name: string;
  w: number;
  h: number;
  /** Beschikbare breedtes (bestanden heten dan name-<breedte>.webp); zonder: één bestand name.webp. */
  widths?: number[];
  sizes?: string;
  className?: string;
  alt?: string;
  eager?: boolean;
};

export function Still({ name, w, h, widths, sizes, className, alt = "", eager }: Props) {
  const src = widths ? `/3d/${name}-${widths[0]}.webp` : `/3d/${name}.webp`;
  const srcSet = widths ? widths.map((x) => `/3d/${name}-${x}.webp ${x}w`).join(", ") : undefined;
  return (
    <img
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes ?? "(min-width: 900px) 40vw, 90vw" : undefined}
      width={w}
      height={h}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      aria-hidden={alt ? undefined : true}
      draggable={false}
    />
  );
}
