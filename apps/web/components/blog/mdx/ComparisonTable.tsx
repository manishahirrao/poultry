// FlockIQ — MDX Comparison Table Component
// File: apps/web/components/blog/mdx/ComparisonTable.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-02
// Design Reference: 11_industry_pages_components_master.md §2.1

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface ComparisonTableRow {
  feature: string;
  without: string;
  with: string;
}

export interface ComparisonTableProps {
  rows: ComparisonTableRow[];
  className?: string;
}

export function ComparisonTable({ rows, className }: ComparisonTableProps) {
  return (
    <div className={cn('my-6 overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-brandGreen700 text-white">
            <th className="p-3 text-left rounded-tl-xl">Feature</th>
            <th className="p-3 text-center">Without FlockIQ</th>
            <th className="p-3 text-center rounded-tr-xl">With FlockIQ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
              <td className="p-3 font-semibold text-neutral-900">{row.feature}</td>
              <td className="p-3 text-center text-neutral-500">{row.without}</td>
              <td className="p-3 text-center text-brandGreen700 font-semibold">{row.with}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
