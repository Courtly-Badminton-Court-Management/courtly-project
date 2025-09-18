"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterForm } from "@/schemas/register";
import { registerUser } from "@/services/auth";
import { useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
  const [serverError, setServerError] = useState<string|null>(null);
  const [ok, setOk] = useState(false);
  const { register, handleSubmit, formState:{errors,isSubmitting} } =
    useForm<RegisterForm>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null); setOk(false);
    try { await registerUser(values); setOk(true); }
    catch (e:any) {
      const parts:string[]=[];
      for (const k in e){ const v=e[k]; parts.push(Array.isArray(v)? v.join(", "): String(v)); }
      setServerError(parts.join(" | ")||"Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-4">Create your Courtly account</h1>
      {serverError && <div className="mb-3 border p-3 text-sm">{serverError}</div>}
      {ok && <div className="mb-3 border p-3 text-sm">Account created. You can now log in.</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div><label className="block text-sm">Username</label>
          <input className="w-full border rounded-md p-2" {...register("username")} />
          <p className="text-xs text-red-600">{errors.username?.message}</p></div>

        <div><label className="block text-sm">Email</label>
          <input className="w-full border rounded-md p-2" type="email" {...register("email")} />
          <p className="text-xs text-red-600">{errors.email?.message}</p></div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm">First name</label>
            <input className="w-full border rounded-md p-2" {...register("firstname")} /></div>
          <div><label className="block text-sm">Last name</label>
            <input className="w-full border rounded-md p-2" {...register("lastname")} /></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm">Password</label>
            <input className="w-full border rounded-md p-2" type="password" {...register("password")} />
            <p className="text-xs text-red-600">{errors.password?.message}</p></div>
          <div><label className="block text-sm">Confirm</label>
            <input className="w-full border rounded-md p-2" type="password" {...register("confirm")} />
            <p className="text-xs text-red-600">{errors.confirm?.message}</p></div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("accept")} /> I accept the terms
        </label>
        <p className="text-xs text-red-600">{errors.accept?.message}</p>

        <button className="w-full rounded-xl p-2 border disabled:opacity-50" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-center">Already have an account? <Link className="underline" href="/login">Log in</Link></p>
      </form>
    </div>
  );
}
