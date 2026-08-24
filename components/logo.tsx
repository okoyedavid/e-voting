import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`logo ${light ? "logo-light" : ""}`} aria-label="E-voting home">
      <span className="logo-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>E-voting</span>
    </Link>
  );
}
