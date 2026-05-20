import { ModulePage } from "../../components/ModulePage";
import { reportsFallback } from "../../components/fallbacks";

export default function ReportsPage() {
  return (
    <ModulePage
      title="Reports"
      description="High-risk, pending verification, expired document, and compliance activity reports with export formats."
      endpoint="/reports"
      fallback={reportsFallback}
      searchKeys={["id", "name", "format"]}
      primaryAction="Export report"
    />
  );
}
