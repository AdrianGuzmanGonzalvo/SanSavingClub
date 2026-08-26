import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/bottom-nav";
import { ClubNavProvider } from "@/lib/club-nav-context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [unreadCount, administeredClubsCount] = await Promise.all([
    prisma.notification.count({ where: { userId: session.user.id, isRead: false } }),
    prisma.savingsClub.count({ where: { adminId: session.user.id, status: { not: "CANCELLED" } } }),
  ]);

  return (
    <ClubNavProvider>
      <div className="flex min-h-screen flex-col bg-muted/20">
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav isLeader={administeredClubsCount > 0} unreadCount={unreadCount} />
      </div>
    </ClubNavProvider>
  );
}
