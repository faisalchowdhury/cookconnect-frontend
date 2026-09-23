"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

import { useLocale, useT } from "@/i18n/LocaleProvider";
import { fetchNotifications, markNotificationRead } from "@/mock/api";
import { notifyNotificationsChanged } from "@/lib/notificationsSignal";
import EmptyState from "@/app/component/ui/EmptyState";

export default function NotificationDetailPage() {
  const t = useT();
  const { pick } = useLocale();
  const { id } = useParams();
  const [item, setItem] = useState(undefined);

  useEffect(() => {
    let alive = true;
    fetchNotifications().then((all) => {
      const found = all.find((n) => n.id === id) || null;
      if (!alive) return;
      setItem(found);
      if (found && !found.read) {
        markNotificationRead(found.id)
          .then(() => {
            if (alive) {
              setItem((prev) => (prev ? { ...prev, read: true } : prev));
              notifyNotificationsChanged();
            }
          })
          .catch(() => {});
      }
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (item === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={Bell} title={t("notifications.empty")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 font-poppins">
      <Link
        href="/notification"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-accent"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("common.back")}
      </Link>

      <article className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">
          {pick(item, "title")}
        </h1>
        <p className="mt-1 text-xs text-gray-400">{item.date}</p>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">{pick(item, "body")}</p>
      </article>
    </div>
  );
}
