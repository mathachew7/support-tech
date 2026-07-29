"use client";

import { useState } from "react";
import { saveSeekerProfileAction } from "../actions";
import { MultiCombobox } from "@/app/_components/ui/MultiCombobox";
import { AvatarUploader } from "@/app/_components/ui/AvatarUploader";
import styles from "./account.module.css";

export type EditableProfile = {
  headline: string;
  bio: string;
  location: string;
  avatarUrl: string;
  company: string;
  position: string;
  linkedin: string;
  github: string;
  website: string;
  skills: string[];
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export function ProfileEditForm({
  values,
  skillOptions,
  fallbackInitials,
  onCancel,
  onSaved,
}: {
  values: EditableProfile;
  skillOptions: string[];
  fallbackInitials: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [avatar, setAvatar] = useState(values.avatarUrl);
  const [skills, setSkills] = useState(values.skills);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await saveSeekerProfileAction({}, fd);
    if (res?.error) {
      setError(res.error);
      setPending(false);
      return;
    }
    setPending(false);
    onSaved();
  }

  return (
    <form onSubmit={handle} className="stack" style={{ gap: "1.1rem" }}>
      {error && <p className="notice notice--error">{error}</p>}

      <div className="field">
        <label>Profile photo</label>
        <AvatarUploader name="avatarUrl" value={avatar} onChange={setAvatar} fallback={fallbackInitials} />
      </div>

      <div className={styles.grid}>
        <div className="field">
          <label htmlFor="position">Current position</label>
          <input id="position" name="position" defaultValue={values.position} placeholder="e.g. Backend Engineer" />
        </div>
        <div className="field">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" defaultValue={values.company} placeholder="e.g. Acme Inc." />
        </div>
      </div>

      <div className="field">
        <label htmlFor="headline">Headline</label>
        <input id="headline" name="headline" defaultValue={values.headline} placeholder="e.g. Backend dev learning Kubernetes" />
      </div>

      <div className="field">
        <label htmlFor="location">Location</label>
        <input id="location" name="location" defaultValue={values.location} placeholder="e.g. Berlin (CET)" />
      </div>

      <div className={styles.grid}>
        <div className="field">
          <label htmlFor="linkedin">LinkedIn</label>
          <input id="linkedin" name="linkedin" defaultValue={values.linkedin} placeholder="linkedin.com/in/you" />
        </div>
        <div className="field">
          <label htmlFor="github">GitHub</label>
          <input id="github" name="github" defaultValue={values.github} placeholder="github.com/you" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" defaultValue={values.website} placeholder="yoursite.com" />
      </div>

      <div className="field">
        <label htmlFor="bio">About</label>
        <textarea id="bio" name="bio" defaultValue={values.bio} placeholder="What are you trying to learn, and why?" />
      </div>

      <div className="field">
        <label htmlFor="street">Billing address</label>
        <input id="street" name="street" defaultValue={values.street} placeholder="Street address" />
      </div>
      <div className={styles.grid}>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" name="city" defaultValue={values.city} placeholder="City" />
        </div>
        <div className="field">
          <label htmlFor="state">State / Province</label>
          <input id="state" name="state" defaultValue={values.state} placeholder="State" />
        </div>
      </div>
      <div className={styles.grid}>
        <div className="field">
          <label htmlFor="zip">ZIP / Postal code</label>
          <input id="zip" name="zip" defaultValue={values.zip} placeholder="ZIP" />
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <input id="country" name="country" defaultValue={values.country} placeholder="Country" />
        </div>
      </div>

      <div className="field">
        <label>Skills &amp; interests</label>
        <MultiCombobox name="skills" values={skills} onChange={setSkills} options={skillOptions} placeholder="Add skills you want to grow" />
      </div>

      <div className={styles.editActions}>
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button className="btn" type="button" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
      </div>
    </form>
  );
}
