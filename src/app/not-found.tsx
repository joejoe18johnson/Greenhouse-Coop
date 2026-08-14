import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-leaf">404</p>
      <h1 className="mt-3 font-display text-5xl text-forest-dark">This tree isn’t here</h1>
      <p className="mt-4 text-ink/60">The page you wanted may have been moved or is out of season.</p>
      <Button className="mt-8" asChild>
        <Link href="/shop">Back to the shop</Link>
      </Button>
    </div>
  );
}
