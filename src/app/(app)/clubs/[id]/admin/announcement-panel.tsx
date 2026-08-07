"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { postAnnouncementAction } from "../../actions";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export function AnnouncementPanel({ clubId, announcements }: { clubId: string; announcements: AnnouncementItem[] }) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await postAnnouncementAction(clubId, {}, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(t.clubs.admin.postedToast);
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4 text-primary" />
          {t.clubs.admin.announcementsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">{t.clubs.admin.titleLabel}</Label>
            <Input id="title" name="title" placeholder={t.clubs.admin.titlePlaceholder} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">{t.clubs.admin.contentLabel}</Label>
            <Textarea id="content" name="content" placeholder={t.clubs.admin.contentPlaceholder} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            {isPending ? t.clubs.admin.posting : t.clubs.admin.post}
          </Button>
        </form>

        <div className="flex flex-col gap-2 border-t pt-4">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
              <Megaphone className="h-6 w-6" />
              <p className="text-sm">{t.clubs.admin.noAnnouncementsYet}</p>
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="rounded-md border p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium">{a.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.createdAt}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">— {a.authorName}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
