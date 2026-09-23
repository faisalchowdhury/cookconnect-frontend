"use client";

// CV database export — ClientDoc section 14:
// "Admin must have a CV database that can be exported to Excel."
//
// CSV rather than a real .xlsx: Excel opens it natively and it needs no
// dependency. A UTF-8 BOM is prepended because Excel otherwise misreads
// accented French and Arabic as mojibake.

const BOM = "﻿";

/** Quote a cell and escape embedded quotes, per RFC 4180. */
function cell(value) {
  if (value == null) return "";
  const s = String(value);
  // A leading =, +, - or @ is interpreted as a formula by Excel; prefixing a
  // single quote neutralises CSV injection from user-supplied profile text.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * @param {Array<{key: string, label: string, format?: (row) => string}>} columns
 * @param {Array<object>} rows
 */
export function toCsv(columns, rows) {
  const header = columns.map((c) => cell(c.label)).join(";");
  const body = rows
    .map((row) => columns.map((c) => cell(c.format ? c.format(row) : row[c.key])).join(";"))
    .join("\r\n");
  // Semicolon separator: Excel in French/Arabic locales expects it, and comma
  // separators end up all in one column.
  return `${BOM}${header}\r\n${body}`;
}

export function downloadCsv(filename, columns, rows) {
  const blob = new Blob([toCsv(columns, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
