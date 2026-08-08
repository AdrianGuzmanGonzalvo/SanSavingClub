"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Loader2, ScrollText, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { deletePaymentReportAction } from "../actions";

export interface PaymentHistoryEntry {
  id: string;
  memberName: string;
  cycleNumber: number | null;
  amount: string;
  submittedOn: string;
  approvedOn: string | null;
  receiptUrl: string | null;
}

export function PaymentHistoryCard({
  clubId,
  entries,
  restricted = false,
  isAdmin = false,
}: {
  clubId: string;
  entries: PaymentHistoryEntry[];
  restricted?: boolean;
  isAdmin?: boolean;
}) {
  const { dict: t } = useI18n();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ScrollText className="h-4 w-4 text-primary" />
          {t.clubs.detail.paymentHistoryTitle}
        </CardTitle>
        {restricted && <CardDescription>{t.clubs.detail.paymentHistoryRestrictedNote}</CardDescription>}
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
            <ScrollText className="h-6 w-6" />
            <p className="text-sm">{t.clubs.detail.paymentHistoryEmpty}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.clubs.detail.member}</TableHead>
                <TableHead>{t.clubs.detail.paymentHistoryCycle}</TableHead>
                <TableHead className="text-right">{t.clubs.pay.amount}</TableHead>
                <TableHead>{t.clubs.detail.paymentHistorySubmitted}</TableHead>
                <TableHead>{t.clubs.detail.paymentHistoryApproved}</TableHead>
                <TableHead className="text-right">{t.clubs.admin.viewReceipt}</TableHead>
                {isAdmin && <TableHead className="text-right">{t.clubs.detail.actions}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.memberName}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.cycleNumber ? `#${entry.cycleNumber}` : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{entry.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.submittedOn}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.approvedOn ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {entry.receiptUrl ? (
                      <Button variant="outline" size="icon-sm" onClick={() => setPreviewUrl(entry.receiptUrl)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <DeletePaymentButton clubId={clubId} reportId={entry.id} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={previewUrl !== null} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.clubs.detail.receiptDialogTitle}</DialogTitle>
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

function DeletePaymentButton({ clubId, reportId }: { clubId: string; reportId: string }) {
  const { dict: t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deletePaymentReportAction(clubId, reportId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.clubs.detail.paymentDeletedToast);
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.clubs.detail.confirmDeletePaymentTitle}</AlertDialogTitle>
          <AlertDialogDescription>{t.clubs.detail.confirmDeletePaymentDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-rose-600 text-white hover:bg-rose-700">
            {t.clubs.detail.confirmDeletePaymentButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
