"use client";

import { useActionState } from "react";
import { saveSeekerProfileAction, type ProfileState } from "./actions";

const initial: ProfileState = {};

export default function SeekerProfileForm({
  headline,
  bio,
  location,
}: {
  headline: string;
  bio: string;
  location: string;
}) {
  const [state, action, pending] = useActionState(saveSeekerProfileAction, initial);

  return (
    <form action={action} className="stack">
      {state.ok && <p className="notice notice--success">Profile saved.</p>}
      {state.error && <p className="notice notice--error">{state.error}</p>}

      <div className="field">
        <label htmlFor="headline">Headline</label>
        <input
          id="headline"
          name="headline"
          defaultValue={headline}
          placeholder="e.g. Backend dev learning Kubernetes"
        />
      </div>
      <div className="field">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          defaultValue={location}
          placeholder="e.g. Berlin (CET)"
        />
      </div>
      <div className="field">
        <label htmlFor="bio">About</label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={bio}
          placeholder="What are you trying to learn, and why?"
        />
      </div>
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
