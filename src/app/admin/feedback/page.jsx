"use client";

// User feedback — ClientDoc section 19:
//
//   "Admin must be able to answer user feedback. When admin replies, notify the
//    user on the website and by email."
//
// Unanswered messages sort to the top so nothing sits forgotten.

import { useMemo, useState } from "react";
import { Send, Check, Star, Mail } from "lucide-react";

import { useT } from "@/i18n/LocaleProvider";
import { FEEDBACK } from "@/mock/admin";
import { PageHeader, Badge } from "@/app/component/admin/AdminUI";

export default function AdminFeedbackPage() {
  const t = useT();
  const [replies, setReplies] = useState({});
  const [drafts, setDrafts] = useState({});
  const [openId, setOpenId] = useState(null);

  const rows = useMemo(
    () =>
      [...FEEDBACK]
        .map((f) => ({ ...f, reply: replies[f.id] ?? f.reply }))
        .sort((a, b) => (a.reply ? 1 : 0) - (b.reply ? 1 : 0) || b.at.localeCompare(a.at)),
    [replies]
  );

  const pending = rows.filter((f) => !f.reply).length;

  const send = (id) => {
    const text = (drafts[id] || "").trim();
    if (!text) return;
    setReplies((r) => ({ ...r, [id]: text }));
    setOpenId(null);
  };

  return (
    <>
      <PageHeader
        title={t("admin.feedbackPage.title")}
        subtitle={t("admin.feedbackPage.subtitle", { n: rows.length, p: pending })}
      />

      <ul className="space-y-4">
        {rows.map((f) => (
          <li key={f.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{f.from}</p>
                <p className="text-xs text-gray-500">
                  {f.role === "employer" ? t("auth.iAmEmployer") : t("auth.lookingForJob")} · {f.at}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-0.5" aria-label={`${f.rating}/5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={n <= f.rating ? "text-amber-400" : "text-gray-200"}
                      fill={n <= f.rating ? "currentColor" : "none"}
                    />
                  ))}
                </span>
                {f.reply ? (
                  <Badge tone="green">{t("admin.feedbackPage.replied")}</Badge>
                ) : (
                  <Badge tone="amber">{t("admin.feedbackPage.awaiting")}</Badge>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-700">{f.message}</p>

            {f.reply ? (
              <div className="mt-4 rounded-lg border-s-4 border-brand bg-brand-soft/40 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-dark">
                  <Check size={13} strokeWidth={3} />
                  {t("admin.feedbackPage.yourReply")}
                </p>
                <p className="text-sm text-gray-700">{f.reply}</p>
              </div>
            ) : openId === f.id ? (
              <div className="mt-4">
                <textarea
                  rows={3}
                  autoFocus
                  value={drafts[f.id] || ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                  placeholder={t("admin.feedbackPage.replyPlaceholder")}
                  className="w-full rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail size={12} />
                  {t("admin.feedbackPage.notifyNote")}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => send(f.id)}
                    disabled={!(drafts[f.id] || "").trim()}
                    className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50"
                  >
                    <Send size={14} />
                    {t("admin.feedbackPage.send")}
                  </button>
                  <button
                    onClick={() => setOpenId(null)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setOpenId(f.id)}
                className="mt-4 flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Send size={14} />
                {t("admin.feedbackPage.reply")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
