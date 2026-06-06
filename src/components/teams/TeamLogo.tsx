import { teamAvatarColor, teamInitials, isValidImageUrl } from "@/lib/team-logo";
import { RemoteImage } from "@/components/ui/RemoteImage";

type TeamLogoProps = {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
};

export function TeamLogo({
  name,
  logoUrl,
  size = 96,
  className = "",
}: TeamLogoProps) {
  const initials = teamInitials(name);
  const bg = teamAvatarColor(name);

  if (isValidImageUrl(logoUrl)) {
    return (
      <RemoteImage
        src={logoUrl!}
        alt={`Logo de ${name}`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: size * 0.35,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
