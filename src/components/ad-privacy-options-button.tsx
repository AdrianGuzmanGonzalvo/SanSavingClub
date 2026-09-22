"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { ShieldCheck } from "lucide-react";
import { showAdPrivacyOptions } from "@/components/native-admob";

// Lets the user reopen the ad consent (UMP) form to change their choice later,
// as required alongside the consent flow in native-admob.tsx. Native app only
// — the web site's consent choice is managed by the CMP (Funding Choices)
// widget instead, not this button.
export function AdPrivacyOptionsButton({ label }: { label: string }) {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => setIsNative(Capacitor.isNativePlatform()), []);
  if (!isNative) return null;

  return (
    <button
      type="button"
      onClick={() => showAdPrivacyOptions()}
      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-accent"
    >
      <ShieldCheck className="h-4 w-4 text-primary" /> {label}
    </button>
  );
}
