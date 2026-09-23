"use client";

// Grouped checkboxes for job requirements and benefits.
// Change Requirements section 08 is explicit that these move from free text to
// selectable options — this component renders the grouped shape exported by
// src/mock/jobOptions.js.

import { Check } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";

export default function CheckboxGroup({ groups = [], value = [], onChange, columns = 2 }) {
  const { pick } = useLocale();

  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <fieldset key={group.id}>
          <legend className="mb-2 text-sm font-semibold text-gray-800">{pick(group)}</legend>
          <div
            className={`grid gap-2 ${
              columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {group.options.map((option) => {
              const checked = value.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-brand bg-brand-soft text-brand-dark"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.id)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                      checked ? "border-brand bg-brand text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  {pick(option)}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** Read-only rendering of stored option ids, for job detail pages. */
export function SelectedList({ ids = [], lookup, emptyLabel }) {
  const { pick } = useLocale();
  if (!ids.length) return <p className="text-sm text-gray-400">{emptyLabel}</p>;

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {ids.map((id) => {
        const option = lookup[id];
        if (!option) return null;
        return (
          <li key={id} className="flex items-start gap-2 text-sm text-gray-700">
            <Check size={15} className="mt-0.5 shrink-0 text-brand" strokeWidth={3} />
            {pick(option)}
          </li>
        );
      })}
    </ul>
  );
}
