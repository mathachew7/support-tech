"use client";

import { useRef } from "react";
import styles from "@/app/seekers/dashboard/account/account.module.css";

const cameraIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
);

/**
 * Real photo upload: click the circle to pick a file, downscale to a 384px
 * square JPEG in the browser (small stored size, no external storage), emit a
 * data URL.
 */
export function AvatarUploader({
  name,
  value,
  fallback,
  onChange,
}: {
  name: string;
  value: string;
  fallback: string; // initials when no photo
  onChange: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 384;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        onChange(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className={styles.uploader}>
        <button
          type="button"
          className={styles.avatarPick}
          onClick={() => fileRef.current?.click()}
          aria-label={value ? "Change photo" : "Upload photo"}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Profile" />
          ) : (
            <span>{fallback}</span>
          )}
          <span className={styles.avatarOverlay}>
            {cameraIcon}
            <span>{value ? "Change" : "Upload"}</span>
          </span>
        </button>
        <div>
          <div className={styles.uploaderHint}>Click the circle to upload a photo.</div>
          {value && (
            <button type="button" className={styles.removePhoto} onClick={() => onChange("")}>
              Remove photo
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
    </div>
  );
}
