"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileCard, type ProfileCardData } from "@/app/_components/dashboard/ProfileCard";
import { ProfileEditForm, type EditableProfile } from "./ProfileEditForm";

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Toggles the Account between the read-only profile card and the edit form. */
export function AccountProfile({
  card,
  editable,
  skillOptions,
}: {
  card: ProfileCardData;
  editable: EditableProfile;
  skillOptions: string[];
}) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  if (editing) {
    return (
      <div className="card stack">
        <h2>Edit profile</h2>
        <ProfileEditForm
          values={editable}
          skillOptions={skillOptions}
          fallbackInitials={initials(card.name)}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            router.refresh(); // re-fetch server data so the card reflects the save
          }}
        />
      </div>
    );
  }

  return <ProfileCard p={card} onEdit={() => setEditing(true)} />;
}
