import { ModulePage } from "../../../components/ModulePage";
import { workflowFallback } from "../../../components/fallbacks";

export default function ReviewKycPage() {
  return (
    <ModulePage
      title="KYC Review"
      description="Reviewer approval flow with identity validation, document verification, assignments, and escalation actions."
      endpoint="/workflows"
      fallback={workflowFallback}
      searchKeys={["case_id", "stage", "assignee", "next_action"]}
      primaryAction="Approve selected"
    />
  );
}
