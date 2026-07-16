// ─── AI Assistant panel — chat + its pinned chart previews, one tab ───────────

interface PinnedDashboard {
  spec: DashboardSpec;
  question: string;
  pinnedAt: number;
}

// Every RAG source with a structured-stats -> dashboardSpec mapping. Charts
// generated from AI questions outside this list simply won't carry a chart
// (Vehicle Stock / Service data isn't RAG-indexed yet, see plan notes).
const AI_SOURCE_TYPES = [
  "parts",
  "jobcard-live",
  "jobcard-revenue-import",
  "accident-report",
  "stock-assign",
  "vas-assign",
];

import DashboardChartPreview from "@/mainComponents/RAG/DashboardChartPreview";
import RagAssistant from "@/mainComponents/RAG/RagAssistant";
import { DashboardSpec } from "@/redux-store/services/ragApi.types";
/**
 * AI Assistant chat + its pinned chart previews, together in one panel.
 * Rendered as its own top-level tab in AdminDashboard, separate from the
 * static Dashboards. Pins are ephemeral (component state only) — no backend
 * persistence.
 */

import { useState } from "react";

const AiAssistantPanel = () => {
  const [pinned, setPinned] = useState<PinnedDashboard[]>([]);

  const handlePin = (spec: DashboardSpec, question: string) => {
    setPinned((prev) => [...prev, { spec, question, pinnedAt: Date.now() }]);
  };

  return (
    <div className='space-y-6'>
      <RagAssistant
        title='Dealership AI Assistant'
        subtitle='Ask questions about parts, job cards, stock/VAS assignments, and accident reports — answers are grounded in live data and can include a chart.'
        sourceTypes={AI_SOURCE_TYPES}
        placeholder='e.g. How many bikes were assigned to customers this year?'
        onPinDashboard={handlePin}
      />

      {pinned.length === 0 ? (
        <div className='rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500'>
          Ask the AI a stats question and pin the result to see it here.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {pinned.map((p) => (
            <div key={p.pinnedAt} className='space-y-1'>
              <p className='text-xs text-gray-400'>
                "{p.question}" — pinned{" "}
                {new Date(p.pinnedAt).toLocaleTimeString()}
              </p>
              <DashboardChartPreview spec={p.spec} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiAssistantPanel;
