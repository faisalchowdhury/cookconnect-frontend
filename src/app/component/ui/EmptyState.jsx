"use client";

import { SearchX } from "lucide-react";

export default function EmptyState({ icon: Icon = SearchX, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-6 py-14 text-center">
      <Icon size={36} className="mb-3 text-gray-300" strokeWidth={1.5} />
      <p className="text-base font-semibold text-gray-800">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-gray-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Card-shaped skeleton used while the mock API resolves. */
export function CardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-gray-200" />
              <div className="h-2.5 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded bg-gray-100" />
            <div className="h-2.5 w-5/6 rounded bg-gray-100" />
          </div>
          <div className="mt-5 h-9 w-full rounded-md bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
