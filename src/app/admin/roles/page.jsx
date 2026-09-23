"use client";

// Admin roles and permissions — ClientDoc section 18:
//
//   "The platform must allow the main admin to create internal company admin
//    profiles with restricted permissions. Example: an internal admin can have
//    permission only to approve photos and job offers. Full control must remain
//    with the main platform administrator."
//
// The super-admin row is deliberately not editable: its permissions are fixed
// and it cannot be revoked, which is what "full control must remain" means.

import { useState } from "react";
import { Plus, ShieldCheck, Check, Trash2, X } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { ADMINS, PERMISSIONS } from "@/mock/admin";
import { Field, Input } from "@/app/component/ui/Fields";
import { PageHeader, Badge } from "@/app/component/admin/AdminUI";

export default function AdminRolesPage() {
  const t = useT();
  const { pick } = useLocale();

  const [admins, setAdmins] = useState(ADMINS);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", permissions: [] });

  const togglePermission = (adminId, permissionId) =>
    setAdmins((list) =>
      list.map((a) =>
        a.id !== adminId || a.role === "super"
          ? a
          : {
              ...a,
              permissions: a.permissions.includes(permissionId)
                ? a.permissions.filter((p) => p !== permissionId)
                : [...a.permissions, permissionId],
            }
      )
    );

  const create = (event) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.email.trim()) return;
    setAdmins((list) => [
      ...list,
      { id: `adm-${list.length + 1}`, ...draft, role: "sub", lastActive: "—" },
    ]);
    setDraft({ name: "", email: "", permissions: [] });
    setCreating(false);
  };

  const revoke = (id) => setAdmins((list) => list.filter((a) => a.id !== id));

  return (
    <>
      <PageHeader
        title={t("admin.rolesPage.title")}
        subtitle={t("admin.rolesPage.subtitle")}
        action={
          <button
            onClick={() => setCreating((v) => !v)}
            className="flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            <Plus size={16} />
            {t("admin.rolesPage.addAdmin")}
          </button>
        }
      />

      {creating && (
        <form onSubmit={create} className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("admin.candidate.name")} required>
              <Input
                required
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </Field>
            <Field label={t("common.email")} required>
              <Input
                required
                type="email"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              />
            </Field>
          </div>

          <p className="mb-2 mt-4 text-sm font-medium text-gray-700">
            {t("admin.rolesPage.permissions")}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PERMISSIONS.map((p) => {
              const checked = draft.permissions.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    checked ? "border-brand bg-brand-soft text-brand-dark" : "border-gray-200 text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() =>
                      setDraft((d) => ({
                        ...d,
                        permissions: checked
                          ? d.permissions.filter((x) => x !== p.id)
                          : [...d.permissions, p.id],
                      }))
                    }
                  />
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      checked ? "border-brand bg-brand text-white" : "border-gray-300"
                    }`}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  {pick(p)}
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              {t("common.save")}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {admins.map((admin) => {
          const isSuper = admin.role === "super";
          return (
            <div key={admin.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isSuper ? "bg-brand text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{admin.name}</p>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {t("admin.rolesPage.lastActive")}: {admin.lastActive}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone={isSuper ? "green" : "blue"}>
                    {isSuper ? t("admin.rolesPage.superAdmin") : t("admin.rolesPage.subAdmin")}
                  </Badge>
                  {!isSuper && (
                    <button
                      onClick={() => revoke(admin.id)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      {t("admin.rolesPage.revoke")}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("admin.rolesPage.permissions")}
                </p>

                {isSuper ? (
                  <p className="flex items-center gap-1.5 text-sm text-brand-dark">
                    <Check size={15} strokeWidth={3} />
                    {t("admin.rolesPage.fullControl")}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {PERMISSIONS.map((p) => {
                      const granted = admin.permissions.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePermission(admin.id, p.id)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            granted
                              ? "border-brand bg-brand-soft text-brand-dark"
                              : "border-gray-200 text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {granted ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                          {pick(p)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
