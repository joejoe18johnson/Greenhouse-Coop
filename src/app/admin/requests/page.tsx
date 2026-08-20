"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Sprout,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import locations from "@/data/locations.json";
import { useCustomerRequests } from "@/hooks/use-customer-requests";
import { useProducts } from "@/hooks/use-products";
import { getCustomerDirectory, type CustomerDirectoryEntry } from "@/lib/customer-directory";
import {
  CUSTOMER_REQUEST_STATUS_LABEL,
  customerRequestTelHref,
  customerRequestWhatsAppHref,
  formatCustomerRequestPhone,
} from "@/lib/customer-requests";
import {
  createCustomerRequest,
  deleteCustomerRequest,
  updateCustomerRequest,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import type { CustomerRequest, CustomerRequestStatus } from "@/types";
import { WhatsAppIcon } from "@/components/support/whatsapp-icon";

const STATUS_OPTIONS: CustomerRequestStatus[] = [
  "pending",
  "checking",
  "found",
  "notified",
  "closed",
];

const emptyForm = {
  customerName: "",
  phone: "",
  email: "",
  town: "",
  district: "Cayo",
  userId: "" as string | undefined,
  productIds: [] as string[],
  notes: "",
  status: "pending" as CustomerRequestStatus,
};

function statusTone(status: CustomerRequestStatus) {
  switch (status) {
    case "pending":
      return "bg-citrus/30 text-forest";
    case "checking":
      return "bg-sky-100 text-sky-900";
    case "found":
      return "bg-leaf/20 text-forest-dark";
    case "notified":
      return "bg-forest/10 text-forest";
    case "closed":
      return "bg-ink/10 text-ink/55";
    default:
      return "bg-ink/10 text-ink/55";
  }
}

export default function AdminCustomerRequestsPage() {
  const catalog = useProducts();
  const { requests, refresh } = useCustomerRequests();
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const directory = getCustomerDirectory();
  const filteredDirectory = useMemo(() => {
    const q = directoryQuery.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.phone.includes(q) ||
        entry.email?.toLowerCase().includes(q) ||
        entry.town?.toLowerCase().includes(q)
    );
  }, [directory, directoryQuery]);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [requests]
  );

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const list = [...catalog].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [catalog, productQuery]);

  const towns =
    locations.districts.find((d) => d.name === form.district)?.towns ?? [];

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setProductQuery("");
    setError("");
    setDialogOpen(true);
  }

  function openEdit(request: CustomerRequest) {
    setEditingId(request.id);
    setForm({
      customerName: request.customerName,
      phone: request.phone,
      email: request.email ?? "",
      town: request.town ?? "",
      district: request.district ?? "Cayo",
      userId: request.userId,
      productIds: [...request.productIds],
      notes: request.notes ?? "",
      status: request.status,
    });
    setProductQuery("");
    setError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function applyDirectoryEntry(entry: CustomerDirectoryEntry) {
    setForm((prev) => ({
      ...prev,
      customerName: entry.name,
      phone: entry.phone,
      email: entry.email ?? "",
      town: entry.town ?? prev.town,
      district: entry.district ?? prev.district,
      userId: entry.userId,
    }));
    setDialogOpen(true);
    setEditingId(null);
    setError("");
  }

  function toggleProduct(productId: string) {
    setForm((prev) => {
      const has = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: has
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  }

  async function saveRequest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const productNames = form.productIds.map((id) => catalog.find((p) => p.id === id)?.name).filter(Boolean) as string[];

    if (!form.customerName.trim() || !form.phone.trim()) {
      setError("Customer name and phone are required.");
      setSaving(false);
      return;
    }
    if (!form.productIds.length) {
      setError("Select at least one tree to check.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        town: form.town.trim() || undefined,
        district: form.district || undefined,
        userId: form.userId || undefined,
        productIds: form.productIds,
        productNames,
        notes: form.notes.trim() || undefined,
        status: form.status,
      };

      if (editingId) {
        await updateCustomerRequest(editingId, payload);
      } else {
        await createCustomerRequest(payload);
      }

      closeDialog();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save request.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: CustomerRequestStatus) {
    setUpdatingId(id);
    try {
      await updateCustomerRequest(id, { status });
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeRequest(id: string) {
    if (!window.confirm("Remove this customer request?")) return;
    setUpdatingId(id);
    try {
      await deleteCustomerRequest(id);
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    if (!dialogOpen) return;
    void refresh();
  }, [dialogOpen, refresh]);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Customer requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/60">
            Track availability checks when customers ask about specific trees. Pick someone from the
            directory if they already ordered or have an account.
          </p>
        </div>
        <Button variant="default" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add request
        </Button>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-4">
          {sortedRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-[24px] border border-forest/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-forest-dark">{request.customerName}</h2>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        statusTone(request.status)
                      )}
                    >
                      {CUSTOMER_REQUEST_STATUS_LABEL[request.status]}
                    </span>
                    {request.userId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-forest/5 px-2 py-0.5 text-[11px] font-medium text-forest">
                        <UserCheck className="h-3 w-3" />
                        Account
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink/55">
                    {[request.town, request.district].filter(Boolean).join(", ") || "Location not set"}
                  </p>
                </div>
                <Select
                  className="h-9 min-w-[11rem] text-xs"
                  value={request.status}
                  disabled={updatingId === request.id}
                  onChange={(e) => changeStatus(request.id, e.target.value as CustomerRequestStatus)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {CUSTOMER_REQUEST_STATUS_LABEL[status]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <a
                  href={customerRequestTelHref(request.phone)}
                  className="inline-flex items-center gap-1.5 font-medium text-forest keep-case"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {formatCustomerRequestPhone(request.phone)}
                </a>
                {request.email && (
                  <a
                    href={`mailto:${request.email}`}
                    className="inline-flex items-center gap-1.5 text-ink/70 keep-case hover:text-forest"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {request.email}
                  </a>
                )}
              </div>

              <ul className="mt-4 space-y-2">
                {request.productNames.map((name, index) => (
                  <li key={`${request.id}-${name}-${index}`} className="flex items-start gap-2 text-sm text-ink/80">
                    <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>

              {request.notes && (
                <p className="mt-3 rounded-2xl bg-cream/60 px-4 py-3 text-sm text-ink/65">{request.notes}</p>
              )}

              <p className="mt-3 text-[11px] text-ink/40">
                Added{" "}
                {new Date(request.createdAt).toLocaleString("en-BZ", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={customerRequestWhatsAppHref(request.phone, request.productNames)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                >
                  <Button type="button" variant="citrus" size="sm" className="gap-1.5">
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    WhatsApp
                  </Button>
                </a>
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(request)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={updatingId === request.id}
                  onClick={() => removeRequest(request.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </article>
          ))}

          {!sortedRequests.length && (
            <div className="rounded-[24px] border border-dashed border-forest/15 bg-white/70 p-10 text-center">
              <p className="text-ink/55">No customer requests yet.</p>
              <Button variant="default" className="mt-4 gap-2" onClick={openCreate}>
                <UserPlus className="h-4 w-4" />
                Add first request
              </Button>
            </div>
          )}
        </section>

        <aside className="min-w-0 rounded-[24px] border border-forest/10 bg-white p-4 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <h2 className="text-sm font-semibold text-forest">Customer directory</h2>
          <p className="mt-1 text-xs text-ink/55">
            Registered accounts and people from past orders. Click to start a request.
          </p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input
              className="pl-9"
              placeholder="Search name, phone, email…"
              value={directoryQuery}
              onChange={(e) => setDirectoryQuery(e.target.value)}
            />
          </div>
          <ul className="mt-4 max-h-[min(70vh,520px)] space-y-2 overflow-y-auto">
            {filteredDirectory.map((entry) => (
              <li key={entry.key}>
                <button
                  type="button"
                  onClick={() => applyDirectoryEntry(entry)}
                  className="w-full rounded-2xl border border-forest/10 bg-cream/30 px-3 py-3 text-left transition hover:border-forest/25 hover:bg-cream/60"
                >
                  <p className="text-sm font-semibold text-forest-dark">{entry.name}</p>
                  <p className="mt-0.5 text-xs text-ink/55 keep-case">
                    {entry.phone}
                    {entry.email ? ` · ${entry.email}` : ""}
                  </p>
                  {(entry.town || entry.district) && (
                    <p className="mt-1 text-xs text-ink/45">
                      {[entry.town, entry.district].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                    {entry.hasAccount && (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-forest">Account</span>
                    )}
                    {entry.orderCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-citrus/30 px-2 py-0.5 text-forest">
                        <ShoppingBag className="h-3 w-3" />
                        {entry.orderCount} order{entry.orderCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
            {!filteredDirectory.length && (
              <li className="py-6 text-center text-xs text-ink/45">No matching customers.</li>
            )}
          </ul>
          <Link
            href="/admin/customers"
            className="mt-4 inline-block text-xs font-medium text-forest hover:underline"
          >
            View registered accounts →
          </Link>
        </aside>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogTitle>{editingId ? "Edit request" : "Add customer request"}</DialogTitle>
          <DialogDescription>
            Record what a customer asked you to check at the nursery.
          </DialogDescription>

          <form className="mt-4 space-y-4" onSubmit={saveRequest}>
            <div>
              <Label htmlFor="req-name">Customer name</Label>
              <Input
                id="req-name"
                className="mt-1"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="req-phone">Phone</Label>
                <Input
                  id="req-phone"
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="req-email">Email</Label>
                <Input
                  id="req-email"
                  type="email"
                  className="mt-1 keep-case"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="req-district">District</Label>
                <Select
                  id="req-district"
                  className="mt-1"
                  value={form.district}
                  onChange={(e) => {
                    const district = e.target.value;
                    const nextTown =
                      locations.districts.find((d) => d.name === district)?.towns[0] ?? "";
                    setForm({ ...form, district, town: nextTown });
                  }}
                >
                  {locations.districts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="req-town">Town</Label>
                <Select
                  id="req-town"
                  className="mt-1"
                  value={form.town}
                  onChange={(e) => setForm({ ...form, town: e.target.value })}
                >
                  {towns.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Trees to check</Label>
              <Input
                className="mt-1"
                placeholder="Search catalog…"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
              <div className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-2xl border border-forest/10 bg-cream/20 p-2">
                {filteredProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-white/80"
                  >
                    <Checkbox
                      checked={form.productIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                    <span>
                      <span className="font-medium text-forest-dark">{product.name}</span>
                      <span className="ml-2 text-xs text-ink/45">{product.category}</span>
                    </span>
                  </label>
                ))}
              </div>
              {form.productIds.length > 0 && (
                <p className="mt-2 text-xs text-ink/50">{form.productIds.length} selected</p>
              )}
            </div>

            <div>
              <Label htmlFor="req-notes">Notes</Label>
              <Textarea
                id="req-notes"
                className="mt-1"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="How they reached out, timing, etc."
              />
            </div>

            <div>
              <Label htmlFor="req-status">Status</Label>
              <Select
                id="req-status"
                className="mt-1"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CustomerRequestStatus })}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {CUSTOMER_REQUEST_STATUS_LABEL[status]}
                  </option>
                ))}
              </Select>
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Add request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
