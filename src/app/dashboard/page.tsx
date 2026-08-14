"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { getOrders, updateUser } from "@/lib/store";
import { formatBZD, generateId } from "@/lib/utils";
import { useState } from "react";
import locations from "@/data/locations.json";

export default function DashboardPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const orders = user ? getOrders().filter((o) => o.userId === user.id) : [];
  const [addr, setAddr] = useState({
    label: "Home",
    district: "Cayo",
    town: "Belmopan",
    village: "",
    fullAddress: "",
  });

  if (!ready) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  const towns = locations.districts.find((d) => d.name === addr.district)?.towns || [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-leaf">Account</p>
          <h1 className="mt-2 font-display text-4xl text-forest-dark">Hello, {user.firstName}</h1>
        </div>
        <Button variant="outline" onClick={() => { logout(); router.push("/"); }}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="orders" className="mt-10">
        <TabsList>
          <TabsTrigger value="orders" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {orders.length === 0 ? (
            <p className="inline-flex items-center gap-2 text-ink/60">
              <ClipboardList className="h-4 w-4" />
              No orders yet.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block rounded-[24px] bg-white/80 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="inline-flex items-center gap-2 font-semibold text-forest keep-case">
                        <Package className="h-4 w-4" />
                        {order.reference}
                      </p>
                      <p className="text-sm text-ink/50">{new Date(order.createdAt).toLocaleString()} · <span className="keep-case">{order.invoiceNumber}</span></p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={order.status} />
                      <p className="mt-1 text-sm">{formatBZD(order.total)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <div className="rounded-[24px] bg-white/80 p-6 text-sm">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p className="mt-2"><strong>Email:</strong> <span className="keep-case">{user.email}</span></p>
            <p className="mt-2"><strong>Phone:</strong> <span className="keep-case">{user.phone}</span></p>
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-4">
            {user.addresses.map((a) => (
              <div key={a.id} className="rounded-[24px] bg-white/80 p-5">
                <p className="inline-flex items-center gap-2 font-semibold text-forest">
                  <MapPin className="h-4 w-4" />
                  {a.label}{a.isDefault ? " · Default" : ""}
                </p>
                <p className="text-sm text-ink/65">{a.fullAddress}, {a.village} {a.town}, {a.district}</p>
              </div>
            ))}
            <form
              className="rounded-[24px] bg-white/80 p-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                updateUser({
                  ...user,
                  addresses: [
                    ...user.addresses.map((a) => ({ ...a, isDefault: false })),
                    { ...addr, id: generateId("addr"), isDefault: user.addresses.length === 0 },
                  ],
                });
                window.location.reload();
              }}
            >
              <h3 className="font-semibold text-forest">Add address</h3>
              <Input placeholder="Label" value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
              <Select value={addr.district} onChange={(e) => setAddr({ ...addr, district: e.target.value, town: locations.districts.find(d => d.name === e.target.value)?.towns[0] || "" })}>
                {locations.districts.map((d) => <option key={d.name}>{d.name}</option>)}
              </Select>
              <Select value={addr.town} onChange={(e) => setAddr({ ...addr, town: e.target.value })}>
                {towns.map((t) => <option key={t}>{t}</option>)}
              </Select>
              <Input placeholder="Village" value={addr.village} onChange={(e) => setAddr({ ...addr, village: e.target.value })} />
              <Input placeholder="Full address" value={addr.fullAddress} onChange={(e) => setAddr({ ...addr, fullAddress: e.target.value })} />
              <Button type="submit">Save address</Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
