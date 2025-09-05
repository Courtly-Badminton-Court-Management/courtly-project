import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { children, className, ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        "w-full rounded-xl bg-pine py-3 text-lg font-bold text-white",
        "shadow-[0_4px_0_rgba(0,0,0,.12)] hover:translate-y-[1px]",
        "active:translate-y-[2px] transition",
        className || ""
      ].join(" ")}
    >
      {children}
    </button>
  );
}
