import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [notifications, unreadCount, administeredClubsCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.count({ where: { userId: session.user.id, isRead: false } }),
    prisma.savingsClub.count({ where: { adminId: session.user.id, status: { not: "CANCELLED" } } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <AppHeader
        userName={session.user.name ?? "Member"}
        userEmail={session.user.email ?? ""}
        notifications={notifications}
        unreadCount={unreadCount}
        isLeader={administeredClubsCount > 0}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">{children}</main>
    </div>
  );
}
