"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ClipboardCheck, ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { reviewPaymentReportAction } from "../../actions";
import type { PaymentMethod } from "@prisma/client";

export interface PendingReport {
  id: string;
  memberName: string;
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  referenceNote: string | null;
  receiptUrl: string | null;
  submittedOn: string;
}

export function PaymentApprovalQueue({ clubId, reports }: { clubId: string; reports: PendingReport[] }) {
  const { dict: t } = useI18n();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          {t.clubs.admin.queueTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
            <ClipboardCheck className="h-6 w-6" />
            <p className="text-sm">{t.clubs.admin.queueEmpty}</p>
          </div>
        ) : (
          reports.map((report) => (
            <ReportRow key={report.id} clubId={clubId} report={report} onPreview={setPreviewUrl} />
          ))
        )}
      </CardContent>

      <Dialog open={previewUrl !== null} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.clubs.admin.viewReceipt}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Receipt" className="max-h-[70vh] w-full rounded-md object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ReportRow({
  clubId,
  report,
  onPreview,
}: {
  clubId: string;
  report: PendingReport;
  onPreview: (url: string) => void;
}) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReview(decision: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const result = await reviewPaymentReportAction(clubId, report.id, decision);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(decision === "APPROVED" ? t.clubs.admin.approvedToast : t.clubs.admin.rejectedToast);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">
          {report.memberName} &middot; {report.amount}
        </p>
        <p className="text-xs text-muted-foreground">
          {t.common.paymentMethods[report.method]} &middot; {report.paymentDate} &middot;{" "}
          {interpolate(t.clubs.admin.submittedOn, { date: report.submittedOn })}
        </p>
        {report.referenceNote && <p className="text-xs text-muted-foreground">{report.referenceNote}</p>}
      </div>
      <div className="flex items-center gap-2">
        {report.receiptUrl ? (
          <Button variant="outline" size="sm" onClick={() => onPreview(report.receiptUrl as string)}>
            {t.clubs.admin.viewReceipt}
          </Button>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageOff className="h-3.5 w-3.5" /> {t.clubs.admin.noReceipt}
          </span>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon-sm" variant="outline" disabled={isPending} onClick={() => handleReview("REJECTED")} aria-label={t.clubs.admin.reject}>
              <X className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.clubs.admin.reject}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon-sm" disabled={isPending} onClick={() => handleReview("APPROVED")} aria-label={t.clubs.admin.approve}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.clubs.admin.approve}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
