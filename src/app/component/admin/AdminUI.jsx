"use client";

// Shared admin building blocks: page headers, stat tiles, tables, badges and a
// row-action menu. Kept in one file because they are only used by /admin.

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Section({ title, children, action }) {
  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Compact metric tile used across the statistics blocks. */
export function Stat({ label, value, tone = "default", icon: Icon }) {
  const tones = {
    default: "text-gray-900",
    brand: "text-brand",
    accent: "text-accent",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {Icon && <Icon size={17} className="mb-2 text-gray-400" />}
      <p className={`text-2xl font-bold ${tones[tone]}`}>{value}</p>
      <p className="mt-0.5 text-xs leading-snug text-gray-600">{label}</p>
    </div>
  );
}

export function StatGrid({ children, cols = 4 }) {
  const map = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" };
  return <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${map[cols]}`}>{children}</div>;
}

const BADGE_TONES = {
  green: "bg-brand-soft text-brand-dark",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({ tone = "gray", children }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Horizontally scrollable table wrapper — admin tables are wide on mobile. */
export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-start">
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function EmptyRow({ colSpan, label }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-400">
        {label}
      </td>
    </tr>
  );
}

/**
 * Row action menu. Each action is `{ label, onClick, tone }`; `tone: "danger"`
 * renders it in red for destructive operations.
 */
export function RowActions({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const visible = actions.filter(Boolean);
  if (!visible.length) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="actions"
      >
        <MoreHorizontal size={17} />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute end-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {visible.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  setOpen(false);
                  a.onClick?.();
                }}
                className={`block w-full px-4 py-2 text-start text-sm transition hover:bg-gray-50 ${
                  a.tone === "danger" ? "text-red-600" : "text-gray-700"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Horizontal bar list for the "most searched" panels. */
export function BarList({ items, valueLabel }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-gray-700">{item.label}</span>
            <span className="shrink-0 text-xs text-gray-500">
              {item.count.toLocaleString()} {valueLabel}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
