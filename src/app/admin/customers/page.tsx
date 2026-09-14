"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, UserPlus, Users } from "lucide-react";
import {
  DeleteCustomerDialog,
  type DeleteCustomerTarget,
} from "@/components/admin/delete-customer-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import { deleteUser, getOrders, getUsers, isUsingSupabase, reloadAdminUsers } from "@/lib/store";
import { isNewUser, NEW_USER_DAYS } from "@/lib/user-badges";
import { formatBZD } from "@/lib/utils";

export default function AdminCustomersPage() {
  const { ready } = useStore();
  const [users, setUsers] = useState(() => getUsers().filter((user) => user.role === "customer"));
  const [orders, setOrders] = useState(getOrders);
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteCustomerTarget | null>(null);

  const refresh = useCallback(() => {
    setUsers(getUsers().filter((user) => user.role === "customer"));
    setOrders(getOrders());
  }, []);

  useStoreSync(refresh);

  useEffect(() => {
    if (!ready) return;
    refresh();
    if (isUsingSupabase()) {
      void reloadAdminUsers().then(refresh).catch(() => refresh());
    }
  }, [ready, refresh]);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [users]
  );

  const newUserCount = useMemo(() => sortedUsers.filter((user) => isNewUser(user)).length, [sortedUsers]);

  function openDeleteDialog(userId: string, name: string, orderCount: number) {
    setDeleteError("");
    setDeleteTarget({ id: userId, name, orderCount });
  }

  function closeDeleteDialog() {
    if (deletingId) return;
    setDeleteTarget(null);
    setDeleteError("");
  }

  async function handleConfirmDelete(confirmCode: string) {
    if (!deleteTarget) return;
    setDeleteError("");
    setDeletingId(deleteTarget.id);
    try {
      await deleteUser(deleteTarget.id, confirmCode);
      if (isUsingSupabase()) {
        await reloadAdminUsers();
      }
      refresh();
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink/60">
            <span className="inline-flex items-center gap-1.5 font-medium text-forest">
              <Users className="h-4 w-4" />
              {sortedUsers.length} total {sortedUsers.length === 1 ? "customer" : "customers"}
            </span>
            {newUserCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-leaf">
                <UserPlus className="h-4 w-4" />
                {newUserCount} new in the last {NEW_USER_DAYS} days
              </span>
            )}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void reloadAdminUsers().then(refresh)}>
          Refresh list
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {sortedUsers.map((user) => {
          const theirs = orders.filter((order) => order.userId === user.id);
          const spent = theirs.reduce((sum, order) => sum + order.total, 0);
          const isNew = isNewUser(user);

          return (
            <div key={user.id} className="rounded-[24px] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-forest">
                      {user.firstName} {user.lastName}
                    </p>
                    {isNew && (
                      <Badge className="bg-leaf/15 text-leaf ring-1 ring-leaf/25">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink/60 keep-case">
                    {user.email} · {user.phone}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  {user.addresses[0] && (
                    <p className="mt-1 text-sm text-ink/50">
                      {user.addresses[0].fullAddress}, {user.addresses[0].town}, {user.addresses[0].district}
                    </p>
                  )}
                  <p className="mt-2 text-sm">
                    {theirs.length} orders · {formatBZD(spent)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  disabled={deletingId === user.id}
                  onClick={() =>
                    openDeleteDialog(user.id, `${user.firstName} ${user.lastName}`.trim(), theirs.length)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === user.id ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          );
        })}
        {sortedUsers.length === 0 && <p className="text-ink/50">No customer accounts yet.</p>}
      </div>

      <DeleteCustomerDialog
        target={deleteTarget}
        open={Boolean(deleteTarget)}
        deleting={Boolean(deletingId)}
        error={deleteError}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
