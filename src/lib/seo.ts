import type { Metadata } from "next";
import {
  SITE,
  SITE_CONTACT_EMAIL,
  SITE_SEO_DESCRIPTION,
  TOURNAMENT_LOCATION,
} from "./constants";
import { NORTH_SOCIAL_LINKS, TIAGO_SOCIAL_LINKS } from "./social-links";

type MetaInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "profile";
};

export function buildMetadata({
  title,
  description,
  path = "",
  image,
  type = "website",
}: MetaInput): Metadata {
  const url = `${SITE.url}${path}`;
  const ogImage = image ?? `${SITE.url}/og-default.jpg`;

  return {
    title: `${title} | ${SITE.name}`,
    description,
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
      images: [ogImage],
    },
  };
}

function locationPostalAddress() {
  return {
    "@type": "PostalAddress" as const,
    addressLocality: TOURNAMENT_LOCATION.city,
    addressRegion: TOURNAMENT_LOCATION.state,
    addressCountry: TOURNAMENT_LOCATION.country,
  };
}

export function organizationJsonLd() {
  const sameAs = [
    NORTH_SOCIAL_LINKS.instagram,
    NORTH_SOCIAL_LINKS.facebook,
    TIAGO_SOCIAL_LINKS.instagram,
    TIAGO_SOCIAL_LINKS.facebook,
    TIAGO_SOCIAL_LINKS.youtube,
    TIAGO_SOCIAL_LINKS.tiktok,
  ].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: SITE.name,
    url: SITE.url,
    description: SITE_SEO_DESCRIPTION,
    sport: "Basketball",
    email: SITE_CONTACT_EMAIL,
    location: {
      "@type": "Place",
      name: TOURNAMENT_LOCATION.label,
      address: locationPostalAddress(),
    },
    areaServed: {
      "@type": "City",
      name: TOURNAMENT_LOCATION.city,
      containedInPlace: {
        "@type": "State",
        name: TOURNAMENT_LOCATION.state,
      },
    },
    sameAs,
  };
}

export function personJsonLd(player: {
  name: string;
  url: string;
  image?: string | null;
  team?: string | null;
  position?: string | null;
  height?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    url: player.url,
    image: player.image,
    jobTitle: player.position,
    memberOf: player.team
      ? { "@type": "SportsTeam", name: player.team }
      : undefined,
    height: player.height,
  };
}

export function sportsEventJsonLd(event: {
  name: string;
  edition?: string | null;
  startDate: string;
  endDate: string;
  location?: string;
  url: string;
}) {
  const placeName = event.location?.trim() || TOURNAMENT_LOCATION.label;

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    description: SITE_SEO_DESCRIPTION,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: placeName,
      address: locationPostalAddress(),
    },
    url: event.url,
    sport: "Basketball",
    organizer: {
      "@type": "SportsOrganization",
      name: SITE.name,
      url: SITE.url,
    },
    ...(event.edition ? { alternateName: event.edition } : {}),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function videoJsonLd(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  embedUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    embedUrl: video.embedUrl,
  };
}
