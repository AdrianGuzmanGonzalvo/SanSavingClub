import type { Metadata } from "next";
import { headers } from "next/headers";
import { NATIVE_APP_UA_MARKER } from "@/lib/admob";

const ADSENSE_PUBLISHER_ID = "pub-9466569123047223";

export const metadata: Metadata = {
  other: { "google-adsense-account": `ca-${ADSENSE_PUBLISHER_ID}` },
};

// Public content pages — the only routes that carry the AdSense script. Google
// doesn't allow its ads on screens without publisher content (sign-in forms,
// error pages, the signed-in app), so the loader lives here rather than in the
// root layout. The contact and legal pages sit in (no-ads) for the same reason.
// Links from these pages to anything outside this group must be plain <a>
// tags, not <Link>: a client-side navigation would keep the already loaded ad
// script (and any anchor ad it placed) alive on the next screen.
export default async function ContentLayout({ children }: { children: React.ReactNode }) {
  // The wrapped native app appends NATIVE_APP_UA_MARKER to its WebView's User-Agent
  // (capacitor.config.ts) so we can tell it apart from real browser traffic to this
  // same URL. Google prohibits raw AdSense script code inside a native/hybrid app
  // WebView — the app shows ads through native-admob.tsx (real AdMob SDK) instead.
  const userAgent = (await headers()).get("user-agent") ?? "";
  const isNativeApp = userAgent.includes(NATIVE_APP_UA_MARKER);
  const showAdSense = process.env.NODE_ENV === "production" && !isNativeApp;

  return (
    <>
      {showAdSense && (
        <>
          {/* Google Funding Choices — CMP for EEA/UK/CH consent, must load before
              the AdSense script. The actual consent message is configured in the
              AdSense account's Privacy & messaging settings, not here. */}
          <script async src={`https://fundingchoicesmessages.google.com/i/${ADSENSE_PUBLISHER_ID}?ers=1`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){function signalGooglefcPresent(){if(!window.frames['googlefcPresent']){if(document.body){var iframe=document.createElement('iframe');iframe.style.cssText='width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;';iframe.style.display='none';iframe.name='googlefcPresent';document.body.appendChild(iframe);}else{setTimeout(signalGooglefcPresent,0);}}}signalGooglefcPresent();})();`,
            }}
          />
          {/* Plain <script>, not next/script's <Script>: AdSense's site-verification
              crawler looks for a literal <script src="..."> tag in the raw HTML.
              next/script's beforeInteractive strategy instead emits a <link rel=preload>
              plus a __next_s bootstrap array, which the crawler doesn't recognize. */}
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          />
        </>
      )}
      {children}
    </>
  );
}
