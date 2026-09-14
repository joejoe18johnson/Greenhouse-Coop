"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DELETE_USER_CONFIRMATION_PHRASE,
  verifyDeleteUserConfirmation,
} from "@/lib/admin-delete-code";

export type DeleteCustomerTarget = {
  id: string;
  name: string;
  orderCount: number;
};

export function DeleteCustomerDialog({
  target,
  open,
  deleting,
  error,
  onOpenChange,
  onConfirm,
}: {
  target: DeleteCustomerTarget | null;
  open: boolean;
  deleting: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (confirmPhrase: string) => void;
}) {
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const confirmed = verifyDeleteUserConfirmation(confirmPhrase);

  useEffect(() => {
    if (!open) setConfirmPhrase("");
  }, [open]);

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex items-start gap-3 pr-8">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl text-forest-dark">
              Delete {target.name}?
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-ink/65">
              This permanently removes their account
              {target.orderCount > 0
                ? ` and ${target.orderCount} order${target.orderCount === 1 ? "" : "s"}`
                : ""}
              . Please confirm delete by typing &quot;{DELETE_USER_CONFIRMATION_PHRASE}&quot; in the box
              below.
            </DialogDescription>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="admin-delete-confirm">Confirmation</Label>
          <Input
            id="admin-delete-confirm"
            className="mt-1 font-mono"
            value={confirmPhrase}
            onChange={(e) => setConfirmPhrase(e.target.value)}
            placeholder={DELETE_USER_CONFIRMATION_PHRASE}
            autoComplete="off"
            disabled={deleting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && confirmed) {
                onConfirm(confirmPhrase.trim());
              }
            }}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={deleting} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700"
            disabled={deleting || !confirmed}
            onClick={() => onConfirm(confirmPhrase.trim())}
          >
            {deleting ? "Deleting…" : "Permanently delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
