import { useState } from "react";
import { useQueryRagMutation } from "@/redux-store/services/ragApi";
import type {
  RagQueryResult,
  RagCitation,
  DashboardSpec,
} from "@/redux-store/services/ragApi.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2, AlertCircle, Pin } from "lucide-react";
import DashboardChartPreview from "./DashboardChartPreview";

interface RagAssistantProps {
  title?: string;
  subtitle?: string;
  /** Restricts scope to a branch — same semantics as the dashboards' own branch scoping. */
  branchId?: string;
  /** Restricts which registered RAG sources this panel may query (e.g. ["parts"]). Omit for all sources the current role can access. */
  sourceTypes?: string[];
  placeholder?: string;
  /** Called when the user pins a chart-carrying answer to the Preview tab. */
  onPinDashboard?: (spec: DashboardSpec, question: string) => void;
}

function CitationBadges({ citations }: { citations: RagCitation[] }) {
  if (!citations.length) return null;
  return (
    <div className='flex flex-wrap gap-1 mt-2'>
      {citations.map((c, i) => (
        <span
          key={`${c.sourceType}-${c.sourceId}-${i}`}
          title={c.snippet}
          className='inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs text-gray-600'
        >
          {c.displayName}
        </span>
      ))}
    </div>
  );
}

/**
 * Shared RAG assistant panel — generalized from the original Parts-only
 * assistant. Only queries the AI when the user actually asks a question; it
 * no longer auto-fires a "summary" request on mount.
 */
export default function RagAssistant({
  title = "AI Assistant",
  subtitle = "Ask questions about your dealership data — answers are grounded in live data and cite their sources.",
  branchId,
  sourceTypes,
  placeholder = "Ask a question...",
  onPinDashboard,
}: RagAssistantProps) {
  const [queryRag, { isLoading }] = useQueryRagMutation();
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState("");
  const [answer, setAnswer] = useState<RagQueryResult | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAnswerError(null);
    setAnswer(null);
    const asked = question.trim();
    setAskedQuestion(asked);
    try {
      const res = await queryRag({
        question: asked,
        branchId,
        sourceTypes,
      }).unwrap();
      setAnswer(res.data);
    } catch (err: any) {
      setAnswerError(err?.data?.message || "The assistant could not answer.");
    }
  };

  return (
    <Card className='border border-gray-200 shadow-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Sparkles className='w-5 h-5 text-blue-600' />
          {title}
        </CardTitle>
        <p className='text-sm text-gray-500'>{subtitle}</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!askedQuestion && !answerError && (
          <div className='rounded-xl bg-gray-50 border border-dashed border-gray-200 p-4 text-sm text-gray-400 flex items-center gap-2'>
            <Sparkles className='w-4 h-4' />
            Ask a question below to get started.
          </div>
        )}

        {/* Question box */}
        <form onSubmit={handleAsk} className='flex gap-2'>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder}
            className='flex-1'
          />
          <Button
            type='submit'
            disabled={isLoading || !question.trim()}
            className='bg-blue-600 hover:bg-blue-700'
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </Button>
        </form>

        {answerError && (
          <div className='flex items-center gap-2 text-red-600 text-sm'>
            <AlertCircle className='w-4 h-4' />
            {answerError}
          </div>
        )}
        {answer && (
          <div className='rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-gray-800 whitespace-pre-wrap'>
            {answer.answer}
            <CitationBadges citations={answer.citations} />
          </div>
        )}
        {answer?.dashboardSpec && (
          <div className='space-y-2'>
            <DashboardChartPreview spec={answer.dashboardSpec} compact />
            {onPinDashboard && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => onPinDashboard(answer.dashboardSpec!, askedQuestion)}
              >
                <Pin className='w-3.5 h-3.5 mr-1' />
                Pin to preview
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
