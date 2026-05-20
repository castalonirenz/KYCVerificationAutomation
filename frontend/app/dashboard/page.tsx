import { ModulePage } from "../../components/ModulePage";
import { reportsFallback } from "../../components/fallbacks";

export default function DashboardPage() {
  return (
    <ModulePage
      title="Compliance Dashboard"
      description="KPI monitoring for KYC workload, risk exposure, alerts, approvals, and export readiness."
      endpoint="/reports"
      fallback={reportsFallback}
      primaryAction="Export dashboard"
    />
  );
}
