import { ModulePage } from "../../src/components/ModulePage";
import { clientsFallback } from "../../src/components/fallbacks";

export default function ClientsPage() {
  return (
    <ModulePage
      title="Client Management"
      description="Individual and corporate KYC profiles with lifecycle status, ownership, and relationship assignment."
      endpoint="/clients"
      fallback={clientsFallback}
      searchKeys={["id", "case_id", "name", "status", "risk_classification"]}
      primaryAction="Create client"
    />
  );
}
