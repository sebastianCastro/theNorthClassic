import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import type { SocialLinkSet } from "@/lib/social-links";

type IconProps = SVGProps<SVGSVGElement>;

function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1-.31z" />
    </svg>
  );
}

type Network = "instagram" | "facebook" | "youtube" | "tiktok";

const NETWORK_META: Record<
  Network,
  { label: string; Icon: ComponentType<IconProps> }
> = {
  instagram: { label: "Instagram", Icon: InstagramIcon },
  facebook: { label: "Facebook", Icon: FacebookIcon },
  youtube: { label: "YouTube", Icon: YoutubeIcon },
  tiktok: { label: "TikTok", Icon: TikTokIcon },
};

type Props = {
  links: SocialLinkSet;
  className?: string;
  align?: "left" | "center";
};

export function SocialIconLinks({
  links,
  className,
  align = "center",
}: Props) {
  const items = (Object.keys(NETWORK_META) as Network[]).flatMap((network) => {
    const href = links[network];
    if (!href) return [];
    const { label, Icon } = NETWORK_META[network];
    return [{ network, href, label, Icon }];
  });

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        align === "center" && "justify-center",
        className
      )}
    >
      {items.map(({ network, href, label, Icon }) => (
        <Link
          key={network}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-black/40 text-muted transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-white"
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
