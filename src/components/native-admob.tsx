"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { BANNER_AD_UNIT_ID, INTERSTITIAL_AD_UNIT_ID } from "@/lib/admob";

// Requests/refreshes UMP consent info and shows the consent form when Google's
// config says one is required (EEA/UK/CH). Must run — and resolve to
// canRequestAds === true — before any ad is requested, on every ad path.
// https://developers.google.com/admob/ump/android/quick-start
async function ensureAdsConsent(): Promise<boolean> {
  const { AdMob, AdmobConsentStatus } = await import("@capacitor-community/admob");
  let info = await AdMob.requestConsentInfo();
  if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
    info = await AdMob.showConsentForm().catch(() => info);
  }
  return info.canRequestAds;
}

// Opens the privacy options form so a user can change their ad consent choice
// later (e.g. from a settings screen) — required alongside the consent flow
// above whenever Google's config marks a privacy options entry point needed.
export async function showAdPrivacyOptions() {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import("@capacitor-community/admob");
  await AdMob.showPrivacyOptionsForm().catch(() => {});
}

// Initializes AdMob and shows a bottom-anchored banner — only runs inside the
// wrapped native app, never on the regular website (mirrors NativeStatusBar's
// Capacitor.isNativePlatform() guard).
//
// Mounted only in the (app) layout, not the root layout: AdMob policy
// prohibits ads on screens without publisher content, so login/register/
// marketing/legal pages must never show a banner — only the authenticated
// screens with real club/savings data do.
//
// The banner is a native overlay, not part of the web page, and it sits at
// the same screen position as the web-rendered bottom nav — so it reports
// its own rendered height via events, and we push that into a CSS variable
// the bottom nav reads to shift itself up above the ad instead of being
// covered by it.
export function NativeAdMob() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    const setBannerHeight = (height: number) => {
      document.documentElement.style.setProperty("--admob-banner-height", `${height}px`);
    };

    import("@capacitor-community/admob").then(async ({ AdMob, BannerAdPluginEvents, BannerAdPosition, BannerAdSize }) => {
      if (cancelled) return;
      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => setBannerHeight(info.height));
      AdMob.addListener(BannerAdPluginEvents.Closed, () => setBannerHeight(0));

      const canRequestAds = await ensureAdsConsent();
      if (cancelled || !canRequestAds) return;

      await AdMob.initialize();
      if (cancelled) return;
      await AdMob.showBanner({
        adId: BANNER_AD_UNIT_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
      }).catch(() => {});
    });

    return () => {
      cancelled = true;
      setBannerHeight(0);
      import("@capacitor-community/admob").then(({ AdMob }) => {
        AdMob.removeBanner().catch(() => {});
      });
    };
  }, []);

  return null;
}

// Loads and shows an interstitial. Call this at a natural break point (e.g.
// after a task completes) — never mid-task, and never tied to a payment/form
// submission flow (forbidden interstitial placements per
// https://support.google.com/admob/answer/6201362). No-ops outside the native
// app or before ad consent is resolved. Assumes the SDK is already
// initialized by NativeAdMob, which is mounted everywhere this can be called
// from — initialize() must only run once, at launch.
export async function showInterstitialAd() {
  if (!Capacitor.isNativePlatform()) return;
  const { AdMob } = await import("@capacitor-community/admob");
  try {
    if (!(await ensureAdsConsent())) return;
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_UNIT_ID });
    await AdMob.showInterstitial();
  } catch {
    // Ad not ready/failed to load — never block the user's actual task on this.
  }
}
