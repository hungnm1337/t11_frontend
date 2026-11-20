import { DocumentManager } from "@/components/documents/document-manager";

export const metadata = {
  title: "Phiếu điều chuyển - Quản lý xưởng cơ khí",
};

export const instant = false;

export default function TransferPage() {
  return <DocumentManager kind="transfer" />;
}
