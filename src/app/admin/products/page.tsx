"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES } from "@/lib/constants";
import {
  applyStockStatus,
  getStockStatus,
  STOCK_STATUS_OPTIONS,
  type StockStatus,
} from "@/lib/product-badges";
import { deleteProduct, getProducts, upsertProduct } from "@/lib/store";
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
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProducts(catalog);
  }, [catalog]);

  function refresh() {
    setProducts(getProducts());
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

  function startEdit(product: Product) {
    setForm(product);
    setFormStockStatus(getStockStatus(product));
    setEditing(true);
  }

  function resetForm() {
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
      resetForm();
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
      <h1 className="page-title font-semibold">Products</h1>
      <p className="mt-2 text-sm text-ink/55">
        Update stock status inline or when editing a product. Changes apply on the shop immediately.
      </p>
      {error && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={save} className="mt-6 grid gap-3 rounded-[24px] bg-white p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Name</Label>
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <Label>Category</Label>
          <Select className="mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label>Price BZD</Label>
          <Input className="mt-1" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Propagation</Label>
          <Select className="mt-1" value={form.propagationType} onChange={(e) => setForm({ ...form, propagationType: e.target.value as PropagationType })}>
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
        <Checkbox checked={form.featured} onChange={(checked) => setForm({ ...form, featured: checked })} label="Featured" />
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Update product" : "Add product"}</Button>
          {editing && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8 md:hidden">
        <div className="space-y-3">
          {products.map((p) => (
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
                <button className="text-forest" onClick={() => startEdit(p)}>Edit</button>
                <button className="text-red-600" onClick={() => { void handleDelete(p.id); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 hidden overflow-x-auto rounded-[24px] bg-white md:block">
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
            {products.map((p) => (
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
                  <button className="mr-3 text-forest" onClick={() => startEdit(p)}>Edit</button>
                  <button className="text-red-600" onClick={() => { void handleDelete(p.id); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
