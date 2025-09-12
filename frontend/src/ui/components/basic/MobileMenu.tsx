// src/ui/components/basic/MobileMenu.tsx
"use client";

import Link from "next/link";

type NavItem = {
  name: string;
  href: string;
};

type MobileMenuProps = {
  items: readonly NavItem[];
  isActive: (href: string) => boolean;
  onClose: () => void;
};

export default function MobileMenu({ items, isActive, onClose }: MobileMenuProps) {
  return (
    <ul className="mt-1 flex flex-col">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onClose}
            className={[
              "block rounded-md px-2 py-2 text-[15px] font-semibold",
              isActive(item.href)
                ? "bg-emerald-50 text-emerald-700"
                : "text-neutral-800 hover:bg-neutral-50",
            ].join(" ")}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
