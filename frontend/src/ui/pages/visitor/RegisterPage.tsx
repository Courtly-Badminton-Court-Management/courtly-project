"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, X } from "lucide-react";

import SplitPage from "@/ui/components/authpage/SplitPage";
import AuthHero from "@/ui/components/authpage/AuthHero";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";
import TermsModal from "@/ui/components/authpage/TermsModal";
import { useAuthRegisterCreate } from "@/api-client/endpoints/auth/auth";

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
    accept: z.boolean().refine((v) => v === true, {
      message: "Please accept terms",
    }),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [showTerms, setShowTerms] = useState(false);
  const acceptRef = useRef<HTMLInputElement>(null);

  const registerMutation = useAuthRegisterCreate({
    mutation: {
      onSuccess: (_, variables) => {
        setApiErrors([]);
        router.replace(`/login?email=${encodeURIComponent(variables.data.email)}`);
      },
      onError: (err: any) => {
        const data = err?.response?.data || {};
        const list: string[] = [];

        // 🧩 รวมข้อความทั้งหมดจาก backend
        if (typeof data === "string") list.push(data);
        else if (data && typeof data === "object") {
          for (const v of Object.values(data)) {
            if (Array.isArray(v)) list.push(...v.map(String));
            else if (typeof v === "string") list.push(v);
          }
        }
        if (!list.length) list.push("Registration failed. Please try again.");
        setApiErrors(list);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setApiErrors([]);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries()) as Record<string, any>;
    const parsed = schema.safeParse({
      ...payload,
      accept: payload.accept === "on",
    });

    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() || "root";
        map[key] = issue.message;
      }
      setErrors(map);
      return;
    }

    registerMutation.mutate({
      data: {
        username: payload.username,
        email: payload.email,
        firstname: payload.firstname,
        lastname: payload.lastname,
        password: payload.password,
        confirm: payload.confirm,
        accept: payload.accept === "on",
      },
    });
  };

  return (
    <div className="relative">
      <SplitPage
        heroPosition="right"
        heroSide={<AuthHero side="left" />}
        formSide={
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-extrabold mb-6">
              <span className="text-pine">Game on!</span>{" "}
              <span className="text-walnut">Create an Account!</span>
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Username" name="username" placeholder="e.g. smashtiger88" error={errors.username} />
              <Field type="email" label="Email" name="email" placeholder="e.g. player@email.com" error={errors.email} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Firstname" name="firstname" placeholder="e.g. Tanawat" error={errors.firstname} />
                <Field label="Lastname" name="lastname" placeholder="e.g. Srisawat" error={errors.lastname} />
              </div>

              <Field type="password" label="Password" name="password" placeholder="Must include symbols" error={errors.password} />
              <Field type="password" label="Confirm password" name="confirm" placeholder="Re-enter your password" error={errors.confirm} />

              <label className="mt-5 flex items-center gap-2 text-sm text-onyx">
                <input
                  ref={acceptRef}
                  type="checkbox"
                  name="accept"
                  className="h-4 w-4 rounded border-platinum text-white focus:ring-sea accent-pine"
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="font-semibold text-sea underline underline-offset-2"
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>
              {errors.accept && <span className="text-xs text-red-600">{errors.accept}</span>}

              <div className="mt-6">
                <PrimaryButton
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 text-white transition-all duration-300 hover:scale-[1.02]"

                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Creating account…
                    </>
                  ) : (
                    "Sign up Now!"
                  )}
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
          </motion.div>
        }
      />

      {/* ================= Error Modal ================= */}
      <AnimatePresence>
        {apiErrors.length > 0 && (
          <motion.div
            key="register-error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 left-1/2 z-[999] w-[min(90%,400px)] -translate-x-1/2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                {apiErrors.map((msg, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-[2px]" /> {msg}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setApiErrors([])}
                className="ml-2 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
