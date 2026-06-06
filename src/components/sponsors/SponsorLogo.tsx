import Image from "next/image";
import { isLocalUpload } from "@/lib/upload-limits";
import {
  displayNameColor,
  displayNameInitials,
  isValidImageUrl,
} from "@/lib/team-logo";

type SponsorLogoProps = {
  name: string;
  logoUrl?: string | null;
  height?: number;
  className?: string;
};

export function SponsorLogo({
  name,
  logoUrl,
  height = 56,
  className = "",
}: SponsorLogoProps) {
  const initials = displayNameInitials(name);
  const bg = displayNameColor(name);

  if (isValidImageUrl(logoUrl)) {
    const src = logoUrl!.trim();
    const imageClass = `w-auto object-contain ${className}`;
    const imageStyle = { height, maxWidth: 160 };

    if (isLocalUpload(src)) {
      return (
        <Image
          src={src}
          alt={name}
          width={160}
          height={height}
          className={imageClass}
          style={imageStyle}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={imageClass}
        style={imageStyle}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg font-bold text-white ${className}`}
      style={{
        height,
        minWidth: height * 1.6,
        maxWidth: 160,
        paddingInline: 12,
        backgroundColor: bg,
        fontSize: height * 0.32,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
