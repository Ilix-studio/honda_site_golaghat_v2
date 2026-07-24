import type { ReactNode } from "react";

/**
 * Minimal renderer for the fixed markdown constructs emitted by
 * partsStockDiff.service.ts#buildChangesMarkdown (###/#### headings, bold
 * and italic emphasis, "- " list items, "| a | b |" tables). No
 * general-purpose markdown dependency exists in this repo, and the backend
 * only ever emits this small, known subset.
 */

let keySeq = 0;
const nextKey = () => `md-${keySeq++}`;

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|_(.+?)_/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={nextKey()}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<em key={nextKey()}>{match[2]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

export default function ChangesMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={nextKey()} className='text-sm font-semibold text-gray-900 mt-3 first:mt-0'>
          {renderInline(line.slice(4))}
        </h3>,
      );
      i++;
      continue;
    }

    if (line.startsWith("#### ")) {
      blocks.push(
        <h4 key={nextKey()} className='text-xs font-semibold text-gray-700 mt-3'>
          {renderInline(line.slice(5))}
        </h4>,
      );
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines
        .map(parseTableRow)
        .filter((cells) => !cells.every((c) => /^-+$/.test(c)));
      const [header, ...body] = rows;
      blocks.push(
        <div key={nextKey()} className='overflow-x-auto mt-2'>
          <table className='w-full text-xs border border-gray-200 rounded-lg'>
            {header && (
              <thead className='bg-gray-50 text-gray-600'>
                <tr>
                  {header.map((c) => (
                    <th key={nextKey()} className='text-left px-2 py-1.5 whitespace-nowrap'>
                      {renderInline(c)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((cells) => (
                <tr key={nextKey()} className='border-t border-gray-100'>
                  {cells.map((c) => (
                    <td key={nextKey()} className='px-2 py-1.5 text-gray-700 whitespace-nowrap'>
                      {renderInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={nextKey()} className='list-disc pl-5 space-y-0.5 mt-1 text-xs text-gray-700'>
          {items.map((item) => (
            <li key={nextKey()}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    blocks.push(
      <p key={nextKey()} className='text-xs text-gray-700 mt-1'>
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return <div className='space-y-1'>{blocks}</div>;
}
