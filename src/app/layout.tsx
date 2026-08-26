import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NativeStatusBar } from "@/components/native-status-bar";
import { NativeAdMob } from "@/components/native-admob";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sansavingclub.com"),
  title: "SanSavingClub",
  description: "Private group savings (ROSCA / Tanda) with manually tracked monthly contributions.",
  other: { "google-adsense-account": "ca-pub-9466569123047223" },
};

// viewport-fit=cover lets the app read env(safe-area-inset-*) — needed so
// content doesn't sit under the status bar/notch in the wrapped mobile app.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {process.env.NODE_ENV === "production" && (
          // Plain <script>, not next/script's <Script>: AdSense's site-verification
          // crawler looks for a literal <script src="..."> tag in the raw HTML.
          // next/script's beforeInteractive strategy instead emits a <link rel=preload>
          // plus a __next_s bootstrap array, which the crawler doesn't recognize.
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9466569123047223"
            crossOrigin="anonymous"
          />
        )}
        <NativeStatusBar />
        <NativeAdMob />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider locale={locale} dict={dict}>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster />
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
