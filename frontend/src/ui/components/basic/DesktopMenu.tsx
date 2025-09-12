"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { name: string; href: string };

type DesktopMenuProps = {
  items: ReadonlyArray<NavItem>;
  /** ถ้าอยากปรับเงื่อนไข active เอง ส่งฟังก์ชันมาได้ */
  isActive?(pathname: string, href: string): boolean;
  className?: string;
};

export default function DesktopMenu({
  items,
  isActive,
  className = "",
}: DesktopMenuProps) {
  const pathname = usePathname();
  const _isActive =
    isActive ??
    ((p: string, href: string) => p === href || p.startsWith(`${href}/`));

  return (
    <ul className={`hidden items-center gap-2 md:flex ${className}`}>
      {items.map((item) => {
        const active = _isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "relative rounded-md px-3 py-2 text-[15px] font-semibold transition-colors",
                "after:absolute after:left-2 after:right-2 after:-bottom-2 after:h-[3px] after:rounded-full after:transition-transform after:duration-300 after:origin-left",
                !active
                  ? "text-neutral-700 hover:text-pine after:scale-x-0 hover:after:scale-x-100 after:bg-pine"
                  : "",
                active
                  ? "text-emerald-900 bg-emerald-50 after:bg-pine after:scale-x-100"
                  : "",
              ].join(" ")}
            >
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
