import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function createNotification(params: {
  userId: string;
  clubId?: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      clubId: params.clubId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
    },
  });
}
