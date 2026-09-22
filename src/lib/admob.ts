// Appended to the WebView's User-Agent (see capacitor.config.ts) so the server
// can tell the wrapped native app apart from regular browser traffic to the
// same URL and skip serving the AdSense web script to it — the app shows ads
// through this AdMob integration instead. Google prohibits raw AdSense script
// code inside a native/hybrid app WebView.
export const NATIVE_APP_UA_MARKER = "SanSavingClubApp";

// AdMob App ID, registered in the AdMob console under this app.
export const ADMOB_APP_ID = "ca-app-pub-9466569123047223~6803434229";

// Real banner ad unit, created in the AdMob console.
export const BANNER_AD_UNIT_ID = "ca-app-pub-9466569123047223/7896440888";

// Real interstitial ad unit, created in the AdMob console.
export const INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-9466569123047223/9508905457";
