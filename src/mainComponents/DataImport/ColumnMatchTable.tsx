import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import type { MatchedFieldDTO } from "@/redux-store/services/dataImport.types";

interface ColumnMatchTableProps {
  matchedFields: MatchedFieldDTO[];
  unmatchedColumns: string[];
  missingRequired: string[];
}

export default function ColumnMatchTable({
  matchedFields,
  unmatchedColumns,
  missingRequired,
}: ColumnMatchTableProps) {
  return (
    <div className='space-y-4'>
      {missingRequired.length > 0 && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
          <p className='flex items-center gap-2 text-sm font-semibold text-red-700 mb-2'>
            <XCircle className='w-4 h-4' />
            Missing required columns
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {missingRequired.map((f) => (
              <span
                key={f}
                className='px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium'
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className='rounded-lg border border-gray-200 overflow-hidden'>
        <div className='bg-emerald-50 px-3 py-2 border-b border-gray-200'>
          <p className='flex items-center gap-2 text-sm font-semibold text-emerald-700'>
            <CheckCircle2 className='w-4 h-4' />
            Matched columns ({matchedFields.length})
          </p>
        </div>
        {matchedFields.length === 0 ? (
          <p className='p-3 text-sm text-gray-400'>No columns matched.</p>
        ) : (
          <table className='w-full text-sm'>
            <thead className='text-gray-500 text-left bg-gray-50'>
              <tr>
                <th className='py-2 px-3'>Source column</th>
                <th className='py-2 px-3'>Maps to</th>
              </tr>
            </thead>
            <tbody>
              {matchedFields.map((f) => (
                <tr key={f.canonicalKey} className='border-t border-gray-100'>
                  <td className='py-2 px-3 text-gray-800'>{f.sourceColumn}</td>
                  <td className='py-2 px-3 text-gray-500'>{f.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {unmatchedColumns.length > 0 && (
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
          <p className='flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2'>
            <HelpCircle className='w-4 h-4' />
            Unmatched columns ({unmatchedColumns.length}) — kept in raw data
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {unmatchedColumns.map((c) => (
              <span
                key={c}
                className='px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-500 text-xs'
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
