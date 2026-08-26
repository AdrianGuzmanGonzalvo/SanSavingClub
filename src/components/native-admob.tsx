"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { BANNER_AD_UNIT_ID, INTERSTITIAL_AD_UNIT_ID } from "@/lib/admob";

// Initializes AdMob and shows a bottom-anchored banner — only runs inside the
// wrapped native app, never on the regular website (mirrors NativeStatusBar's
// Capacitor.isNativePlatform() guard).
export function NativeAdMob() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    import("@capacitor-community/admob").then(async ({ AdMob, BannerAdPosition, BannerAdSize }) => {
      await AdMob.initialize();
      await AdMob.showBanner({
        adId: BANNER_AD_UNIT_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        isTesting: true,
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
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_UNIT_ID, isTesting: true });
    await AdMob.showInterstitial();
  } catch {
    // Ad not ready/failed to load — never block the user's actual task on this.
  }
}
