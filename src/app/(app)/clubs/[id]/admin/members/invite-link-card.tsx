"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function InviteLinkCard({ inviteUrl }: { inviteUrl: string }) {
  const { dict: t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="truncate font-mono text-muted-foreground">{inviteUrl}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {t.clubs.detail.copyInviteLink}
        </Button>
      </CardContent>
    </Card>
  );
}
