import { ButtonHTMLAttributes } from "react";
import classNames from "classnames";

export default function PrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { children, className, ...rest } = props;

  return (
    <button
      {...rest}
      className={classNames(
        "w-full rounded-xl py-3 px-4 text-lg font-bold shadow-[0_4px_0_rgba(0,0,0,.12)]",
        "bg-pine ",
        "hover:translate-y-[1px] hover:shadow-[0_2px_0_rgba(0,0,0,.15)]",
        "active:translate-y-[2px] active:shadow-[0_0px_0_rgba(0,0,0,.2)]",
        "flex items-center justify-center gap-3",
        "transition-all duration-200 ease-in-out",
        className // safely merged
      )}
    >
      {children}
    </button>
  );
}
