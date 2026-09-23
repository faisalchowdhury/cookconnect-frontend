"use client";

// Photo upload with the immediate quality check from Change Requirements 06:
//
//   "When a candidate uploads food/profile photos, automatically check image
//    quality (resolution, size). If too low quality, instantly notify the user
//    to upload a better image — no manual admin review needed at upload time."
//
// The check runs in the browser before anything is kept, so the user is told
// straight away rather than after an admin round-trip.

import { useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, AlertCircle } from "lucide-react";
import { useT } from "@/i18n/LocaleProvider";
import { checkImageQuality, IMAGE_ACCEPT } from "@/lib/validation";

/** Single image — profile photo or establishment logo. */
export function AvatarUploader({
  value,
  onChange,
  label,
  hint,
  round = true,
  minWidth,
  minHeight,
  qualityError,
}) {
  const t = useT();
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handle = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = await checkImageQuality(file, { minWidth, minHeight });
    if (!result.ok) {
      setError(qualityError || t("profile.photoQualityError"));
      return;
    }
    setError("");
    onChange(result.url, file);
  };

  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>}

      <div className="flex items-center gap-4">
        <div
          className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 ${
            round ? "rounded-full" : "rounded-xl"
          }`}
        >
          {value ? (
            // Blob/remote preview — plain <img> avoids next/image domain config
            // for user-selected files.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera size={22} className="text-gray-400" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-fit rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand-soft"
          >
            {value ? t("common.select") : t("common.photo")}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex w-fit items-center gap-1 text-xs text-red-500 hover:underline"
            >
              <Trash2 size={13} /> {t("profile.remove")}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handle}
          className="hidden"
        />
      </div>

      {hint && !error && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Multi-image grid for food photos, capped at `max`
 * (ClientDoc section 4: 6-8 photos per profile).
 */
export function PhotoGridUploader({ value = [], onChange, max = 8, hint }) {
  const t = useT();
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handle = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const room = max - value.length;
    const accepted = [];
    const addedFiles = [];
    let rejected = false;

    for (const file of files.slice(0, room)) {
      const result = await checkImageQuality(file);
      if (result.ok) {
        accepted.push(result.url);
        addedFiles.push(file);
      } else {
        rejected = true;
      }
    }

    setError(rejected ? t("profile.photoQualityError") : "");
    if (accepted.length) onChange([...value, ...accepted], addedFiles);
  };

  const remove = (index) => onChange(value.filter((_, i) => i !== index));
  const full = value.length >= max;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={t("profile.remove")}
              className="absolute end-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-brand hover:text-brand"
          >
            <ImagePlus size={20} />
            <span className="text-[11px]">
              {value.length}/{max}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        onChange={handle}
        className="hidden"
      />

      {hint && !error && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-red-500">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
