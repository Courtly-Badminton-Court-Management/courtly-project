"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

import AuthHero from "@/ui/components/authpage/AuthHero";
import SplitPage from "@/ui/components/authpage/SplitPage";
import Field from "@/ui/components/basic/Field";
import PrimaryButton from "@/ui/components/basic/PrimaryButton";
import CopyToClipboard from "@/ui/components/basic/CopyToClipboard";

import { useAuthLoginCreate } from "@/api-client/endpoints/auth/auth";
import { customRequest } from "@/api-client/custom-client";
import { setTokens, schedulePreemptiveRefresh } from "@/lib/auth/tokenStore";
import { setSessionCookie } from "@/lib/auth/session";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { extractRoleFromAccess, type Role } from "@/lib/auth/role";
import { X } from "lucide-react";

/* =========================================================
   Types & Schema
========================================================= */
type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

const schema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});

/* =========================================================
   Main Component
========================================================= */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [data, setData] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);


  const loginMutation = useAuthLoginCreate({
    mutation: {
      onSuccess: async (payload: any) => {
        const access = payload?.access;
        const refresh = payload?.refresh;
        if (!access) {
          setFormError("Login failed: missing access token.");
          return;
        }

        setTokens({ access, refresh: refresh ?? null }, data.remember ?? false);
        schedulePreemptiveRefresh(() => {
          refreshAccessToken().catch(() => {});
        });

        let role = extractRoleFromAccess(access) as Role | null;
        if (!role) {
          try {
            const me: any = await customRequest({
              url: "/api/auth/me/",
              method: "GET",
            });
            role = (me?.role ?? "player") as Role;
          } catch (e: any) {
            setFormError(e?.message ?? "Failed to load profile.");
            return;
          }
        }

        setSessionCookie(role, 8);
        router.replace(nextPath ?? (role === "manager" ? "/dashboard" : "/home"));
      },

      onError: (err: any) => {
        const status = err?.response?.status;
        if (status === 400)
          setFormError("Invalid email or password. Please try again.");
        else if (status === 403)
          setFormError("Your account is not yet verified. Please check your email.");
        else if (status === 429)
          setFormError("Too many login attempts. Please wait a moment.");
        else
          setFormError("Server error. Please try again later.");
      },
    },
  });

  /* =========================================================
     Handlers
  ========================================================= */
  const handleChange =
    <K extends keyof LoginForm>(name: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isCheckbox = e.currentTarget.type === "checkbox";
      const value = (
        isCheckbox ? e.currentTarget.checked : e.currentTarget.value
      ) as LoginForm[K];
      setData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [String(name)]: "" }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrs: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        fieldErrs[issue.path.join(".")] = issue.message;
      setErrors(fieldErrs);
      return;
    }
    loginMutation.mutate({
      data: { email: data.email, password: data.password },
    });
  };

  /* =========================================================
     UI - Right Side (Form)
  ========================================================= */
  const Right = (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-5 text-4xl font-extrabold leading-tight md:text-4xl"
      >
        <span className="text-pine">Welcome back,</span>{" "}
        <span className="text-walnut">Player!</span>
      </motion.h2>


      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>
          {formError && (
            <motion.div
              key="form-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm"
            >
              <AlertCircle size={16} /> {formError}
            </motion.div>
          )}
        </AnimatePresence>

        <Field
          type="email"
          label="Email"
          name="email"
          placeholder="e.g. player@email.com"
          value={data.email}
          onChange={handleChange("email")}
          error={errors.email}
        />

        <Field
          type="password"
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={data.password}
          onChange={handleChange("password")}
          error={errors.password}
        />

        <div className="flex items-center justify-between text-sm text-walnut">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={handleChange("remember")}
              className="h-4 w-4 accent-pine"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="underline hover:text-sea"
          >
            Forgot password?
          </button>
        </div>

        <PrimaryButton
          type="submit"
          disabled={loginMutation.isPending}
          aria-busy={loginMutation.isPending}
          className={`mt-8 flex w-full items-center justify-center gap-2 text-white transition-all duration-300 ${
            loginMutation.isPending ? "opacity-80 cursor-wait" : "hover:scale-[1.02]"
          }`}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Signing you in…
            </>
          ) : (
            "Let’s play!"
          )}
        </PrimaryButton>

        <p className="pt-3 text-center text-sm text-walnut">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-sea underline hover:text-sea/80"
          >
            Create one
          </Link>
        </p>

        <div className="mt-5 space-y-1 text-xs text-neutral-500">
          <p className="font-medium text-neutral-700">Mockup credentials</p>
          <p>
            Player:{" "}
            <CopyToClipboard text="sprint4Tester@example.com" />{" "}
            <CopyToClipboard text="Courtly_123" />
          </p>
          <p>
            Manager:{" "}
            <CopyToClipboard text="courtly.project@gmail.com" />{" "}
            <CopyToClipboard text="ISPcourtly_2025" />
          </p>
        </div>
      </form>
    </>


  );

  return (
    <div>
    <SplitPage
      heroPosition="left"
      formSide={
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {Right}
        </motion.div>
      }
      heroSide={<AuthHero side="right" />}
    />

    {/* ================= Forgot Password Modal ================= */}
    
    <AnimatePresence>
      {showForgotModal && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-[min(90%,400px)] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.35 }}
          >
            {/* close icon */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg text-center font-bold text-pine mb-2">
              Forgot password?
            </h2>
            <p className="text-center text-onyx font-medium mb-5">
              please contact our developer via this email, <CopyToClipboard text="courtly.project@gmail.com" />
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => setShowForgotModal(false)}
                className="rounded-xl bg-pine w-full py-2.5 text-sm font-semibold text-white hover:bg-pine/90 transition"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </div>
    
    );
}

/* =========================================================
   Page Wrapper
========================================================= */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-600">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
