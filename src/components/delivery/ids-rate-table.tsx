import { IDS_PACKAGE_TIERS, idsPackageLabel } from "@/lib/ids-rates";
import { formatBZD } from "@/lib/utils";
import type { IdsRates } from "@/types";

export function IdsRateTable({ rates }: { rates: IdsRates }) {
  const central = rates.zones["central-northern"];
  const south = rates.zones.south;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead>
          <tr className="border-b border-forest/10 text-xs text-ink/45">
            <th className="pb-2 pr-3 font-semibold">Package</th>
            <th className="pb-2 pr-3 font-semibold">{central.label}</th>
            <th className="pb-2 font-semibold">{south.label}</th>
          </tr>
        </thead>
        <tbody>
          {IDS_PACKAGE_TIERS.filter((tier) => tier !== "envelope").map((tier) => (
            <tr key={tier} className="border-b border-forest/5">
              <td className="py-2 pr-3 text-ink/70">{idsPackageLabel(tier, rates)}</td>
              <td className="py-2 pr-3 tabular-nums text-forest">{formatBZD(central.packages[tier])}</td>
              <td className="py-2 tabular-nums text-forest">{formatBZD(south.packages[tier])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-ink/45">
        {rates.gstNote}. Cayo, Belize, Orange Walk, and Corozal use {central.label} rates. Stann Creek and Toledo use {south.label} rates.
      </p>
      <p className="mt-1 text-xs text-ink/45">{rates.deliverySurcharges.note}</p>
    </div>
  );
}
