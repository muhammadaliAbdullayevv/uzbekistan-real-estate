"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserListingActionsProps = {
  listingId: string;
  listingType: "rent" | "sale";
  availabilityStatus: "ACTIVE" | "RENTED" | "SOLD";
  copy: {
    edit: string;
    delete: string;
    deleting: string;
    markRented: string;
    markSold: string;
    markActive: string;
    updating: string;
    deleteConfirm: string;
    markRentedConfirm: string;
    markSoldConfirm: string;
    markActiveConfirm: string;
  };
};

export function UserListingActions({
  listingId,
  listingType,
  availabilityStatus,
  copy
}: UserListingActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"delete" | "status" | null>(null);

  async function deleteListing() {
    if (!window.confirm(copy.deleteConfirm)) {
      return;
    }

    setPendingAction("delete");

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Unable to delete listing.");
      }

      router.push("/my-listings?status=deleted");
      router.refresh();
    } catch (error) {
      console.error(error);
      setPendingAction(null);
    }
  }

  async function updateAvailability(nextStatus: "ACTIVE" | "RENTED" | "SOLD") {
    const confirmation =
      nextStatus === "ACTIVE"
        ? copy.markActiveConfirm
        : nextStatus === "RENTED"
          ? copy.markRentedConfirm
          : copy.markSoldConfirm;

    if (!window.confirm(confirmation)) {
      return;
    }

    setPendingAction("status");

    try {
      const response = await fetch(`/api/listings/${listingId}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          availabilityStatus: nextStatus
        })
      });

      if (!response.ok) {
        throw new Error("Unable to update listing availability.");
      }

      router.push("/my-listings?status=status-updated");
      router.refresh();
    } catch (error) {
      console.error(error);
      setPendingAction(null);
    }
  }

  const statusButtonLabel =
    availabilityStatus === "ACTIVE"
      ? listingType === "rent"
        ? copy.markRented
        : copy.markSold
      : copy.markActive;

  const nextAvailabilityStatus =
    availabilityStatus === "ACTIVE"
      ? listingType === "rent"
        ? "RENTED"
        : "SOLD"
      : "ACTIVE";

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link href={`/my-listings/${listingId}/edit`} className="btn-secondary text-center">
        {copy.edit}
      </Link>
      <button
        type="button"
        onClick={() => updateAvailability(nextAvailabilityStatus)}
        disabled={pendingAction !== null}
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingAction === "status" ? copy.updating : statusButtonLabel}
      </button>
      <button
        type="button"
        onClick={deleteListing}
        disabled={pendingAction !== null}
        className="rounded-full border border-coral/20 px-5 py-3 text-sm font-semibold text-coral transition hover:border-coral/35 hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingAction === "delete" ? copy.deleting : copy.delete}
      </button>
    </div>
  );
}
