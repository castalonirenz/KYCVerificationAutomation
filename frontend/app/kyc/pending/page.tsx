import { ModulePage } from "../../../components/ModulePage";
import { workflowFallback } from "../../../components/fallbacks";

export default function PendingKycPage() {
  return (
    <ModulePage
      title="Pending Verification"
      description="KYC queue for draft and pending verification cases, SLA tracking, assignment, and duplicate checks."
      endpoint="/workflows"
      fallback={workflowFallback}
      searchKeys={["case_id", "stage", "assignee", "next_action"]}
      primaryAction="Assign case"
    />
  );
}
