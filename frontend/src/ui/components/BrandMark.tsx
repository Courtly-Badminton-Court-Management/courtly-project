import Image from "next/image";

export default function BrandMark({ size = 70 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/brand/courtly-logo-no-text.png"  // หรือ .svg ถ้ามี
        alt="Courtly logo"
        width={size}
        height={size}
        priority
      />
      <div className="leading-tight">
        <div className="text-2xl md:text-3xl font-extrabold tracking-wide text-onyx">COURTLY</div>
        <div className="text-[11px] md:text-xs text-walnut">Easy Court — Easy Life</div>
      </div>
    </div>
  );
}
