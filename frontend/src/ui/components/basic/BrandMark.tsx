import Image from "next/image";

export default function BrandMark({ size = 55 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      {/* โลโก้จริง (PNG/SVG) */}
      <Image
        src="/brand/corutlylogosvg.svg"
        alt="Courtly logo"
        width={size}
        height={size}
        priority
        style={{ width: size, height: size }}
        className="shrink-0"
      />

      {/* ตัวหนังสือ */}
      <div className="flex flex-col leading-tight">
        <span className="font-bold tracking-wide text-walnut text-xl md:text-xl lg:text-2xl">
          COURTLY
        </span>
        <span className="text-[9.5px] md:text-xs font-medium text-walnut">
          Easy Court, Easy Life
        </span>
      </div>
    </div>
  );
}
