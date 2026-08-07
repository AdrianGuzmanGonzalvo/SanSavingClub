"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { dict: t } = useI18n();

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5">
      <span className="font-mono text-sm font-semibold tracking-widest">{code}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} aria-label={t.clubs.detail.copyInviteCode}>
        {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
