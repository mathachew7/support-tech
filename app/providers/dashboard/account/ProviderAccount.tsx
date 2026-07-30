"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileCard, type ProfileCardData } from "@/app/_components/dashboard/ProfileCard";
import { ProviderPersonalForm, type ProviderPersonal } from "./ProviderPersonalForm";

/** Profile section: read-only card <-> personal edit form (skills/availability
 *  live in a separate section on the Account page). */
export function ProviderAccount({
  card,
  values,
  fallbackInitials,
}: {
  card: ProfileCardData;
  values: ProviderPersonal;
  fallbackInitials: string;
}) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  if (editing) {
    return (
      <div className="card stack">
        <h2>Edit profile</h2>
        <ProviderPersonalForm
          values={values}
          fallbackInitials={fallbackInitials}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return <ProfileCard p={card} onEdit={() => setEditing(true)} />;
}
