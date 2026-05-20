import { ModulePage } from "../../../components/ModulePage";
import { clientsFallback } from "../../../components/fallbacks";

export default function ClientDetailPage() {
  return (
    <ModulePage
      title="Client Profile"
      description="Client record, profile history, beneficial ownership, status, and assigned relationship manager."
      endpoint="/clients"
      fallback={clientsFallback}
      primaryAction="Update profile"
    />
  );
}
