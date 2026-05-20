import { ModulePage } from "../../../components/ModulePage";
import { workflowFallback } from "../../../components/fallbacks";

export default function EscalatedKycPage() {
  return (
    <ModulePage
      title="Escalated Cases"
      description="High-risk and exception cases requiring compliance manager review, routing, and resolution."
      endpoint="/workflows"
      fallback={workflowFallback}
      searchKeys={["case_id", "stage", "assignee", "next_action"]}
      primaryAction="Resolve escalation"
    />
  );
}
