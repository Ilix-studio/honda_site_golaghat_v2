import { useEffect, useState } from "react";
import { useAskPartsAiMutation } from "@/redux-store/services/partsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2, AlertCircle } from "lucide-react";

/**
 * Super-Admin AI panel: auto-loads a summary of parts data on mount, and lets
 * the admin ask free-text questions grounded in the aggregated dealer data.
 */
export default function PartsAiAssistant({
  branchId,
}: {
  branchId?: string;
}) {
  const [askAi, { isLoading }] = useAskPartsAiMutation();
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await askAi({ mode: "summary", branchId }).unwrap();
        if (active) setSummary(res.data.answer);
      } catch (err: any) {
        if (active)
          setSummaryError(
            err?.data?.message || "Could not generate the summary.",
          );
      }
    })();
    return () => {
      active = false;
    };
    // Re-run when branch scope changes
  }, [askAi, branchId]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAnswerError(null);
    setAnswer(null);
    try {
      const res = await askAi({
        mode: "chat",
        question: question.trim(),
        branchId,
      }).unwrap();
      setAnswer(res.data.answer);
    } catch (err: any) {
      setAnswerError(err?.data?.message || "The assistant could not answer.");
    }
  };

  return (
    <Card className='border border-gray-200 shadow-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Sparkles className='w-5 h-5 text-blue-600' />
          Parts AI Assistant
        </CardTitle>
        <p className='text-sm text-gray-500'>
          Ask questions about dealership parts data — answers are grounded in the
          uploaded reports.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Summary */}
        <div className='rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-700 whitespace-pre-wrap min-h-[80px]'>
          {summaryError ? (
            <span className='flex items-center gap-2 text-red-600'>
              <AlertCircle className='w-4 h-4' />
              {summaryError}
            </span>
          ) : summary === null ? (
            <span className='flex items-center gap-2 text-gray-400'>
              <Loader2 className='w-4 h-4 animate-spin' />
              Generating summary...
            </span>
          ) : (
            summary
          )}
        </div>

        {/* Question box */}
        <form onSubmit={handleAsk} className='flex gap-2'>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='e.g. Which month had the most parts imported?'
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
            {answer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
