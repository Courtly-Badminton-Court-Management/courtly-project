// src/ui/pages/visitor/RegisterPage.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SplitPage from "@/ui/components/authpage/SplitPage";
import AuthHero from "@/ui/components/authpage/AuthHero";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";
import TermsModal from "../../components/authpage/TermsModal";
import { z } from "zod";
import { useRef, useState } from "react";
import { useAuthRegisterCreate } from  "@/api-client/endpoints/auth/auth";

const schema = z
  .object({
    username: z.string().min(1, "Required"),
    email: z.string().email("Invalid email"),
    firstname: z.string().min(1, "Required"),
    lastname: z.string().min(1, "Required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    confirm: z.string().min(1, "Required"),
    accept: z.boolean().refine((v) => v === true, { message: "Please accept terms" }),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type RegisterPayload = {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirm: string;
  accept: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTerms, setShowTerms] = useState(false);
  const acceptRef = useRef<HTMLInputElement>(null);

  // ✅ Generated mutation
  const registerMutation = useAuthRegisterCreate({
    mutation: {
      onSuccess: (_, variables) => {
        // cleanup any stale tokens just in case
        // redirect with email prefilled
        router.replace(`/login?email=${encodeURIComponent(variables.data.email)}`);
      },
      onError: (e: any) => {
        const map: Record<string, string> = {};
        if (typeof e?.status === "number") {
          map.root = `HTTP ${e.status} ${e.statusText || ""}`.trim();
        }
        if (e && typeof e === "object") {
          for (const [k, v] of Object.entries(e as Record<string, any>)) {
            if (k === "status" || k === "statusText") continue;
            if (k === "non_field_errors") {
              map.root = Array.isArray(v) ? v.join(", ") : String(v);
              continue;
            }
            if (Array.isArray(v)) map[k] = v.join(", ");
            else if (typeof v === "string") map[k] = v;
          }
        }
        if (!Object.keys(map).length && typeof e?.detail === "string") map.root = e.detail;
        if (!Object.keys(map).length) map.root = "Registration failed";
        setErrors(map);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const payload: RegisterPayload = {
      username: String(fd.get("username") ?? ""),
      email: String(fd.get("email") ?? ""),
      firstname: String(fd.get("firstname") ?? ""),
      lastname: String(fd.get("lastname") ?? ""),
      password: String(fd.get("password") ?? ""),
      confirm: String(fd.get("confirm") ?? ""),
      accept: String(fd.get("accept") ?? "") === "on",
    };

    // client-side validation
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() || "root";
        map[key] = issue.message;
      }
      setErrors(map);
      return;
    }

    // ✅ Call generated mutation
    registerMutation.mutate({
      data: {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        confirm: payload.confirm,
        firstname: payload.firstname,
        lastname: payload.lastname,
        accept: payload.accept,
      },
    });
  };

  const Right = (
    <>
      <h2 className="text-4xl md:text-4xl font-extrabold mb-5">
        <span className="text-pine">Game on!</span>{" "}
        <span className="text-walnut">Create an Account.</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {errors.root && <div className="rounded-md border p-3 text-sm text-red-600">{errors.root}</div>}

        <Field label="Username" name="username" placeholder="e.g. smashtiger88" error={errors.username} />
        <Field type="email" label="Email" name="email" placeholder="e.g. player@email.com" error={errors.email} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Firstname" name="firstname" placeholder="e.g. Tanawat" error={errors.firstname} />
          <Field label="Lastname" name="lastname" placeholder="e.g. Srisawat" error={errors.lastname} />
        </div>

        <Field type="password" label="Password" name="password" placeholder="Must be 8+ characters, include symbols" error={errors.password} />
        <Field type="password" label="Confirm password" name="confirm" placeholder="Re-enter your password" error={errors.confirm} />

        <label className="mt-8 flex items-center gap-2 text-sm text-onyx">
          <input ref={acceptRef} type="checkbox" name="accept" className="h-4 w-4 rounded border-platinum text-sea focus:ring-sea" />
          <span>
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="font-semibold text-sea underline underline-offset-2"
            >
              Terms &amp; Conditions
            </button>
          </span>
        </label>
        {errors.accept && <span className="text-xs text-red-600">{errors.accept}</span>}

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={registerMutation.isPending} className="text-white">
            {registerMutation.isPending ? "Please wait…" : "Sign up Now!"}
          </PrimaryButton>
        </div>

        <p className="pt-2 text-center text-sm text-walnut">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sea underline">
            Sign In
          </Link>
        </p>
      </form>

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          if (acceptRef.current) acceptRef.current.checked = true;
        }}
      />
    </>
  );

  return <SplitPage heroPosition="right" heroSide={<AuthHero side="left" />} formSide={Right} />;
}
