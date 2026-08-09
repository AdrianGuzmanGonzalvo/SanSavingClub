"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { exportContactsCsv, type ContactRow } from "@/lib/export";

export function ContactsExportButton({ rows }: { rows: ContactRow[] }) {
  const { dict: t } = useI18n();

  return (
    <Button variant="outline" size="sm" onClick={() => exportContactsCsv(rows)}>
      <Download /> {t.reports.exportContactsCsv}
    </Button>
  );
}
