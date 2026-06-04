import Image from "next/image";
import {
  displayNameColor,
  displayNameInitials,
  isValidImageUrl,
} from "@/lib/team-logo";

type PersonAvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "lg";
};

export function PersonAvatar({
  name,
  photoUrl,
  size = 96,
  className = "",
  rounded = "full",
}: PersonAvatarProps) {
  const initials = displayNameInitials(name);
  const bg = displayNameColor(name);
  const radius = rounded === "full" ? "rounded-full" : "rounded-lg";

  if (isValidImageUrl(photoUrl)) {
    return (
      <div
        className={`relative overflow-hidden ${radius} ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={photoUrl!}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold text-white ${radius} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: size * 0.35,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
