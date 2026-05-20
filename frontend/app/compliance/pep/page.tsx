import { ModulePage } from "../../../components/ModulePage";
import { screeningFallback } from "../../../components/fallbacks";

export default function PepPage() {
  return (
    <ModulePage
      title="PEP Checks"
      description="Politically exposed person screening with risk indicators, confidence, and review status."
      endpoint="/compliance/screenings"
      fallback={screeningFallback}
      searchKeys={["case_id", "type", "result", "status"]}
      primaryAction="Run PEP check"
    />
  );
}
