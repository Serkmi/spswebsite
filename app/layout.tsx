import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono } from "next/font/google";
import { Header, Footer } from "@/components/Chrome";
import { themeScript } from "@/components/ThemeToggle";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://seanpstewart.com"),
  title: {
    default: "Sean P. Stewart",
    template: "%s — Sean P. Stewart",
  },
  description:
    "Twenty years inside lending institutions, learning exactly how they work and exactly why they don't move. Now building the parts that should have existed already.",
  openGraph: {
    type: "website",
    siteName: "Sean P. Stewart",
    url: "https://seanpstewart.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="relative z-[1] mx-auto max-w-[80rem] px-6">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
