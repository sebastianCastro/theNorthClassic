import Image from "next/image";
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
    return (
      <Image
        src={logoUrl!}
        alt={name}
        width={160}
        height={height}
        className={`w-auto object-contain ${className}`}
        style={{ height, maxWidth: 160 }}
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
