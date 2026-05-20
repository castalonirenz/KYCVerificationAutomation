import { ModulePage } from "../../components/ModulePage";
import { reportsFallback } from "../../components/fallbacks";

export default function AnalyticsPage() {
  return (
    <ModulePage
      title="Analytics"
      description="Executive compliance analytics for SLA metrics, risk trends, review workload, and audit readiness."
      endpoint="/reports"
      fallback={reportsFallback}
      primaryAction="Refresh analytics"
    />
  );
}
