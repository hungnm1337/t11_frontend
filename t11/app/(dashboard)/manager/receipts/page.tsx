import { DocumentManager } from "@/components/documents/document-manager";

export const metadata = {
  title: "Phiếu nhập - Quản lý xưởng cơ khí",
};

export const instant = false;

export default function ReceiptPage() {
  return <DocumentManager kind="receipt" />;
}
