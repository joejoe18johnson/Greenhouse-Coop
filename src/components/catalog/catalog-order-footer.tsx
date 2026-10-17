import { BRAND } from "@/lib/constants";

export function CatalogOrderFooter({ year = new Date().getFullYear() }: { year?: number }) {
  return (
    <footer className="catalog-footer keep-case mt-10 rounded-2xl border border-forest/10 bg-white/80 px-4 py-5 text-sm leading-relaxed text-ink/70 sm:rounded-[24px] sm:px-5">
      <p className="font-display text-lg font-semibold text-forest-dark sm:text-xl">Order online</p>
      <p className="mt-2 text-pretty normal-case">
        Place your order at{" "}
        <a
          href={BRAND.url}
          className="keep-case break-all font-semibold text-forest underline decoration-forest/30 underline-offset-2 hover:decoration-forest"
        >
          {BRAND.url}
        </a>
        , pay by bank transfer with your reference number, and send proof on WhatsApp. Collect at the Belmopan Bus
        Terminal, local delivery nearby, or nationwide courier.
      </p>
      <p className="mt-4 text-xs text-ink/45">
        © {year} {BRAND.name} · {BRAND.tagline}
      </p>
    </footer>
  );
}
