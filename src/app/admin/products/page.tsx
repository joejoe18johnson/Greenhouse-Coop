"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/constants";
import {
  applyStockStatus,
  getStockStatus,
  STOCK_STATUS_OPTIONS,
  type StockStatus,
} from "@/lib/product-badges";
import { deleteProduct, getFeaturedProductOrder, getProducts, saveFeaturedProductOrder, upsertProduct } from "@/lib/store";
import { moveFeaturedProduct, sortFeaturedProducts } from "@/lib/featured-products";
import { useProducts } from "@/hooks/use-products";
import { formatBZD, slugify } from "@/lib/utils";
import type { Product, PropagationType } from "@/types";

const empty: Product = {
  id: "",
  name: "",
  category: "Mango",
  price: 15,
  propagationType: "Grafted",
  size: "2-3 ft",
  fruitImage: "/products/mango-fruit.png",
  plantImage: "/products/mango-plant.png",
  description: "",
  flavorProfile: "",
  featured: false,
  limitedSupply: false,
  veryRare: false,
  inStock: true,
};

export default function AdminProductsPage() {
  const catalog = useProducts();
  const [products, setProducts] = useState(catalog);
  const [form, setForm] = useState<Product>(empty);
  const [formStockStatus, setFormStockStatus] = useState<StockStatus>("in-stock");
  const [editing, setEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [featuredOrder, setFeaturedOrder] = useState<string[]>([]);
  const [reordering, setReordering] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  useEffect(() => {
    setProducts(catalog);
  }, [catalog]);

  useEffect(() => {
    setFeaturedOrder(getFeaturedProductOrder());
  }, [catalog, products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.propagationType.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [products, query]);

  const orderedFeatured = useMemo(
    () => sortFeaturedProducts(products, featuredOrder),
    [products, featuredOrder]
  );

  async function moveFeatured(id: string, direction: "up" | "down") {
    setReordering(true);
    setOrderSaved(false);
    try {
      const next = moveFeaturedProduct(featuredOrder, id, direction);
      setFeaturedOrder(next);
      await saveFeaturedProductOrder(next);
      setOrderSaved(true);
      setTimeout(() => setOrderSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update featured order.");
      setFeaturedOrder(getFeaturedProductOrder());
    } finally {
      setReordering(false);
    }
  }

  function refresh() {
    setProducts(getProducts());
    setFeaturedOrder(getFeaturedProductOrder());
  }

  async function setStockStatus(product: Product, status: StockStatus) {
    setError("");
    try {
      await upsertProduct(applyStockStatus(product, status));
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update stock.");
    }
  }

  function openCreate() {
    setForm(empty);
    setFormStockStatus("in-stock");
    setEditing(false);
    setDialogOpen(true);
  }

  function startEdit(product: Product) {
    setForm(product);
    setFormStockStatus(getStockStatus(product));
    setEditing(true);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setForm(empty);
    setFormStockStatus("in-stock");
    setEditing(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const id = form.id || slugify(form.name);
      await upsertProduct(applyStockStatus({ ...form, id }, formStockStatus));
      closeDialog();
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      await deleteProduct(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title font-semibold">Products</h1>
          <p className="mt-2 text-sm text-ink/55">
            Update stock status inline or edit a product in the popup. Changes apply on the shop immediately.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {error && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/50" />
        <Input
          className="pl-11"
          placeholder="Search products by name, category, or ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className="mt-2 text-xs text-ink/45">
        {query.trim()
          ? `${filteredProducts.length} of ${products.length} products`
          : `${products.length} products`}
      </p>

      <section className="mt-8 rounded-[24px] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-forest">Homepage featured order</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/55">
              Control the order of products in the homepage featured carousel. Mark products as{" "}
              <strong>Featured on homepage</strong> when editing, then arrange them here.
            </p>
          </div>
          {orderSaved && <p className="text-sm text-leaf">Featured order saved.</p>}
        </div>
        {orderedFeatured.length ? (
          <ol className="mt-4 space-y-2">
            {orderedFeatured.map((product, index) => (
              <li
                key={product.id}
                className="flex items-center gap-3 rounded-[18px] border border-forest/10 bg-cream/40 px-4 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest/10 text-sm font-semibold text-forest">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-forest">{product.name}</p>
                  <p className="text-xs text-ink/45">{product.category}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${product.name} up`}
                    disabled={reordering || index === 0}
                    onClick={() => void moveFeatured(product.id, "up")}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${product.name} down`}
                    disabled={reordering || index === orderedFeatured.length - 1}
                    onClick={() => void moveFeatured(product.id, "down")}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <button
                    type="button"
                    className="ml-1 text-sm text-forest"
                    onClick={() => startEdit(product)}
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-ink/50">
            No featured products yet. Edit a product and check <strong>Featured on homepage</strong>.
          </p>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogTitle className="font-display text-2xl text-forest">
            {editing ? "Edit product" : "Add product"}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink/55">
            {editing ? `Updating ${form.name || "product"}` : "Create a new catalog item"}
          </DialogDescription>

          <form onSubmit={save} className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Category</Label>
              <Select className="mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Price BZD</Label>
              <NumberInput
                className="mt-1"
                allowDecimal
                min={0}
                value={form.price}
                onChange={(price) => setForm({ ...form, price })}
              />
            </div>
            <div>
              <Label>Propagation</Label>
              <Select
                className="mt-1"
                value={form.propagationType}
                onChange={(e) => setForm({ ...form, propagationType: e.target.value as PropagationType })}
              >
                <option>Grafted</option>
                <option>Air-Layered</option>
                <option>Selective Breeding</option>
                <option>Seedling</option>
              </Select>
            </div>
            <div>
              <Label>Size</Label>
              <Input className="mt-1" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
            </div>
            <div>
              <Label>Stock status</Label>
              <Select
                className="mt-1"
                value={formStockStatus}
                onChange={(e) => setFormStockStatus(e.target.value as StockStatus)}
              >
                {STOCK_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Fruit image path</Label>
              <Input className="mt-1" value={form.fruitImage} onChange={(e) => setForm({ ...form, fruitImage: e.target.value })} />
            </div>
            <div>
              <Label>Tree size image path</Label>
              <Input className="mt-1" value={form.plantImage} onChange={(e) => setForm({ ...form, plantImage: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Flavor profile</Label>
              <Textarea className="mt-1" value={form.flavorProfile} onChange={(e) => setForm({ ...form, flavorProfile: e.target.value })} />
            </div>
            <Checkbox checked={form.featured} onChange={(checked) => setForm({ ...form, featured: checked })} label="Featured on homepage" />
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Update product" : "Add product"}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-6 md:hidden">
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="rounded-[24px] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-forest">{p.name}</p>
                  <p className="text-sm text-ink/50">{p.category}</p>
                </div>
                <p className="shrink-0 font-semibold text-forest">{formatBZD(p.price)}</p>
              </div>
              <div className="mt-3">
                <Label className="text-xs text-ink/45">Stock status</Label>
                <Select
                  className="mt-1 h-10 text-xs"
                  value={getStockStatus(p)}
                  onChange={(e) => setStockStatus(p, e.target.value as StockStatus)}
                >
                  {STOCK_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="mt-3 flex gap-4 text-sm">
                <button className="text-forest" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => {
                    void handleDelete(p.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <p className="rounded-[24px] bg-white p-6 text-center text-sm text-ink/50">
              No products match “{query.trim()}”.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-[24px] bg-white md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-ink/45">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t border-forest/5">
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">{formatBZD(p.price)}</td>
                <td className="p-4">
                  <Select
                    className="h-10 min-w-[11rem] text-xs"
                    value={getStockStatus(p)}
                    onChange={(e) => setStockStatus(p, e.target.value as StockStatus)}
                  >
                    {STOCK_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="p-4 text-right">
                  <button className="mr-3 text-forest" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => {
                      void handleDelete(p.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <p className="p-6 text-center text-sm text-ink/50">No products match “{query.trim()}”.</p>
        )}
      </div>
    </div>
  );
}
