"use client";

import { useState } from "react";
import { Eye, ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/i18n-provider";

export interface PaymentHistoryEntry {
  id: string;
  memberName: string;
  cycleNumber: number | null;
  amount: string;
  submittedOn: string;
  approvedOn: string | null;
  receiptUrl: string | null;
}

export function PaymentHistoryCard({ entries }: { entries: PaymentHistoryEntry[] }) {
  const { dict: t } = useI18n();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ScrollText className="h-4 w-4 text-primary" />
          {t.clubs.detail.paymentHistoryTitle}
        </CardTitle>
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
                <TableHead>{t.clubs.pay.amount}</TableHead>
                <TableHead>{t.clubs.detail.paymentHistorySubmitted}</TableHead>
                <TableHead>{t.clubs.detail.paymentHistoryApproved}</TableHead>
                <TableHead className="text-right">{t.clubs.admin.viewReceipt}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.memberName}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.cycleNumber ? `#${entry.cycleNumber}` : "—"}</TableCell>
                  <TableCell>{entry.amount}</TableCell>
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
