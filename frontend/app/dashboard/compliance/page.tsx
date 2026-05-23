import { ModulePage } from "../../../src/components/ModulePage";
import { screeningFallback } from "../../../src/components/fallbacks";

export default function ComplianceDashboardPage() {
  return (
    <ModulePage
      title="Compliance Monitoring"
      description="Screening outcomes across sanctions, PEP, watchlists, and compliance rule checks."
      endpoint="/compliance/screenings"
      fallback={screeningFallback}
      searchKeys={["case_id", "type", "status", "result"]}
      primaryAction="Run rescreening"
    />
  );
}
