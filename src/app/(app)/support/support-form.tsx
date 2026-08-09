"use client";

import { useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";

const SUPPORT_EMAIL = "help@sansavingclub.com";
const CATEGORIES = ["BUG", "QUESTION", "SUGGESTION", "OTHER"] as const;
type Category = (typeof CATEGORIES)[number];

export function SupportForm({ userName, userEmail }: { userName: string; userEmail: string }) {
  const { dict: t } = useI18n();
  const [category, setCategory] = useState<Category>("BUG");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const categoryLabels: Record<Category, string> = {
    BUG: t.support.categoryBug,
    QUESTION: t.support.categoryQuestion,
    SUGGESTION: t.support.categorySuggestion,
    OTHER: t.support.categoryOther,
  };

  const mailtoHref = (() => {
    const subjectLine = interpolate(t.support.mailtoSubject, {
      category: categoryLabels[category],
      subject: subject.trim() || t.support.subjectPlaceholder,
    });
    const bodyLines = [
      interpolate(t.support.mailtoBodyIntro, { name: userName, email: userEmail }),
      interpolate(t.support.mailtoBodyCategory, { category: categoryLabels[category] }),
      "",
      description,
    ];
    const params = new URLSearchParams({ subject: subjectLine, body: bodyLines.join("\n") });
    return `mailto:${SUPPORT_EMAIL}?${params.toString().replace(/\+/g, "%20")}`;
  })();

  const canSend = description.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LifeBuoy className="h-4 w-4 text-primary" />
          {t.support.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">{t.support.categoryLabel}</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabels[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">{t.support.subjectLabel}</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t.support.subjectPlaceholder}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">{t.support.descriptionLabel}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.support.descriptionPlaceholder}
            className="min-h-32"
            required
          />
          {!canSend && <p className="text-xs text-muted-foreground">{t.support.descriptionRequired}</p>}
        </div>

        <p className="text-xs text-muted-foreground">
          {interpolate(t.support.reportedByNote, { name: userName, email: userEmail })}
        </p>

        {canSend ? (
          <Button asChild className="mt-2 self-start">
            <a href={mailtoHref}>
              <Send /> {t.support.sendButton}
            </a>
          </Button>
        ) : (
          <Button disabled className="mt-2 self-start">
            <Send /> {t.support.sendButton}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
