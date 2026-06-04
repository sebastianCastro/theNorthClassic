import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@/components/analytics/Analytics";
import { SITE, SITE_SEO_DESCRIPTION } from "@/lib/constants";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = buildMetadata({
  title: SITE.name,
  description: SITE_SEO_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${bebas.variable} ${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
