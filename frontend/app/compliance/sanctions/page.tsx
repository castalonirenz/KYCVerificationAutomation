import { ModulePage } from "../../../components/ModulePage";
import { screeningFallback } from "../../../components/fallbacks";

export default function SanctionsPage() {
  return (
    <ModulePage
      title="Sanctions Screening"
      description="Sanctions list checks, fuzzy match confidence, reviewer disposition, and escalation workflow."
      endpoint="/compliance/screenings"
      fallback={screeningFallback}
      searchKeys={["case_id", "type", "result", "status"]}
      primaryAction="Screen sanctions"
    />
  );
}
