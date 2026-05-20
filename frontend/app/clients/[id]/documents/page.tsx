import { ModulePage } from "../../../../components/ModulePage";
import { documentsFallback } from "../../../../components/fallbacks";

export default function ClientDocumentsPage() {
  return (
    <ModulePage
      title="Client Documents"
      description="Document categorization, upload readiness, versioning, secure storage metadata, and expiry monitoring."
      endpoint="/documents"
      fallback={documentsFallback}
      searchKeys={["case_id", "name", "category", "status"]}
      primaryAction="Upload document"
    />
  );
}
