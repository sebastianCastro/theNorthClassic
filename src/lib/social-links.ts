import { prisma } from "./prisma";
import { parseJsonField } from "./utils";

export type SocialLinkSet = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
};

export type MediaSocialLinks = {
  north: SocialLinkSet;
  tiago: SocialLinkSet;
};

/** Canonical links — used as defaults and in seed. */
export const NORTH_SOCIAL_LINKS: SocialLinkSet = {
  instagram: "https://www.instagram.com/thenorth_classic",
  facebook:
    "https://www.facebook.com/share/17kGPoa4W1/?mibextid=wwXIfr",
};

export const TIAGO_SOCIAL_LINKS: SocialLinkSet = {
  instagram: "https://www.instagram.com/tiago.shoots",
  facebook: "https://www.facebook.com/share/1GzeMwYxAE/?mibextid=wwXIfr",
  tiktok: "https://www.tiktok.com/@tiago.shoots?_r=1&_t=ZS-96u7IfksiYL",
  youtube: "https://www.youtube.com/@tiagoshoots?si=daVRHmHiM0RpRA8V",
};

const DEFAULT_LINKS: MediaSocialLinks = {
  north: NORTH_SOCIAL_LINKS,
  tiago: TIAGO_SOCIAL_LINKS,
};

function pickLink(...candidates: (string | null | undefined)[]): string | undefined {
  for (const value of candidates) {
    if (value?.trim()) return value.trim();
  }
  return undefined;
}

export async function getMediaSocialLinks(): Promise<MediaSocialLinks> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
  });
  const fromConfig = parseJsonField<Partial<MediaSocialLinks>>(
    settings?.configJson
  );

  return {
    north: {
      instagram: pickLink(
        settings?.socialInstagram,
        fromConfig?.north?.instagram,
        DEFAULT_LINKS.north.instagram
      ),
      facebook: pickLink(
        settings?.socialFacebook,
        fromConfig?.north?.facebook,
        DEFAULT_LINKS.north.facebook
      ),
    },
    tiago: {
      instagram: pickLink(
        fromConfig?.tiago?.instagram,
        DEFAULT_LINKS.tiago.instagram
      ),
      facebook: pickLink(
        fromConfig?.tiago?.facebook,
        DEFAULT_LINKS.tiago.facebook
      ),
      youtube: pickLink(
        fromConfig?.tiago?.youtube,
        DEFAULT_LINKS.tiago.youtube
      ),
      tiktok: pickLink(fromConfig?.tiago?.tiktok, DEFAULT_LINKS.tiago.tiktok),
    },
  };
}
