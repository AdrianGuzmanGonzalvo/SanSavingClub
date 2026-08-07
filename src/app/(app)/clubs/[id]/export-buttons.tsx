"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { exportPaymentHistoryCsv, exportPaymentHistoryPdf, type PaymentHistoryRow } from "@/lib/export";

export function ExportButtons({ clubName, rows }: { clubName: string; rows: PaymentHistoryRow[] }) {
  const { dict: t } = useI18n();

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => exportPaymentHistoryCsv(clubName, rows)}>
        <Download /> {t.clubs.detail.exportCsv}
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportPaymentHistoryPdf(clubName, rows)}>
        <FileText /> {t.clubs.detail.exportPdf}
      </Button>
    </div>
  );
}
