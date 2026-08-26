import Link from "next/link";
import { Bell } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { MarkAllReadButton } from "./mark-all-read-button";

export default async function NotificationsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const session = await auth();

  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t.header.notifications}</h1>
        {hasUnread && <MarkAllReadButton label={t.notifications.markAllRead} />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Bell className="h-6 w-6" />
            <p className="font-medium">{t.header.noNotifications}</p>
            <p className="text-xs">{t.header.notificationsHint}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col divide-y rounded-lg border bg-card">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "/dashboard"}
              className={`flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-accent ${!n.isRead ? "bg-emerald-50/60 dark:bg-emerald-950/20" : ""}`}
            >
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <p className="text-xs text-muted-foreground">{formatDate(n.createdAt, locale)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
