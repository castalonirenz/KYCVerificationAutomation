import { ModulePage } from "../../../../components/ModulePage";
import { riskFallback } from "../../../../components/fallbacks";

export default function ClientRiskPage() {
  return (
    <ModulePage
      title="Client Risk"
      description="Risk factors, scoring category, manual override request state, and continuous monitoring signals."
      endpoint="/risk/assessments"
      fallback={riskFallback}
      primaryAction="Request override"
    />
  );
}
