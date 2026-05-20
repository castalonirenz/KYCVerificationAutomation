import { ModulePage } from "../../../components/ModulePage";
import { screeningFallback } from "../../../components/fallbacks";

export default function WatchlistsPage() {
  return (
    <ModulePage
      title="Watchlist Monitoring"
      description="Internal and public watchlist screening with real-time rescreening and compliance rule coverage."
      endpoint="/compliance/screenings"
      fallback={screeningFallback}
      searchKeys={["case_id", "type", "result", "status"]}
      primaryAction="Run watchlist scan"
    />
  );
}
