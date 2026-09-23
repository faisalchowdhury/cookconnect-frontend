"use client";

// Shared form primitives.
//
// `Select` exists because Change Requirements 06 forbids free text for job
// title, sector and experience — those fields must be dropdowns only. It takes
// the `{ id, fr, ar }` option shape used throughout src/mock and renders the
// label for the active locale.

import { useLocale } from "@/i18n/LocaleProvider";

const baseField =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

export function Label({ children, required, hint }) {
  return (
    <span className="mb-1 flex items-baseline gap-1">
      <span className="text-sm font-medium text-gray-700">{children}</span>
      {required && <span className="text-red-500">*</span>}
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </span>
  );
}

export function Field({ label, required, error, hint, children }) {
  return (
    <label className="block">
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

export function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`${baseField} ${error ? "border-red-400" : ""} ${className}`}
    />
  );
}

export function Textarea({ error, className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`${baseField} resize-y ${error ? "border-red-400" : ""} ${className}`}
    />
  );
}

/**
 * @param {Array<{id:string, fr:string, ar:string}>} options
 * @param {string} placeholder shown as the empty first entry
 */
/**
 * `options` is a flat list; `groups` is a list of `{ id, fr, ar, options }` for
 * taxonomies long enough that a flat list is hard to scan. Pass one or the
 * other.
 */
export function Select({ options = [], groups, placeholder, error, className = "", ...props }) {
  const { pick } = useLocale();
  return (
    <select {...props} className={`${baseField} ${error ? "border-red-400" : ""} ${className}`}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}

      {groups
        ? groups.map((g) => (
            <optgroup key={g.id} label={pick(g)}>
              {g.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {pick(o)}
                </option>
              ))}
            </optgroup>
          ))
        : options.map((o) => (
            <option key={o.id} value={o.id}>
              {pick(o)}
            </option>
          ))}
    </select>
  );
}

/** Select variant for filter bars, where "all" is a real, selectable value. */
export function FilterSelect({ options = [], allLabel, value, onChange, className = "" }) {
  const { pick } = useLocale();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseField} ${className}`}
    >
      <option value="all">{allLabel}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {pick(o)}
        </option>
      ))}
    </select>
  );
}
