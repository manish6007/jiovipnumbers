import { BulkUpload } from "@/components/dashboard/bulk-upload";

export const metadata = { title: "Bulk Upload" };

export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk Upload</h1>
        <p className="text-sm text-muted-foreground">
          Import many VIP numbers at once from a CSV or Excel file. All rows are
          submitted for admin approval.
        </p>
      </div>
      <BulkUpload />
    </div>
  );
}
