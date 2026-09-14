"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  onConfirm: (confirmCode: string) => void;
}) {
  const [confirmCode, setConfirmCode] = useState("");

  useEffect(() => {
    if (!open) setConfirmCode("");
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
              . Type the admin delete code to confirm.
            </DialogDescription>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="admin-delete-code">Delete confirmation code</Label>
          <Input
            id="admin-delete-code"
            className="mt-1 font-mono tracking-wide"
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            placeholder="Enter code"
            autoComplete="off"
            disabled={deleting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && confirmCode.trim()) {
                onConfirm(confirmCode.trim());
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
            disabled={deleting || !confirmCode.trim()}
            onClick={() => onConfirm(confirmCode.trim())}
          >
            {deleting ? "Deleting…" : "Permanently delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
