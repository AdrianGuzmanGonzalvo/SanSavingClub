"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { BANNER_AD_UNIT_ID, INTERSTITIAL_AD_UNIT_ID } from "@/lib/admob";

// Initializes AdMob and shows a bottom-anchored banner — only runs inside the
// wrapped native app, never on the regular website (mirrors NativeStatusBar's
// Capacitor.isNativePlatform() guard).
//
// The banner is a native overlay, not part of the web page, and it sits at
// the same screen position as the web-rendered bottom nav — so it reports
// its own rendered height via events, and we push that into a CSS variable
// the bottom nav reads to shift itself up above the ad instead of being
// covered by it.
export function NativeAdMob() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    import("@capacitor-community/admob").then(async ({ AdMob, BannerAdPluginEvents, BannerAdPosition, BannerAdSize }) => {
      const setBannerHeight = (height: number) => {
        document.documentElement.style.setProperty("--admob-banner-height", `${height}px`);
      };
      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => setBannerHeight(info.height));
      AdMob.addListener(BannerAdPluginEvents.Closed, () => setBannerHeight(0));

      await AdMob.initialize();
      await AdMob.showBanner({
        adId: BANNER_AD_UNIT_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
      }).catch(() => {});
    });
  }, []);

  return null;
}

// Loads and shows an interstitial. Call this at a natural break point (e.g.
// after a task completes) — never mid-task. No-ops outside the native app.
export async function showInterstitialAd() {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import("@capacitor-community/admob");
  try {
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_UNIT_ID });
    await AdMob.showInterstitial();
  } catch {
    // Ad not ready/failed to load — never block the user's actual task on this.
  }
}
