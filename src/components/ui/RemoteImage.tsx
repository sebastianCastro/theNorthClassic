import Image from "next/image";

type RemoteImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
};

function isLocalSrc(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

/** Local assets use next/image; external direct links use a native img tag. */
export function RemoteImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  style,
  sizes,
  priority,
}: RemoteImageProps) {
  if (isLocalSrc(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        style={style}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={
        fill ? `absolute inset-0 h-full w-full ${className}` : className
      }
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
