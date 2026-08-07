export interface PaymentHistoryRow {
  member: string;
  turn: string;
  amount: string;
  paymentDate: string;
  method: string;
  status: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function exportPaymentHistoryCsv(clubName: string, rows: PaymentHistoryRow[]) {
  const headers = ["Member", "Turn", "Amount", "Payment Date", "Method", "Status"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.member, r.turn, r.amount, r.paymentDate, r.method, r.status].map(csvEscape).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${clubName.replace(/\s+/g, "_")}_payment_history.csv`);
}

export async function exportPaymentHistoryPdf(clubName: string, rows: PaymentHistoryRow[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(clubName, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Payment history & compliance summary", 14, 25);

  autoTable(doc, {
    startY: 32,
    head: [["Member", "Turn", "Amount", "Payment Date", "Method", "Status"]],
    body: rows.map((r) => [r.member, r.turn, r.amount, r.paymentDate, r.method, r.status]),
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 9 },
  });

  doc.save(`${clubName.replace(/\s+/g, "_")}_payment_history.pdf`);
}
