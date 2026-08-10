"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Pushes the webview below the device status bar/notch instead of letting it
// overlay the content — only runs inside the wrapped native app, never on
// the regular website (Capacitor.isNativePlatform() is false there).
export function NativeStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    import("@capacitor/status-bar").then(({ StatusBar }) => {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    });
  }, []);

  return null;
}
