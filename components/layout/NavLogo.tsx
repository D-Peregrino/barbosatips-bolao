// components/layout/NavLogo.tsx
import Link from "next/link";

export function NavLogo() {
  return (
    <Link
      href="/"
      aria-label="BarbosaTips — página inicial"
      className="flex items-center gap-2 group flex-shrink-0"
    >
      <span
        aria-hidden="true"
        className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center bg-[#F0B429] text-black text-[11px] font-extrabold leading-none transition-transform duration-200 group-hover:scale-105 select-none"
        style={{ fontFamily: "'Oswald', Georgia, serif" }}
      >
        BT
      </span>

      <span
        className="text-[16px] font-bold text-white tracking-[-0.3px] transition-colors duration-150 group-hover:text-[#F0B429]"
        style={{ fontFamily: "'Oswald', Georgia, serif" }}
      >
        Barbosa<span className="text-[#F0B429]">Tips</span>
      </span>
    </Link>
  );
}