import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  name: string;
};

export default function Field({ label, helper, name, ...rest }: Props) {
  return (
    <div>
      {label && <label htmlFor={name} className="block text-sm font-medium">{label}</label>}
      <input id={name} name={name} {...rest}
             className={`mt-1 block w-full rounded-md border p-2 ${rest.className ?? ""}`} />
      {helper && <p className="mt-1 text-xs text-walnut">{helper}</p>}
    </div>
  );
}
